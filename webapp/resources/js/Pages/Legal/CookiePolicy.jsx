import BlogLayout from "@/Layouts/BlogLayout";

export default function CookiePolicy() {
    return (
        <BlogLayout>
            <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
                <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>

                <p className="text-sm text-zinc-400 mt-2">
                    Ultimo aggiornamento: {new Date().toLocaleDateString()}
                </p>

                <div className="mt-10 space-y-10 text-sm leading-relaxed text-zinc-300">
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            1. Cosa sono i cookie
                        </h2>
                        <p>
                            I cookie sono piccoli file di testo salvati nel
                            browser dell’utente che permettono il corretto
                            funzionamento del sito e l’analisi delle visite.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            2. Tipologie di cookie utilizzati
                        </h2>

                        <ul className="list-disc ml-5 space-y-3">
                            <li>
                                <strong>Cookie necessari</strong>
                                <br />
                                Essenziali per il funzionamento del sito e non
                                disattivabili.
                            </li>

                            <li>
                                <strong>Cookie analytics</strong>
                                <br />
                                Utilizzati per analizzare il traffico e
                                migliorare i contenuti del sito. Vengono
                                attivati solo previo consenso.
                            </li>

                            <li>
                                <strong>Cookie di personalizzazione</strong>
                                <br />
                                Permettono di adattare contenuti e suggerimenti
                                in base alla navigazione.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            3. Gestione del consenso
                        </h2>
                        <p>
                            L’utente può accettare, rifiutare o modificare le
                            preferenze sui cookie in qualsiasi momento tramite
                            il banner o cancellando i cookie dal browser.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            4. Cookie di terze parti
                        </h2>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>
                                Servizi di analisi traffico (solo con consenso)
                            </li>
                            <li>Servizi di sicurezza e CDN (es. Cloudflare)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            5. Durata dei cookie
                        </h2>
                        <p>
                            Alcuni cookie sono di sessione (vengono eliminati
                            alla chiusura del browser), altri possono rimanere
                            memorizzati per periodi più lunghi in base alla loro
                            funzione.
                        </p>
                    </section>
                </div>
            </div>
        </BlogLayout>
    );
}
