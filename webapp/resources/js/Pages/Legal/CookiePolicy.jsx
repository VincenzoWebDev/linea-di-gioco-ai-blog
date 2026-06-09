import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";

export default function CookiePolicy() {
    return (
        <BlogLayout>
            <SeoHead
                title="Cookie Policy"
                description="Informativa sull'utilizzo dei cookie e delle tecnologie di tracciamento del sito Linea di Gioco."
            />

            <div className="max-w-4xl mx-auto px-4 py-16 text-zinc-200">
                <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>

                <p className="mt-2 text-sm text-zinc-400">
                    Ultimo aggiornamento: 18/05/2026
                </p>

                <div className="mt-10 space-y-10 text-sm leading-relaxed text-zinc-300">
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            1. Cosa sono i cookie
                        </h2>

                        <p>
                            I cookie sono piccoli file di testo salvati sul
                            dispositivo dell’utente durante la navigazione. I
                            cookie permettono il corretto funzionamento del
                            sito, migliorano l’esperienza utente e consentono
                            analisi statistiche sull’utilizzo della piattaforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            2. Tipologie di cookie utilizzati
                        </h2>

                        <ul className="ml-5 list-disc space-y-4">
                            <li>
                                <strong>Cookie tecnici e necessari</strong>
                                <br />
                                Essenziali per il funzionamento del sito, la
                                sicurezza della piattaforma e la gestione delle
                                preferenze di navigazione. Non richiedono
                                consenso preventivo.
                            </li>

                            <li>
                                <strong>Cookie analytics</strong>
                                <br />
                                Utilizzati per raccogliere informazioni
                                statistiche aggregate e anonime sull’utilizzo
                                del sito, al fine di migliorarne prestazioni e
                                contenuti. Vengono attivati solo previo
                                consenso.
                            </li>

                            <li>
                                <strong>Cookie di personalizzazione</strong>
                                <br />
                                Consentono di memorizzare preferenze e
                                impostazioni dell’utente per offrire una
                                navigazione più coerente e personalizzata.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            3. Base giuridica del trattamento
                        </h2>

                        <p>
                            I cookie tecnici vengono utilizzati sulla base del
                            legittimo interesse del titolare a garantire il
                            corretto funzionamento del sito. I cookie analytics
                            e di personalizzazione vengono attivati solo previo
                            consenso esplicito dell’utente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            4. Gestione del consenso
                        </h2>

                        <p>
                            L’utente può accettare, rifiutare o modificare le
                            preferenze relative ai cookie tramite il banner di
                            consenso mostrato durante la navigazione.
                        </p>

                        <p className="mt-3">
                            Il consenso può essere revocato in qualsiasi momento
                            tramite gli strumenti di gestione dei cookie
                            presenti sul sito oppure mediante le impostazioni
                            del proprio browser.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            5. Cookie di terze parti
                        </h2>

                        <ul className="ml-5 list-disc space-y-2">
                            <li>
                                Google Analytics per analisi statistiche del
                                traffico web
                            </li>

                            <li>
                                Servizi di sicurezza, protezione e CDN (es.
                                Cloudflare, se attivo)
                            </li>

                            <li>
                                Eventuali servizi tecnici necessari al corretto
                                funzionamento della piattaforma
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            6. Durata dei cookie
                        </h2>

                        <p>
                            Alcuni cookie vengono eliminati automaticamente alla
                            chiusura del browser (cookie di sessione), mentre
                            altri possono rimanere memorizzati sul dispositivo
                            dell’utente per un periodo variabile in base alla
                            loro funzione e configurazione.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            7. Gestione dei cookie tramite browser
                        </h2>

                        <p>
                            La maggior parte dei browser consente di controllare
                            o disabilitare i cookie tramite le impostazioni di
                            configurazione. La disattivazione dei cookie tecnici
                            potrebbe compromettere alcune funzionalità del sito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            8. Modifiche alla Cookie Policy
                        </h2>

                        <p>
                            La presente Cookie Policy può essere aggiornata nel
                            tempo per adeguamenti tecnici, normativi o
                            funzionali. Gli utenti sono invitati a consultare
                            periodicamente questa pagina.
                        </p>
                    </section>
                </div>
            </div>
        </BlogLayout>
    );
}
