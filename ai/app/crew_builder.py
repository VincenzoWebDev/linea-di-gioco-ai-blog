from __future__ import annotations

import json
import os
import re
from html import unescape
from typing import Any, Dict, Tuple

from .schemas import ArticleOut, ProcessRequest

ITALIAN_HINTS = {
    " il ", " lo ", " la ", " gli ", " le ", " di ", " che ", " per ", " con ", " non ", " una ", " nel ", " sono ", " anche ",
    "diplom", "guerra", "sanzion", "sicurezza", "ministero", "governo", "alleanza", "trattato", "esteri", "parlamento", "presidente",
}

ENGLISH_MARKERS = {
    " the ", " and ", " with ", " from ", " this ", " that ", " will ", " would ", " could ", " should ", "has ", "have ", " had ",
    " not ", " according to ", " breaking ", "source:", "u.s.", "united states", "security council", "foreign policy",
}

ITALIAN_STOPWORDS = {
    "il", "lo", "la", "gli", "le", "di", "che", "per", "con", "nel", "della", "delle", "degli", "una", "un", "sono",
    "anche", "come", "dopo", "prima", "contro", "verso", "dove", "quando", "mentre", "sulla", "sullo", "nella", "nelle",
}

ENGLISH_STOPWORDS = {
    "the", "and", "with", "from", "this", "that", "will", "would", "could", "should", "has", "have", "had", "not", "into",
    "about", "after", "before", "between", "while", "where", "when", "their", "there", "here", "under", "over", "across",
    "according", "report", "reports", "source", "sources", "update", "breaking", "official", "officials",
}


def _source_blob(payload: ProcessRequest) -> str:
    return (
        f"Titolo fonte: {_clean_text(payload.title)}\n"
        f"Summary fonte: {_clean_text(payload.summary)}\n"
        f"URL fonte: {payload.source_url}\n"
        f"Testo fonte:\n{_clean_text(payload.source_content)}\n"
    )


def run_pipeline(payload: ProcessRequest) -> Tuple[ArticleOut, Dict[str, Any]]:
    try:
        article, trace = _run_crewai(payload)
        return article, trace
    except Exception as exc:
        article = _fallback_article(payload)
        return article, {"mode": "fallback", "error": str(exc)}


def _run_crewai(payload: ProcessRequest) -> Tuple[ArticleOut, Dict[str, Any]]:
    from crewai import Agent, Crew, Process, Task

    model = os.getenv("CREWAI_MODEL", "ollama/llama3.1")
    require_json = os.getenv("CREWAI_REQUIRE_JSON", "true").lower() == "true"
    source_blob = _source_blob(payload)

    scout = Agent(
        role="Geopolitical Scout",
        goal="Estrarre i fatti geopolitici principali e verificabili dalla notizia.",
        backstory="Analista senior di politica estera e conflitti internazionali.",
        llm=model,
        verbose=False,
        allow_delegation=False,
    )

    editor = Agent(
        role="Italian Editorial Agent",
        goal="Riscrivere in italiano con stile editoriale proprietario, senza copia letterale.",
        backstory="Caporedattore digitale esperto di adattamento notizie internazionali.",
        llm=model,
        verbose=False,
        allow_delegation=False,
    )

    dispatch_prep = Agent(
        role="Dispatch Preparation Agent",
        goal="Validare formato e qualità del payload finale destinato a Laravel.",
        backstory="Editor tecnico responsabile qualità e conformità del JSON di uscita.",
        llm=model,
        verbose=False,
        allow_delegation=False,
    )

    t1 = Task(
        description=(
            "Estrai 5-8 fatti geopolitici chiave in italiano, evitando opinioni e dettagli non pertinenti. "
            f"\n\nMATERIALE:\n{source_blob}"
        ),
        expected_output="Elenco puntato fatti geopolitici essenziali.",
        agent=scout,
    )

    json_clause = (
        "Output SOLO JSON valido con chiavi: title, summary, content, topic, categories, quality_score, source_url."
        if require_json
        else "Output preferibilmente JSON con chiavi: title, summary, content, topic, categories, quality_score, source_url."
    )

    t2 = Task(
        description=(
            "Partendo dai fatti estratti, scrivi un articolo originale obbligatoriamente in italiano (600-1400 caratteri), "
            "tono giornalistico professionale, senza copiare frasi dalla fonte. "
            "Vietato usare frasi in inglese, salvo nomi propri internazionali. "
            f'Chiudi sempre con: "Fonte: {payload.source_url}". {json_clause}'
        ),
        expected_output="JSON articolo pronto per validazione.",
        agent=editor,
        context=[t1],
    )

    t3 = Task(
        description=(
            "Controlla qualità finale, correggi eventuali errori di formato e restituisci JSON definitivo. "
            "quality_score deve essere un numero 0-100. "
            "Verifica rigorosamente che title/summary/content siano in italiano."
        ),
        expected_output="JSON finale compatibile con Laravel ingest.",
        agent=dispatch_prep,
        context=[t2],
    )

    crew = Crew(
        agents=[scout, editor, dispatch_prep],
        tasks=[t1, t2, t3],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    raw = str(result)
    data = _parse_maybe_json(raw)

    title = _clean_text(str(data.get("title", "")).strip())[:140]
    summary = _clean_text(str(data.get("summary", "")).strip())[:240]
    content = _clean_text(str(data.get("content", "")).strip())[:14000]

    title, summary, content = _ensure_italian_output(
        title=title,
        summary=summary,
        content=content,
        source_url=str(payload.source_url),
        model=model,
    )

    article = ArticleOut(
        title=title,
        summary=summary,
        content=content,
        topic=_clean_text(str(data.get("topic", "geopolitica")).strip())[:60] or "geopolitica",
        categories=_normalize_categories(data.get("categories"), data.get("topic", "geopolitica")),
        quality_score=float(data.get("quality_score", 0)),
        source_url=str(data.get("source_url", payload.source_url)),
    )

    if "fonte:" not in article.content.lower():
        article.content = f"{article.content}\n\nFonte: {payload.source_url}"

    if not article.title or not article.content:
        raise ValueError("Crew output incompleto")

    if article.quality_score <= 0:
        article.quality_score = _estimated_quality(article.title, article.content)

    return article, {"mode": "crewai"}


def _ensure_italian_output(title: str, summary: str, content: str, source_url: str, model: str) -> tuple[str, str, str]:
    candidate = (title, summary, content)
    if _is_italian_text(f"{title} {summary} {content}"):
        return candidate

    translated = _force_italian(
        title=title,
        summary=summary,
        content=content,
        source_url=source_url,
        model=model,
        strict=True,
        extra_strict=False,
    )
    if translated:
        candidate = (
            _clean_text(translated.get("title", title))[:140],
            _clean_text(translated.get("summary", summary))[:240],
            _clean_text(translated.get("content", content))[:14000],
        )
        if _is_italian_text(f"{candidate[0]} {candidate[1]} {candidate[2]}"):
            return candidate

    # Secondo pass ancora piu rigido
    translated2 = _force_italian(
        title=candidate[0],
        summary=candidate[1],
        content=candidate[2],
        source_url=source_url,
        model=model,
        strict=True,
        extra_strict=True,
    )
    if translated2:
        candidate = (
            _clean_text(translated2.get("title", candidate[0]))[:140],
            _clean_text(translated2.get("summary", candidate[1]))[:240],
            _clean_text(translated2.get("content", candidate[2]))[:14000],
        )

    if not _is_italian_text(f"{candidate[0]} {candidate[1]} {candidate[2]}"):
        raise ValueError("output_non_italiano")

    return candidate


def _parse_maybe_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    m = re.search(r"\{.*\}", text, flags=re.S)
    if not m:
        raise ValueError("Output non JSON")
    parsed = json.loads(m.group(0))
    if not isinstance(parsed, dict):
        raise ValueError("JSON non oggetto")
    return parsed


def _fallback_article(payload: ProcessRequest) -> ArticleOut:
    base = _clean_text(payload.source_content or payload.summary or payload.title)
    body = base[:1200]
    if "fonte:" not in body.lower():
        body = f"{body}\n\nFonte: {payload.source_url}"

    title = _clean_text(payload.title or "Aggiornamento geopolitico")[:140]
    summary = _clean_text(payload.summary or base[:220])[:240]

    try:
        title, summary, body = _ensure_italian_output(
            title=title,
            summary=summary,
            content=body,
            source_url=str(payload.source_url),
            model=os.getenv("CREWAI_MODEL", "ollama/llama3.1"),
        )
        quality = _estimated_quality(title, body)
    except Exception:
        # Fallback sicuro: non pubblicabile, verra scartato da Laravel per quality bassa
        title = "Notizia non traducibile automaticamente"
        summary = "Contenuto scartato: traduzione italiana non affidabile."
        body = f"Impossibile ottenere una riscrittura italiana affidabile. Fonte: {payload.source_url}"
        quality = 0.0

    return ArticleOut(
        title=title if title else "Aggiornamento geopolitico",
        summary=summary,
        content=body,
        topic="geopolitica",
        categories=["geopolitica"],
        quality_score=quality,
        source_url=str(payload.source_url),
    )


def _normalize_categories(raw: Any, topic_fallback: Any) -> list[str]:
    if isinstance(raw, list):
        categories = [str(item).strip() for item in raw if str(item).strip()]
    else:
        categories = []

    if not categories:
        topic = _clean_text(str(topic_fallback or "").strip())
        if topic:
            categories = [topic]

    if not categories:
        categories = ["geopolitica"]

    unique: list[str] = []
    seen: set[str] = set()
    blocked = {"news", "notizie", "varie", "general", "generale"}
    for value in categories:
        normalized = _clean_text(value)[:120]
        if not normalized:
            continue
        key = normalized.lower()
        if key in blocked:
            continue
        if key in seen:
            continue
        seen.add(key)
        unique.append(normalized)
        if len(unique) >= 3:
            break

    return unique or ["geopolitica"]


def _force_italian(
    title: str,
    summary: str,
    content: str,
    source_url: str,
    model: str,
    strict: bool = False,
    extra_strict: bool = False,
) -> Dict[str, str] | None:
    try:
        from crewai import Agent, Crew, Process, Task

        translator = Agent(
            role="Traduttore editoriale italiano",
            goal="Convertire integralmente in italiano naturale, eliminando tag HTML.",
            backstory="Editor linguistico specializzato in notizie geopolitiche.",
            llm=model,
            verbose=False,
            allow_delegation=False,
        )

        strict_clause = (
            "Titolo, summary e content devono essere in italiano. "
            "Se necessario riscrivi completamente il testo in italiano corretto. "
            "Non lasciare frasi inglesi."
            if strict
            else ""
        )

        extra_clause = (
            "Regola rigida: evita qualsiasi frase inglese residua, anche nei dettagli. "
            "Mantieni solo nomi propri internazionali (persone, paesi, enti). "
            "Se una frase resta in inglese, riscrivila in italiano."
            if extra_strict
            else ""
        )

        task = Task(
            description=(
                "Riscrivi e traduci in italiano. Rimuovi qualsiasi tag HTML. "
                f"{strict_clause} {extra_clause} "
                "Output SOLO JSON con chiavi title, summary, content. "
                f'Chiudi content con "Fonte: {source_url}".\n\n'
                f"TITLE: {title}\nSUMMARY: {summary}\nCONTENT: {content}"
            ),
            expected_output="JSON valido in italiano.",
            agent=translator,
        )

        crew = Crew(agents=[translator], tasks=[task], process=Process.sequential, verbose=False)
        raw = str(crew.kickoff())
        data = _parse_maybe_json(raw)

        out = {
            "title": str(data.get("title", "")).strip(),
            "summary": str(data.get("summary", "")).strip(),
            "content": str(data.get("content", "")).strip(),
        }

        if strict and not _is_italian_text(f"{out['title']} {out['summary']} {out['content']}"):
            return None

        return out
    except Exception:
        return None


def _clean_text(text: str) -> str:
    t = unescape(text or "")
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def _tokenize(text: str) -> list[str]:
    low = text.lower()
    return re.findall(r"[a-zàèéìòù']+", low)


def _is_italian_text(text: str) -> bool:
    low = f" {text.lower()} "
    if len(low.strip()) < 40:
        return False

    it_hits = sum(1 for h in ITALIAN_HINTS if h in low)
    en_hits = sum(1 for h in ENGLISH_MARKERS if h in low)

    tokens = _tokenize(text)
    if len(tokens) < 8:
        return False

    it_sw = sum(1 for t in tokens if t in ITALIAN_STOPWORDS)
    en_sw = sum(1 for t in tokens if t in ENGLISH_STOPWORDS)

    if en_hits >= 3 and it_hits < 6:
        return False

    if en_sw >= 5 and en_sw > max(2, int(it_sw * 0.8)):
        return False

    return it_hits >= 4 and it_sw >= 3 and (it_hits + it_sw) >= (en_hits + en_sw)


def _estimated_quality(title: str, content: str) -> float:
    score = 40.0

    if len(title.strip()) >= 18:
        score += 12

    clen = len(content.strip())
    if clen >= 1200:
        score += 25
    elif clen >= 700:
        score += 20
    elif clen >= 350:
        score += 12

    low = content.lower()
    if "fonte:" in low:
        score += 8
    if any(k in low for k in ["nato", "diplom", "sanzion", "guerra", "politica", "geopolit"]):
        score += 10

    return min(score, 100.0)
