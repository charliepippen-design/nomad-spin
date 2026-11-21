## Non sei negato per organizzare i viaggi: ti manca un ordine in cui decidere

Chi lavora da remoto e dice "non so dove andare" quasi sempre ha troppe informazioni, non troppo poche. Reel salvati su Instagram, schede di Nomad List lasciate a metà, un amico che decanta Lisbona, un altro che deve ancora riprendersi dal traffico di Bali, e nessun criterio comune per pesare tutto questo.

Quel senso di blocco, di solito, è un problema di sequenza. Si confrontano le atmosfere prima di aver fissato il budget. Ci si informa sui visti per nomadi digitali senza sapere se servono 30 giorni o 180. Si apre una classifica dei "posti migliori" prima di aver stabilito cosa vuol dire "migliore" per la *propria* settimana di lavoro.

Questa guida è un ordine in cui decidere, non l'ennesima classifica. Prende i cinque vincoli che stabiliscono davvero se una base funziona e li riporta sui filtri reali di Nomad Spin; poi ti mostra come trasformare uno spin in una rosa ristretta di pagine destinazione e (solo dopo) in una prenotazione. Nomad Spin valuta **oltre 780 città** per costo, internet, sicurezza, atmosfera, paesaggio, regione e dati sui visti: lo scopo di questo articolo è usare quei campi con criterio, invece di girare a caso.

Se sai già di volere un approfondimento su una meta precisa, vai direttamente a [Vivere a Bali](/guides/living-in-bali), [Vivere a Bangkok](/guides/living-in-bangkok), [Vivere a Barcellona](/guides/living-in-barcelona), [Vivere a Budapest](/guides/living-in-budapest), [Vivere a Buenos Aires](/guides/living-in-buenos-aires), [Vivere a Città del Capo](/guides/living-in-cape-town), [Vivere a Chiang Mai](/guides/living-in-chiang-mai), [Vivere a Da Nang](/guides/living-in-da-nang), [Vivere a Ho Chi Minh](/guides/living-in-ho-chi-minh-city), [Vivere a Hoi An](/guides/living-in-hoi-an), [Vivere a Kotor](/guides/living-in-kotor), [Vivere a Kuala Lumpur](/guides/living-in-kuala-lumpur), [Vivere a Lisbona](/guides/living-in-lisbon), [Vivere a Madrid](/guides/living-in-madrid), [Vivere a Medellin](/guides/living-in-medellin), [Vivere a Città del Messico](/guides/living-in-mexico-city), [Vivere a Penang](/guides/living-in-penang), [Vivere a Porto](/guides/living-in-porto), [Vivere a Praga](/guides/living-in-prague), [Vivere a Spalato](/guides/living-in-split), [Vivere a Tallinn](/guides/living-in-tallinn), [Vivere a Tbilisi](/guides/living-in-tbilisi), [Vivere a Tirana](/guides/living-in-tirana) oppure [Vivere a Valencia](/guides/living-in-valencia). Se vuoi una classifica *dopo* aver fissato i vincoli, usa [I posti migliori per nomadi digitali nel 2026](/guides/best-places-digital-nomads-2025). Questa pagina serve quando ancora non sai quale di queste strade fa per te.

## I cinque vincoli che contano davvero (e come si traducono in Spin)

Ogni base da nomade che funziona, o che non funziona, dipende da pochi vincoli rigidi. Le preferenze più sfumate contano solo quando su quelli sei stato onesto.

### 1. Tetto di spesa → campi di costo

Spin filtra su una **fascia di budget** mensile. Il campo della città che le corrisponde è `costUSD` (lo stesso numero di `financials.costNomadSingle`, cioè il mese di un nomade che viaggia da solo). È una cifra di riferimento per pianificare (affitto, cibo, trasporti locali e un coworking nella norma), non la promessa che il tuo Airbnb costerà altrettanto.

Quando devi confrontare *come* soggiorneresti, usa gli altri dati economici:

- `financials.costLongTerm`: quanto tende a costare un mese con un contratto più lungo o a prezzi da residente, rispetto a un mese di esplorazione
- `financials.airbnbMedian`: il costo a notte quando sei ancora in ricognizione e stai provando un quartiere
- `financials.rentIndex`: la pressione relativa sugli affitti rispetto alle altre città del dataset

Qualche punto fermo dal dataset (`costUSD` mensile per un nomade da solo): [Da Nang](/destinations/da-nang) a **$700** ([guida per viverci](/guides/living-in-da-nang)), [Chiang Mai](/destinations/chiang-mai) a **$850**, [Tbilisi](/destinations/tbilisi) a **$800**, [Penang](/destinations/penang) a **$800** ([guida per viverci](/guides/living-in-penang)), [Ho Chi Minh](/destinations/ho-chi-minh-city) a **$800** ([guida per viverci](/guides/living-in-ho-chi-minh-city)), [Buenos Aires](/destinations/buenos-aires) a **$900** ([guida per viverci](/guides/living-in-buenos-aires)), [Kuala Lumpur](/destinations/kuala-lumpur) a **$1.000** ([guida per viverci](/guides/living-in-kuala-lumpur)), [Tirana](/destinations/tirana) a **$1.150** ([guida per viverci](/guides/living-in-tirana)), [Kotor](/destinations/kotor) a **$1.250** ([guida per viverci](/guides/living-in-kotor)), [Città del Messico](/destinations/mexico-city) a **$1.300**, [Budapest](/destinations/budapest) a **$1.500** ([guida per viverci](/guides/living-in-budapest)), [Tallinn](/destinations/tallinn) a **$1.600** ([guida per viverci](/guides/living-in-tallinn)), [Praga](/destinations/prague) a **$1.700** ([guida per viverci](/guides/living-in-prague)), [Porto](/destinations/porto) a **$1.800** ([guida per viverci](/guides/living-in-porto)), [Spalato](/destinations/split) a **$1.800** ([guida per viverci](/guides/living-in-split)), [Valencia](/destinations/valencia) a **$1.900** ([guida per viverci](/guides/living-in-valencia)), [Lisbona](/destinations/lisbon) a **$2.200**, [Madrid](/destinations/madrid) a **$2.200** ([guida per viverci](/guides/living-in-madrid)), [Barcellona](/destinations/barcelona) a **$2.500** ([guida per viverci](/guides/living-in-barcelona)). Se il tuo tetto reale è $1.400 e continui a tenere "magari Lisbona" nel mucchio senza alzare il cursore del budget, non stai facendo ricerca: stai discutendo con te stesso.

### 2. Affidabilità sul lavoro → internet e infrastrutture

Alle riunioni delle tue foto al tramonto non importa nulla. La preferenza **internet minimo** di Spin viene valutata su `internetMbps` (allineato a `infra.internetSpeedAvg`). I campi che smascherano chi guarda solo i Mbps da copertina sono questi:

- `infra.internetReliability` (da 1 a 10): quanto spesso la connessione che paghi regge davvero
- `infra.powerGridStability` (da 1 a 10): distacchi programmati e cali di tensione fanno saltare le call quanto un WiFi scadente
- `infra.coworkingDensity` (`High` / `Med` / `Low`): se hai una stanza di riserva quando internet a casa ti pianta in asso

Lisbona dichiara **200 Mbps** con affidabilità **9** e rete elettrica **9**. È nella [guida su Lisbona](/guides/living-in-lisbon) che trovi la fascia da $2.200, i quartieri e le pratiche del D8, cose che il dato in Mbps non ti dice. Porto dichiara gli stessi **200 Mbps**, affidabilità **9** e rete elettrica **9**, con coworking **Media** e sicurezza **9,0**; è nella [guida su Porto](/guides/living-in-porto) che trovi la fascia da $1.800, Cedofeita contro Bonfim e il prezzo da pagare per un inverno piovoso, cose che il dato in Mbps non ti dice. Budapest dichiara gli stessi **200 Mbps**, affidabilità **9** e rete elettrica **9** a **$1.500**. È nella [guida su Budapest](/guides/living-in-budapest) che trovi il VII distretto contro Buda, l'inverno e la White Card, cose che il dato in Mbps non ti dice. Praga dichiara gli stessi **200 Mbps**, affidabilità **9** e rete elettrica **9**, con coworking **Alta**, a **$1.700** e sicurezza **8,8**. È nella [guida su Praga](/guides/living-in-prague) che trovi Vinohrady contro la Città Vecchia, gli inverni freddi e il bivio tra visto da freelance e visto da dipendente, cose che il dato in Mbps non ti dice. Tallinn dichiara **300 Mbps**, affidabilità **10** e rete elettrica **9**, con coworking **Media**, a **$1.600** e sicurezza **9,2**. È nella [guida su Tallinn](/guides/living-in-tallinn) che trovi l'e-Residency contro il visto D per il telelavoro, Kalamaja contro la Città Vecchia e gli inverni bui, cose che il dato in Mbps non ti dice. Città del Capo sulla carta può esibire **100 Mbps** mentre `powerGridStability` resta a **4**: ecco perché la [guida su Città del Capo](/guides/living-in-cape-town) dedica parecchio spazio a gruppi di continuità e coworking di riserva. Bali ha una media di **50 Mbps** con affidabilità **5**; la [guida su Bali](/guides/living-in-bali) non gira intorno alla fibra che cambia da una strada all'altra e alle SIM di scorta. Chiang Mai ha una media di **95 Mbps** con affidabilità **8** e rete elettrica **8**; è nella [guida su Chiang Mai](/guides/living-in-chiang-mai) che trovi la scelta del quartiere e la stagione dei roghi, cose che il dato in Mbps non ti dice. Città del Messico ha una media di **90 Mbps** con affidabilità **7** e rete elettrica **7**; è nella [guida su Città del Messico](/guides/living-in-mexico-city) che trovi l'altitudine, la qualità dell'aria e Roma contro Condesa, cose che il dato in Mbps non ti dice. Da Nang ha una media di **80 Mbps** con affidabilità **7** e rete elettrica **7**; è nella [guida su Da Nang](/guides/living-in-da-nang) che trovi An Thuong contro Hai Chau e la finestra dei tifoni tra settembre e dicembre, cose che il dato in Mbps non ti dice. Ho Chi Minh ha una media di **85 Mbps** con affidabilità **7** e rete elettrica **7**, coworking **Alta**; è nella [guida su Ho Chi Minh](/guides/living-in-ho-chi-minh-city) che trovi il Distretto 1 contro Thao Dien, il traffico e la stagione secca da dicembre ad aprile, cose che il dato in Mbps non ti dice. Kuala Lumpur ha una media di **100 Mbps** con affidabilità **8** e rete elettrica **8**, coworking **Alta**; è nella [guida su Kuala Lumpur](/guides/living-in-kuala-lumpur) che trovi Bangsar contro Mont Kiara, il pass DE Rantau e i mesi di foschia e monsone, cose che il dato in Mbps non ti dice. Penang ha una media di **80 Mbps** con affidabilità **7** e rete elettrica **8**, coworking **Media**; è nella [guida su Penang](/guides/living-in-penang) che trovi George Town contro i condomini della costa nord, la lista corta dei coworking e le piogge tra settembre e novembre, cose che il dato in Mbps non ti dice. Medellin ha una media di **80 Mbps** con affidabilità **7** e rete elettrica **7**; è nella [guida su Medellin](/guides/living-in-medellin) che trovi Laureles contro El Poblado, lo spagnolo e i punteggi di sicurezza, cose che il dato in Mbps non ti dice. Bangkok ha una media di **120 Mbps** con affidabilità **8** e rete elettrica **8**; è nella [guida su Bangkok](/guides/living-in-bangkok) che trovi la scelta del quartiere lungo la BTS, il caldo e il traffico, cose che il dato in Mbps non ti dice. Tbilisi ha una media di **60 Mbps** con affidabilità **7** e rete elettrica **7**, e densità di coworking **Media**; è nella [guida su Tbilisi](/guides/living-in-tbilisi) che trovi il campo dei 365 giorni senza visto, l'inverno e quella mappa di coworking da "Media", cose che il dato in Mbps non ti dice. Barcellona ha una media di **300 Mbps** con affidabilità **9** e rete elettrica **9**, coworking **Alta**; è nella [guida su Barcellona](/guides/living-in-barcelona) che trovi la fascia da $2.500, gli affitti e la scelta di un'alternativa simile ma più economica, cose che il dato in Mbps non ti dice. Valencia ha una media di **170 Mbps** con affidabilità **9** e rete elettrica **9**, coworking **Media**; è nella [guida su Valencia](/guides/living-in-valencia) che trovi la fascia da $1.900, Ruzafa contro Cabanyal e il calendario delle alluvioni di ottobre, cose che il dato in Mbps non ti dice. Hoi An ha una media di **80 Mbps** con affidabilità stimata **7** e rete elettrica stimata **7**, e densità di coworking **Bassa**; è nella [guida su Hoi An](/guides/living-in-hoi-an) che trovi la Città Vecchia contro An Bang e la finestra delle alluvioni tra settembre e novembre, cose che il dato in Mbps non ti dice. Madrid ha una media di **200 Mbps** con affidabilità **9** e rete elettrica **9**, coworking **Alta**; è nella [guida su Madrid](/guides/living-in-madrid) che trovi la fascia da $2.200, la scelta di rinunciare al mare e la regola del caldo di luglio e agosto, cose che il dato in Mbps non ti dice. Spalato ha una media di **100 Mbps** con affidabilità **8** e rete elettrica **8**, coworking **Media**; è nella [guida su Spalato](/guides/living-in-split) che trovi la scelta tra Città Vecchia e Varos, la folla di luglio e agosto e il soggiorno temporaneo croato per nomadi, cose che il dato in Mbps non ti dice. Tirana ha una media di **90 Mbps** con affidabilità stimata **7** e rete elettrica stimata **9**, e densità di coworking **Bassa**; è nella [guida su Tirana](/guides/living-in-tirana) che trovi Blloku contro i quartieri residenziali, la mappa scarna dei coworking e la regola standard dei 90 giorni su 180 contro il permesso unico, cose che il dato in Mbps non ti dice. Kotor ha una media di **70 Mbps** con affidabilità stimata **7** e rete elettrica stimata **9**, e densità di coworking **Bassa**; è nella [guida su Kotor](/guides/living-in-kotor) che trovi la Città Vecchia contro Dobrota e Prcanj, i giorni delle navi da crociera e la regola standard montenegrina dei 90 giorni su 180 contro il permesso per nomadi digitali, cose che il dato in Mbps non ti dice. Buenos Aires ha una media di **70 Mbps** con affidabilità **6** e rete elettrica **6**, e densità di coworking **Media**; è nella [guida su Buenos Aires](/guides/living-in-buenos-aires) che trovi l'inflazione, Palermo contro Villa Crespo e quel punteggio di affidabilità, cose che il dato in Mbps non ti dice. Se il tuo lavoro è fatto di riunioni, tratta affidabilità e rete elettrica come filtri rigidi, non come note a piè di pagina.

### 3. Soglia di sicurezza personale → punteggi di sicurezza

La **sicurezza minima** di Spin corrisponde al punteggio complessivo `safety` della città (più o meno da 1 a 10). Scendi di un livello con `vibeMetrics.femaleSafety` e `vibeMetrics.lgbtFriendly` quando per te sono irrinunciabili: una città può avere un buon punteggio complessivo ed essere comunque poco adatta alla tua situazione.

Esempi da righe verificate: Porto `safety` **9,0** (femaleSafety **9**, lgbtFriendly **8**); Lisbona **8,8** (femaleSafety **8**, lgbtFriendly **9**); Chiang Mai **8,2** / **8** / **6**; Città del Messico **6,0** / **5** / **7**; Medellín **6,5** / **5** / **6**; Buenos Aires **6,2** / **5** / **8**; Città del Capo **5,5** / **4** / **7**. Un punteggio più basso non vuol dire "non andarci mai": vuol dire "metti in conto la scelta della zona, le abitudini negli spostamenti e una ricerca seria sul quartiere prima di prenotare tre mesi".

### 4. Carattere del posto → atmosfera e paesaggio

Quando budget, internet e sicurezza superano l'asticella, regola le preferenze più sfumate: i tag `vibe[]` (per esempio `workhub`, `beach`, `party`, `mountain`, `foodie`, `adventure`) e `landscape[]` (`seaside`, `mountain`, `urban`, `rural`, `island`, `desert`). Spin valuta anche vita notturna contro concentrazione con `vibeMetrics.nightlife`, e quanto è viva e connessa la scena con `vibeMetrics.communitySize`.

Chiang Mai tende a `workhub` + `mountain`, con vita notturna **5** e community **9**: produttiva e socievole, senza spiaggia. Budapest tende a `party` + `workhub`, con vita notturna **9**. Se nella tua testa continui a scegliere "lavoro profondo in tranquillità" ma nell'interfaccia lasci la vita notturna senza vincoli, Spin ti servirà volentieri capitali della festa che corrispondono agli altri tuoi numeri.

### 5. Attrito del soggiorno → visto, fuso orario, lingua

Il vincolo che tutti romanzano e nessuno definisce bene: per quanto tempo puoi restare legalmente, e quanto sarà faticosa la vita di tutti i giorni.

- `meta.visaType` + `meta.visaDays` (riportati anche in `visa.type` / `visa.days`): esenzione, visto all'arrivo, visto per nomadi digitali, ingresso senza visto e così via
- `meta.timeZoneUtc`: micidiale se hai standup a orari fissi con gli Stati Uniti o con l'Europa
- `language`: l'attrito quotidiano fuori dalle bolle anglofone dei coworking

Tbilisi: **Senza visto**, **365** giorni, `UTC+4`. Lisbona: **Esenzione dal visto**, **90** giorni su 180 (soggiorno breve Schengen). La strada per il lavoro da remoto sta nella nota sul visto, e il percorso verso il permesso di soggiorno è più lungo (vedi la guida su Lisbona). Budapest: **Visto per nomadi digitali**, **365** giorni. Quel campo è la White Card ungherese, e al momento le pagine ufficiali sul reddito richiesto non coincidono tra loro (vedi la [guida su Budapest](/guides/living-in-budapest)). Praga: **Visto per freelance**, **365** giorni, `UTC+1`. Quel campo non è un visto per nomadi digitali che ritiri all'arrivo. Rimanda a un percorso con licenza commerciale, e la Cechia ha anche un Digital Nomad Program separato per alcuni passaporti (vedi la [guida su Praga](/guides/living-in-prague)). Tallinn: **Visto per nomadi digitali**, **365** giorni, `UTC+2`. Quel campo è il visto D estone di lunga durata per il telelavoro, non l'e-Residency (vedi la [guida su Tallinn](/guides/living-in-tallinn)). Valencia, Barcellona e Madrid: **Esenzione dal visto**, **90** giorni su 180. Per queste righe la strada più lunga è il visto consolare spagnolo per il telelavoro, della durata di 1 anno, mentre il permesso di soggiorno richiesto dalla Spagna può arrivare a 3 anni (vedi la [guida su Valencia](/guides/living-in-valencia) e la [guida su Madrid](/guides/living-in-madrid)). Spalato: **soggiorno breve Schengen**, **90** giorni su 180 per molti passaporti, `UTC+1`. La strada più lunga per il lavoro da remoto è il soggiorno temporaneo croato per nomadi digitali (cittadini non UE, non SEE e non svizzeri), concesso fino a 18 mesi con domanda sulla pagina del Ministero dell'Interno (vedi la [guida su Spalato](/guides/living-in-split)). Città del Messico: **Esenzione dal visto**, **180** giorni. Medellín: **Esenzione dal visto**, **90** giorni, `UTC-5` (vedi la [guida su Medellin](/guides/living-in-medellin)). Buenos Aires: **Esenzione dal visto**, **90** giorni, `UTC-3` (vedi la [guida su Buenos Aires](/guides/living-in-buenos-aires)). Lì la strada più lunga per il lavoro da remoto è una pratica a parte presso Migraciones. Chiang Mai e Bangkok: **Esenzione dal visto turistico**, **30** giorni (dipende dal passaporto, solo turismo; il DTV è il percorso per i soggiorni lunghi; vedi la [guida su Bangkok](/guides/living-in-bangkok)). Bali: **Visto all'arrivo**, **30** giorni (proroghe e soggiorni più lunghi sono un problema di pianificazione a parte, vedi la guida su Bali). Tirana: **Esenzione dal visto**, **90** giorni su 180 per la maggior parte dei passaporti esenti da visto, `UTC+1`. La strada più lunga per il lavoro da remoto è il permesso unico albanese di un anno per lavoratori digitali mobili (vedi la [guida su Tirana](/guides/living-in-tirana)). Kotor: ingresso senza visto per **90** giorni su 180 per i passaporti in elenco, contati dal primo ingresso, `UTC+1`, e il Montenegro è fuori da Schengen. La strada più lunga per il lavoro da remoto è il permesso di soggiorno temporaneo montenegrino per nomadi digitali, fino a 2 anni, da richiedere di persona (vedi la [guida su Kotor](/guides/living-in-kotor)). Ho Chi Minh e Da Nang: **Visto elettronico**, **90** giorni (non esiste un visto dedicato ai nomadi digitali; vedi le guide per viverci). Kuala Lumpur: **Esenzione dal visto**, **90** giorni per molti passaporti, `UTC+8`. La strada più lunga per il lavoro da remoto è il [DE Rantau Nomad Pass](https://mdec.my/api/media/file/DE-Rantau_Pass_FAQ_v10.pdf) di MDEC, concesso su domanda per un periodo da 3 a 12 mesi (vedi la [guida su Kuala Lumpur](/guides/living-in-kuala-lumpur)). Penang: la stessa **Esenzione dal visto**, **90** giorni per molti passaporti, `UTC+8`, con lo stesso pass DE Rantau come strada più lunga (vedi la [guida su Penang](/guides/living-in-penang)). Una città bellissima con 30 giorni di visto è un prodotto diverso dalla stessa città con una strada che dura un anno.

Quando una riga è contrassegnata `dataSource: "estimated"` invece di `"verified"`, considera i numeri indicativi e verificali prima di impegnare i soldi di una caparra.

## Un ordine semplice per valutare (da seguire prima di aprire Instagram)

1. **Blocca gli irrinunciabili**: tetto di spesa mensile, Mbps minimi che ti servono davvero per lavorare, punteggio di sicurezza minimo che sei disposto ad accettare e giorni di visto minimi per questo viaggio.
2. **Aggiungi le preferenze più sfumate**: regione, paesaggio, tag di atmosfera, tolleranza per la vita notturna.
3. **Solo a quel punto** leggi `pros` / `cons` e apri le pagine destinazione per i compromessi sullo stile di vita.

Chi inverte quest'ordine si innamora di un reel e poi scopre che la città sfora il budget di $800, ha 40 Mbps e un timbro da 30 giorni.

Su Nomad Spin questa sequenza va presa alla lettera: apri le preferenze dalla [home page](/), imposta prima i cursori rigidi, poi regione, atmosfera e paesaggio, e *solo dopo* gira. I filtri rigidi (regione, paesaggio, fascia di budget) restringono il bacino; internet e sicurezza pesano molto sul punteggio di affinità all'interno di quel bacino.

## Tre profili di indecisi → i preset di Spin

Il pannello delle preferenze offre tre preset rapidi. Usali come punto di partenza, poi stringi un cursore alla volta.

### Esploratore attento al budget → Budget Saver

**Preset:** budget **da $500 a $1.500**, internet minimo **20** Mbps, sicurezza minima **5**, tutte le regioni.

Per chi è: sei flessibile su vita notturna e panorami; il mese deve stare dentro un ritmo di spesa tirato. Aspettati un bacino che pende verso posti come Chiang Mai (~$850 / 95 Mbps / sicurezza 8,2) o Tbilisi (~$800 / 60 Mbps / sicurezza 8,0). Dopo uno spin, apri la pagina destinazione e confronta `costLongTerm` con `airbnbMedian`, così non pianifichi un soggiorno di tre mesi ai prezzi delle notti di ricognizione.

### Lavoratore da remoto pieno di riunioni → High Comfort

**Preset:** budget **da $1.500 a $5.000**, internet minimo **150** Mbps, sicurezza minima **8**.

Per chi è: le videochiamate sono il tuo lavoro. Le classifiche turistiche da copertina contano meno di `internetMbps`, `internetReliability` e `powerGridStability`. Lisbona (~$2.200 / **200** Mbps / sicurezza **8,8**) e Budapest (~$1.500 / **200** Mbps / sicurezza **8,3**) rientrano con naturalezza in questa fascia. Se High Comfort non restituisce quasi nulla, allenta *un solo* vincolo (di solito la soglia di sicurezza di un punto, oppure quella di internet da 150 a 100) invece di allargare tutto in una volta.

### Un mese tranquillo di lavoro profondo → Quiet / Productive

**Preset:** budget **da $500 a $3.000**, internet minimo **50**, sicurezza minima **6**, atmosfere orientate a **workhub** / **mountain**, poca vita notturna nelle intenzioni.

Per chi è: vuoi meno mete festaiole proposte in automatico. Sul risultato tieni d'occhio `vibeMetrics.nightlife`: Chiang Mai a **5** risponde alla richiesta meglio di Budapest a **9**, anche se entrambe rientrano in un budget medio. Se ti capitano ancora città con il tag party, aggiungi un paesaggio esplicito (per esempio `mountain`) oppure togli `party` dalla tua rosa mentale e gira di nuovo.

Nessuno di questi preset sostituisce la lettura della pagina destinazione. Servono solo a non farti girare con le preferenze vuote per poi chiamare il risultato "ricerca".

## Come leggere il risultato di uno spin senza rimuginarci troppo

Uno spin restituisce una città principale più alcune alternative vicine, ciascuna con un **punteggio di affinità** rispetto alle tue preferenze. Leggi quel punteggio come "quanto questa riga corrisponde ai filtri che hai impostato", non come una classifica morale delle città.

**Apri la pagina destinazione** (`/destinations/{slug}`) quando:

- I numeri rigidi superano le tue soglie (costo, Mbps, sicurezza, giorni di visto)
- Prima di decidere ti servono `pros` / `cons`, i mesi dal punto di vista del meteo o il dettaglio sul fuso orario
- Stai confrontando due città con punteggi simili

**Gira di nuovo** quando:

- Il risultato non rispetta un irrinunciabile che avevi dimenticato di impostare (per esempio ti serve una sovrapposizione tra `UTC-5` e `UTC-8` e ti è uscito `UTC+7`)
- Ti accorgi che una preferenza sfumata in realtà è rigida (niente spiaggia → imposta il paesaggio; niente grande scena festaiola → alza la preferenza per la tranquillità)
- Il bacino ti sembra identico per tre volte di fila: allenta un cursore del 10-20% e riprova

Un percorso d'esempio: Budget Saver → esce Chiang Mai → leggi [Chiang Mai](/destinations/chiang-mai) e la [guida per viverci](/guides/living-in-chiang-mai) → prendi nota della stagione dei roghi nei `cons` e dei mesi migliori, da novembre a febbraio → accetti quel calendario oppure giri di nuovo con un'altra regione per il periodo in cui viaggi.

## Confrontare senza un foglio di calcolo

Salva **due o tre** spin (o tieni aperte tre schede destinazione) e confronta solo le colonne che decidono una prenotazione:

| Campo | Perché conta |
|---|---|
| `costUSD` rispetto al tuo tetto | Sì o no immediato |
| `internetMbps` + affidabilità / rete elettrica | Rischio per le call |
| `safety` (+ femaleSafety / lgbtFriendly se rilevanti) | Stress quotidiano |
| `meta.visaDays` / `visaType` | Durata del viaggio |
| `meta.timeZoneUtc` | Riunioni a orari umani |
| `pros` / `cons` | Veti sullo stile di vita |

Lascia perdere le classifiche estetiche finché questi sei non sono d'accordo. Una città può stravincere su Instagram e cadere comunque sul fuso orario o sui giorni di visto.

Pagine di riferimento utili per un primo confronto: [Chiang Mai](/destinations/chiang-mai), [Lisbona](/destinations/lisbon), [Tbilisi](/destinations/tbilisi), [Città del Messico](/destinations/mexico-city), [Budapest](/destinations/budapest). Se Lisbona sopravvive al filtro del budget, leggi [Vivere a Lisbona](/guides/living-in-lisbon) prima di versare una caparra. Se sopravvive Budapest, leggi [Vivere a Budapest](/guides/living-in-budapest) prima di versare una caparra. Se sopravvive Praga, leggi [Vivere a Praga](/guides/living-in-prague) prima di versare una caparra. Se sopravvive Tallinn, leggi [Vivere a Tallinn](/guides/living-in-tallinn) prima di versare una caparra. Aggiungi [Bali](/destinations/bali) o [Città del Capo](/destinations/cape-town) solo quando i tuoi filtri (e la tua sopportazione per il traffico o per i distacchi di corrente) puntano davvero lì, poi leggi le guide per viverci prima di versare una caparra.

## Gli errori più comuni

**Ottimizzare l'atmosfera prima del budget.** Ti innamori di un tag "beach", poi scopri che `costUSD` supera il tuo tetto di $900. Rimedio: imposta prima la fascia di budget e lascia che l'atmosfera faccia la classifica *dentro* il bacino che puoi permetterti.

**Ignorare l'affidabilità di corrente e internet.** I Mbps sembrano a posto; `powerGridStability` o `internetReliability` no. Rimedio: se lavori a colpi di riunioni, tratta quei campi infrastrutturali come filtri rigidi, alla pari della velocità.

**Sognare un visto senza guardare `visaDays`.** "Adatta ai nomadi digitali" non è una durata di soggiorno. Rimedio: fissati in testa un numero minimo di giorni (30 / 90 / 180 / 365) e controlla ogni volta `meta.visaType` sulla pagina destinazione.

**Usare una classifica al posto delle preferenze.** Le classifiche rispondono a "cosa ottiene buoni punteggi in generale". Non rispondono a "cosa va bene per il *mio* viaggio da $1.200 / 80 Mbps / sicurezza 7 / 90 giorni". Leggi [I posti migliori del 2026](/guides/best-places-digital-nomads-2025) *dopo* aver fissato quei numeri, oppure usala solo per scoprire candidate da inserire in Spin.

**Trattare le righe stimate come quelle verificate.** Se `dataSource` è estimated, verifica affitti e regole sui visti prima di fare un bonifico.

## E adesso fai così

1. Apri Nomad Spin dalla [home page](/) e imposta budget, internet minimo e sicurezza minima: i tre irrinunciabili.
2. Se vuoi, applica un preset (Budget Saver, High Comfort o Quiet / Productive), poi regola un cursore.
3. Gira una volta. Apri la pagina `/destinations/...` collegata. Controlla costo, Mbps, sicurezza, giorni di visto, fuso orario e contro.
4. Salva un secondo e un terzo spin allentando ogni volta **un solo** vincolo. Confrontali fianco a fianco.
5. Quando una città sopravvive a questo percorso, leggi la guida approfondita se ne abbiamo una ([Bali](/guides/living-in-bali), [Bangkok](/guides/living-in-bangkok), [Barcellona](/guides/living-in-barcelona), [Budapest](/guides/living-in-budapest), [Buenos Aires](/guides/living-in-buenos-aires), [Città del Capo](/guides/living-in-cape-town), [Chiang Mai](/guides/living-in-chiang-mai), [Da Nang](/guides/living-in-da-nang), [Ho Chi Minh](/guides/living-in-ho-chi-minh-city), [Hoi An](/guides/living-in-hoi-an), [Kotor](/guides/living-in-kotor), [Kuala Lumpur](/guides/living-in-kuala-lumpur), [Lisbona](/guides/living-in-lisbon), [Madrid](/guides/living-in-madrid), [Medellin](/guides/living-in-medellin), [Città del Messico](/guides/living-in-mexico-city), [Penang](/guides/living-in-penang), [Porto](/guides/living-in-porto), [Praga](/guides/living-in-prague), [Spalato](/guides/living-in-split), [Tallinn](/guides/living-in-tallinn), [Tbilisi](/guides/living-in-tbilisi), [Tirana](/guides/living-in-tirana), [Valencia](/guides/living-in-valencia)), oppure prosegui dalla pagina destinazione e dalle fonti ufficiali aggiornate sui visti.

Non ti serve una classifica perfetta di oltre 780 città. Ti serve un ciclo ripetibile, filtro → spin → pagina destinazione, che metta fine all'accumulo di schede aperte e ti lasci in mano una base che puoi prenotare davvero.

*Ultimo aggiornamento: ottobre 2026. Costi, regole sui visti e punteggi delle infrastrutture cambiano; prima di partire verifica sempre le fonti ufficiali e gli annunci aggiornati.*
