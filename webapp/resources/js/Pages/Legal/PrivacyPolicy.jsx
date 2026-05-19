import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";

export default function PrivacyPolicy() {
    return (
        <BlogLayout>
            <SeoHead
                title="Privacy Policy"
                description="Informativa sulla privacy e gestione dei dati personali del sito Linea di Gioco."
            />

            <div className="max-w-4xl mx-auto px-4 py-16 text-zinc-200">
                <h1 className="text-3xl font-bold text-white">
                    Privacy Policy
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                    Ultimo aggiornamento:{" "}
                    {new Date().toLocaleDateString("it-IT")}
                </p>

                <div className="mt-10 space-y-10 text-sm leading-relaxed text-zinc-300">
                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            1. Titolare del trattamento
                        </h2>

                        <p>
                            Il titolare del trattamento dei dati è il gestore
                            del sito “Linea di Gioco”. Per richieste relative
                            alla privacy o al trattamento dei dati personali è
                            possibile contattare il titolare tramite i recapiti
                            presenti sul sito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            2. Tipologie di dati raccolti
                        </h2>

                        <ul className="ml-5 list-disc space-y-1">
                            <li>
                                Dati di navigazione (indirizzo IP, user agent,
                                log tecnici del server)
                            </li>

                            <li>
                                Cookie tecnici necessari al funzionamento del
                                sito
                            </li>

                            <li>
                                Cookie opzionali di analytics e misurazione del
                                traffico, attivati solo previo consenso
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            3. Finalità del trattamento
                        </h2>

                        <ul className="ml-5 list-disc space-y-1">
                            <li>
                                Garantire il corretto funzionamento del sito e
                                dei servizi offerti
                            </li>

                            <li>
                                Analizzare traffico, utilizzo e performance dei
                                contenuti
                            </li>

                            <li>
                                Garantire sicurezza, prevenzione abusi e
                                protezione dell’infrastruttura
                            </li>

                            <li>
                                Migliorare esperienza utente e stabilità della
                                piattaforma
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            4. Base giuridica del trattamento
                        </h2>

                        <p>
                            Il trattamento dei dati si basa sul consenso
                            dell’utente per quanto riguarda i cookie opzionali e
                            i servizi analytics, mentre per finalità tecniche,
                            sicurezza e funzionamento del sito il trattamento si
                            basa sul legittimo interesse del titolare.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            5. Conservazione dei dati
                        </h2>

                        <p>
                            I dati tecnici e i log di sicurezza vengono
                            conservati per il tempo strettamente necessario a
                            garantire stabilità, funzionamento e protezione del
                            sistema, salvo diversi obblighi di legge.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            6. Servizi e soggetti terzi
                        </h2>

                        <ul className="ml-5 list-disc space-y-1">
                            <li>Provider hosting VPS e infrastruttura cloud</li>

                            <li>
                                Servizi di sicurezza e CDN (es. Cloudflare, se
                                attivo)
                            </li>

                            <li>
                                Google Analytics per statistiche anonime o
                                aggregate sul traffico del sito
                            </li>

                            <li>
                                Eventuali servizi tecnici necessari al corretto
                                funzionamento della piattaforma
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            7. Cookie e gestione del consenso
                        </h2>

                        <p>
                            Il sito utilizza cookie tecnici necessari al
                            funzionamento della piattaforma e, previo consenso
                            dell’utente, cookie analytics e di misurazione del
                            traffico.
                        </p>

                        <p className="mt-3">
                            Il consenso può essere modificato o revocato in
                            qualsiasi momento tramite gli strumenti di gestione
                            dei cookie presenti sul sito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            8. Trasferimento dei dati
                        </h2>

                        <p>
                            Alcuni servizi di terze parti utilizzati dal sito
                            potrebbero trattare dati al di fuori dello Spazio
                            Economico Europeo (SEE), nel rispetto delle misure
                            previste dalla normativa applicabile e delle
                            clausole contrattuali standard adottate dai
                            fornitori dei servizi.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            9. Condivisione dei dati
                        </h2>

                        <p>
                            I dati personali raccolti non vengono venduti né
                            ceduti a terzi per finalità commerciali o
                            pubblicitarie.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            10. Diritti dell’utente
                        </h2>

                        <p>
                            L’utente può richiedere accesso, rettifica,
                            cancellazione o limitazione del trattamento dei
                            propri dati personali nei limiti previsti dalla
                            normativa applicabile.
                        </p>

                        <p className="mt-3">
                            È inoltre possibile revocare il consenso ai cookie
                            opzionali in qualsiasi momento tramite le
                            impostazioni dedicate presenti sul sito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white">
                            11. Modifiche alla presente informativa
                        </h2>

                        <p>
                            La presente Privacy Policy può essere aggiornata o
                            modificata nel tempo per adeguamenti normativi,
                            tecnici o funzionali del sito. Gli utenti sono
                            invitati a consultare periodicamente questa pagina.
                        </p>
                    </section>
                </div>
            </div>
        </BlogLayout>
    );
}
