import BlogLayout from "@/Layouts/BlogLayout";

export default function PrivacyPolicy() {
    return (
        <BlogLayout>
            <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
                <h1 className="text-3xl font-bold text-white">
                    Privacy Policy
                </h1>

                <p className="text-sm text-zinc-400 mt-2">
                    Ultimo aggiornamento: {new Date().toLocaleDateString()}
                </p>

                <div className="mt-10 space-y-10 text-sm leading-relaxed text-zinc-300">
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            1. Titolare del trattamento
                        </h2>
                        <p>
                            Il titolare del trattamento dei dati è il gestore
                            del sito web. Per qualsiasi richiesta è possibile
                            utilizzare i contatti presenti nella pagina
                            dedicata.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            2. Tipologie di dati raccolti
                        </h2>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>
                                Dati di navigazione (IP, user agent, log tecnici
                                del server)
                            </li>
                            <li>
                                Cookie tecnici necessari al funzionamento del
                                sito
                            </li>
                            <li>
                                Cookie opzionali (analytics e personalizzazione,
                                se attivati)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            3. Finalità del trattamento
                        </h2>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>
                                Fornire corretta navigazione e funzionamento del
                                sito
                            </li>
                            <li>
                                Analizzare traffico e performance dei contenuti
                            </li>
                            <li>Garantire sicurezza e prevenzione abusi</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            4. Base giuridica
                        </h2>
                        <p>
                            Il trattamento dei dati si basa sul consenso
                            dell’utente per i cookie opzionali e sul legittimo
                            interesse per sicurezza, stabilità e funzionamento
                            tecnico del sito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            5. Conservazione dei dati
                        </h2>
                        <p>
                            I dati tecnici vengono conservati per il tempo
                            strettamente necessario al funzionamento del
                            servizio e alla sicurezza del sistema.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            6. Terze parti
                        </h2>
                        <ul className="list-disc ml-5 space-y-1">
                            <li>Provider di hosting VPS</li>
                            <li>
                                Servizi di sicurezza e CDN (es. Cloudflare, se
                                attivo)
                            </li>
                            <li>
                                Servizi di analisi traffico (solo se abilitati
                                con consenso)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            7. Diritti dell’utente
                        </h2>
                        <p>
                            L’utente può richiedere accesso, modifica o
                            cancellazione dei propri dati scrivendo ai contatti
                            del sito. È inoltre possibile revocare il consenso
                            ai cookie in qualsiasi momento.
                        </p>
                    </section>
                </div>
            </div>
        </BlogLayout>
    );
}
