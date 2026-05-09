from __future__ import annotations

import json
import os
import re
import xml.etree.ElementTree as ET
from html import unescape
from typing import Any, Dict, List

import httpx

DEFAULT_SOURCES = [
    {"name": "BBC World", "url": "http://feeds.bbci.co.uk/news/world/rss.xml"},
    {"name": "BBC Middle East", "url": "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml"},
    {"name": "Guardian World", "url": "https://www.theguardian.com/world/rss"},
    {"name": "Guardian Politics", "url": "https://www.theguardian.com/politics/rss"},
    {"name": "Al Jazeera", "url": "https://www.aljazeera.com/xml/rss/all.xml"},
]

ALLOW_KEYWORDS = [
    "geopolit", "war", "conflict", "nato", "united nations", "security council",
    "sanctions", "diplom", "summit", "ceasefire", "military", "ukraine", "russia",
    "china", "taiwan", "middle east", "gaza", "israel", "iran", "election",
    "foreign policy", "state department", "border", "refugees", "energy security",
    "world", "politics", "international",
]

BLOCK_KEYWORDS = [
    "serie a", "champions league", "premier league", "nba", "nfl", "tennis",
    "formula 1", "motogp", "goal", "match", "transfer", "calcio", "basket",
    "gossip", "celebrity", "entertainment", "movie", "music", "lifestyle",
    "meteo", "weather", "drought", "siccita", "siccità",
]

TELEGRAM_NOISE_PATTERNS = [
    r"please\s+open\s+telegram\s+to\s+view\s+this\s+post",
    r"view\s+in\s+telegram",
    r"open\s+in\s+telegram",
    r"join\s+telegram",
    r"photo\b",
    r"video\b",
    r"epstein\s+files\s*-\s*24/7\s+deep\s+dive",
    r"https?://t\.me/\S+",
    r"https?://\S+",
    r"@\w+",
]

EMOJI_RE = re.compile(
    "["
    "\U0001F1E0-\U0001F1FF"
    "\U0001F300-\U0001F5FF"
    "\U0001F600-\U0001F64F"
    "\U0001F680-\U0001F6FF"
    "\U0001F700-\U0001F77F"
    "\U0001F780-\U0001F7FF"
    "\U0001F800-\U0001F8FF"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FAFF"
    "\U00002700-\U000027BF"
    "\U00002600-\U000026FF"
    "]+",
    flags=re.UNICODE,
)


def load_sources() -> List[Dict[str, str]]:
    raw = os.getenv("AI_NEWS_SOURCES_JSON", "").strip()
    if not raw:
        return DEFAULT_SOURCES

    try:
        data = json.loads(raw)
        if isinstance(data, list):
            cleaned = []
            for item in data:
                if not isinstance(item, dict):
                    continue
                name = str(item.get("name", "")).strip()
                url = str(item.get("url", "")).strip()
                if name and url:
                    cleaned.append({"name": name, "url": url})
            if cleaned:
                return cleaned
    except Exception:
        pass

    return DEFAULT_SOURCES


def discover_geopolitical_news(limit_per_source: int = 5) -> List[Dict[str, Any]]:
    timeout = int(os.getenv("AI_SCOUT_TIMEOUT_SECONDS", "15"))
    items: List[Dict[str, Any]] = []

    for source in load_sources():
        feed_items = _fetch_feed(source["name"], source["url"], timeout=timeout)
        count = 0
        for item in feed_items:
            if _is_geopolitical(item.get("title", ""), item.get("summary", "")):
                item["source_name"] = source["name"]
                items.append(item)
                count += 1
                if count >= max(limit_per_source, 1):
                    break

    return items


def _fetch_feed(source_name: str, url: str, timeout: int = 15) -> List[Dict[str, Any]]:
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            response = client.get(url, headers={"User-Agent": "AI-Scout/1.0"})
            if response.status_code >= 400:
                return []
            xml = response.text
    except Exception:
        return []

    try:
        root = ET.fromstring(xml)
    except Exception:
        return []

    items: List[Dict[str, Any]] = []

    rss_items = root.findall(".//channel/item")
    if rss_items:
        for i in rss_items:
            title = _txt(i.find("title"))
            summary = _txt(i.find("description"))
            link = _txt(i.find("link"))
            pub = _txt(i.find("pubDate"))
            guid = _txt(i.find("guid"))

            title, summary = _sanitize_item_text(source_name=source_name, title=title, summary=summary, link=link)
            if title and link:
                items.append(
                    {
                        "external_id": guid or f"{source_name}:{link}",
                        "title": title,
                        "summary": summary,
                        "url": link,
                        "published_at": pub,
                    }
                )
        return items

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    atom_entries = root.findall(".//atom:entry", ns)
    if atom_entries:
        for e in atom_entries:
            title = _txt(e.find("atom:title", ns))
            summary = _txt(e.find("atom:summary", ns)) or _txt(e.find("atom:content", ns))
            link_node = e.find("atom:link", ns)
            link = ""
            if link_node is not None:
                link = str(link_node.attrib.get("href", "")).strip()
            published = _txt(e.find("atom:published", ns)) or _txt(e.find("atom:updated", ns))
            external_id = _txt(e.find("atom:id", ns)) or f"{source_name}:{link}"

            title, summary = _sanitize_item_text(source_name=source_name, title=title, summary=summary, link=link)
            if title and link:
                items.append(
                    {
                        "external_id": external_id,
                        "title": title,
                        "summary": summary,
                        "url": link,
                        "published_at": published,
                    }
                )

    return items


def _txt(node: Any) -> str:
    if node is None or node.text is None:
        return ""
    return _clean_text(str(node.text))


def _clean_text(text: str) -> str:
    t = unescape(text)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def _sanitize_item_text(source_name: str, title: str, summary: str, link: str) -> tuple[str, str]:
    title = _clean_text(title)
    summary = _clean_text(summary)

    if not _is_telegram_source(source_name, link):
        return title, summary

    title = _clean_telegram_text(title)
    summary = _clean_telegram_text(summary)

    if not title:
        title = _derive_title_from_summary(summary)

    summary = _drop_prefixed_title(summary=summary, title=title)

    if not summary:
        summary = title

    if len(summary) < 80:
        summary = _clean_telegram_text(f"{title}. {summary}")

    return title[:220], summary[:5000]


def _is_telegram_source(source_name: str, link: str) -> bool:
    sn = source_name.lower()
    lk = link.lower()
    return "telegram" in sn or "t.me/" in lk


def _clean_telegram_text(text: str) -> str:
    t = _clean_text(text)
    t = EMOJI_RE.sub(" ", t)

    for pat in TELEGRAM_NOISE_PATTERNS:
        t = re.sub(pat, " ", t, flags=re.I)

    t = re.sub(r"\b\w+\s*\|\s*", " ", t)
    t = re.sub(r"[\u200b-\u200f\u2060\ufeff]", " ", t)
    t = re.sub(r"\s+", " ", t).strip(" -|:\n\t")

    return t


def _derive_title_from_summary(summary: str) -> str:
    if not summary:
        return ""

    parts = re.split(r"(?<=[.!?])\s+", summary)
    for part in parts:
        p = part.strip(" -|:\n\t")
        if len(p) >= 28:
            return p[:220]

    return summary[:220]


def _drop_prefixed_title(summary: str, title: str) -> str:
    if not summary or not title:
        return summary

    s_low = summary.lower().strip()
    t_low = title.lower().strip()

    if s_low.startswith(t_low):
        summary = summary[len(title):].lstrip(" .:-|")

    return summary


def _is_geopolitical(title: str, summary: str) -> bool:
    text = f"{title} {summary}".lower()
    if not text.strip():
        return False

    for b in BLOCK_KEYWORDS:
        if b in text:
            return False

    for a in ALLOW_KEYWORDS:
        if a in text:
            return True

    return False
