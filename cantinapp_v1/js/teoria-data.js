// ============================================================
// CantinApp - Dati teorici Assosommelier (Manuale "Missione Vino")
// Estratti dalle pagine 76, 96-118 del manuale ufficiale
// ============================================================
// Ogni voce ha:
//   - titolo: nome che appare nel popup
//   - definizione: testo principale (Assosommelier ufficiale)
//   - cosa_significa: interpretazione pratica (opzionale)
//   - pagina: riferimento manuale (opzionale)
// ============================================================

window.TEORIA = {
  // ============ ESAME VISIVO - COLORE ============
  "colore.paglierino": {
    titolo: "Giallo Paglierino",
    definizione: "Il vino giallo paglierino è un bianco che presenta la classica colorazione giallo chiaro della paglia. È il colore più diffuso dei vini bianchi.",
    cosa_significa: "Tipico di vini con buona maturazione, generalmente senza affinamento in legno e comunque mai lungo. Per trarre informazioni importanti si deve guardare la sfumatura/riflesso.",
    pagina: 76
  },
  "colore.dorato": {
    titolo: "Giallo Dorato",
    definizione: "Il vino giallo dorato ha una netta colorazione giallo oro scuro. È una colorazione tipica di alcuni vitigni come grechetto, alcuni chardonnay, gewurztraminer ed è dovuta al loro corredo genetico.",
    cosa_significa: "Coloraz​ione concentrata che indica piena maturazione delle uve, più frequente in zone calde o particolarmente luminose. Indica anche un eventuale passaggio in legno, in quanto i vini bianchi elevati in barrique spesso assumono colorazione giallo dorata.",
    pagina: 76
  },
  "colore.aranciato": {
    titolo: "Aranciato",
    definizione: "È un arancione concentrato tendente a volte verso il bruno e a volte verso l'ambra. I vini aranciati possono essere bianchi o rossi.",
    cosa_significa: "Nei vini bianchi è frequente nelle produzioni con uve stramature o passite (passiti e vini dolci, con grande vivacità del colore). Negli orange wines deriva dalla macerazione sulle bucce. Quando riferito ai vini rossi indica una lunghissima evoluzione (vino molto invecchiato).",
    pagina: 76
  },
  "colore.cerasuolo": {
    titolo: "Rosa Cerasuolo",
    definizione: "Il vino rosa cerasuolo, con diverse intensità, è il classico rosa che potrebbe essere ottenuto (se fosse legale) mescolando un vino bianco a un rosso. Riferito a vini con presenza di antocianina appena sopra il trascurabile: non bianchi, ma non tale da definirli rossi.",
    cosa_significa: "Non è una tonalità ma una intensità di colore che dipende dalla SCELTA STILISTICA del produttore (tempo di permanenza vinacce rosse a contatto col mosto), più che da lavorazioni in vigna o DNA. Difficile trarre informazioni precise. NB: il rosato si degusta come un bianco: NON si valuta densità cromatica né qualità dei tannini.",
    pagina: 77
  },
  "colore.ramato": {
    titolo: "Rosa Ramato",
    definizione: "Particolari toni di rosa pallido con sfumature che possono andare dall'arancione al velo di cipolla fino al gris o al rosa baby. Sempre riconducibile al ramato, può avere diverse intensità.",
    cosa_significa: "Molto diffuso negli ultimi tempi, è il colore che incontra maggiore apprezzamento commerciale. Non dà indicazioni su territorio, vitigno o clima.",
    pagina: 77
  },
  "colore.porpora": {
    titolo: "Rosso Porpora",
    definizione: "Colore rosso viola scuro. Si associa a molti mosti: può indicare gioventù nel vino, in quanto non c'è ancora maturazione degli antociani/tannini.",
    cosa_significa: "Tipico di alcuni vitigni che tendono a rimanere porpora più a lungo (Lacrima di Morro d'Alba, Lagrein), ma per tutti i rossi è destinato a modificarsi nel tempo. Un vino porpora di solito NON ha avuto lunga evoluzione in legno (la micro-ossigenazione avrebbe fatto virare la tinta).",
    pagina: 78
  },
  "colore.rubino": {
    titolo: "Rosso Rubino",
    definizione: "Colore rosso vivo tipico della pietra da cui prende il nome. È il colore più diffuso nei vini rossi. Tutti i vitigni producono un vino che passa dalla colorazione rubino.",
    cosa_significa: "Non dà particolari informazioni su vitigno o zona di produzione, ma BUONE INFORMAZIONI SULL'EVOLUZIONE: non è giovane né troppo evoluto. Può aver fatto brevi passaggi in botte, ma non un lunghissimo affinamento in bottiglia.",
    pagina: 78
  },
  "colore.granato": {
    titolo: "Rosso Granato",
    definizione: "Colore della pietra naturale semipreziosa che esprime un rosso riconducibile al color mattone. Tipico di alcuni vitigni che lo raggiungono con velocità (Nebbiolo, Grignolino).",
    cosa_significa: "Quasi sempre indica una certa evoluzione, spesso con passaggio in legno. È il colore che assumono i grandi rossi nella fase di piena maturità.",
    pagina: 78
  },

  // ============ RIFLESSI ============
  "riflesso.intro": {
    titolo: "Riflessi (sfumature)",
    definizione: "Il riflesso del colore si valuta guardando con attenzione l'UNGHIA del bicchiere inclinato a 45° su superficie bianca. Ancor più che per il colore, attenzione alle alterazioni cromatiche.",
    cosa_significa: "Non sempre i vini hanno riflessi diversi dal colore: in tal caso si segna 'non rilevato'. Dai riflessi si traggono indicazioni su vitigno, zona di produzione, modalità produttiva e soprattutto EVOLUZIONE. Combinazioni vietate: bianco paglierino+aranciato, aranciato+verdolino, rubino+aranciato, granato+porpora.",
    pagina: 78
  },
  "riflesso.verdolino": {
    titolo: "Verdolino",
    definizione: "Si ha nei vini bianchi quando l'unghia esprime un accennato verde (difficilmente un verde netto).",
    cosa_significa: "Tipico di vini prodotti con uve che hanno faticato a maturare (zone fresche/fredde) o di alcuni vitigni. Si accompagna a buona quantità di acidità. Frequente sia nel paglierino sia nel dorato. Generalmente esprime GIOVENTÙ.",
    pagina: 79
  },
  "riflesso.dorato": {
    titolo: "Riflesso dorato",
    definizione: "Si presenta cromaticamente come il colore dorato ma nell'unghia del bicchiere. Si trova nei vini giallo paglierino.",
    cosa_significa: "Tipico di alcuni vitigni ma soprattutto di vini con BREVE PASSAGGIO IN LEGNO o vini che stanno virando verso la piena maturità. Non frequente.",
    pagina: 79
  },
  "riflesso.aranciato": {
    titolo: "Riflesso aranciato",
    definizione: "Identificabile sia nei bianchi che nei rossi. Nei bianchi può avere riflesso bruno scuro in vini da uve appassite con esposizione al sole o da processi innovativi (anfora).",
    cosa_significa: "ATTENZIONE: quando assume toni bruni/marrone chiaro/mattone con perdita di luminosità o vivacità, indica vino in VECCHIAIA → non si prosegue la degustazione. Nei rossi indica che il vino sta superando la piena maturazione. Eccezione: vini molto longevi che rimangono integri anche da aranciati.",
    pagina: 79
  },
  "riflesso.porpora": {
    titolo: "Riflesso porpora",
    definizione: "Si trova solo nei vini rosso rubino e indica che la fase di gioventù è quasi superata.",
    cosa_significa: "Può essere tipico di alcuni vitigni, ma è più raro. Molti vini frizzanti mantengono questa sfumatura a lungo.",
    pagina: 80
  },
  "riflesso.granato": {
    titolo: "Riflesso granato",
    definizione: "Si ha nei vini rosso rubino non appena iniziano a evolvere. Presente in quasi tutti i vini che hanno fatto un passaggio in legno mantenendo il rubino della pancia.",
    cosa_significa: "NON deve mai e in nessun caso essere preso come segnale di vecchiaia del vino.",
    pagina: 80
  },

  // ============ DENSITÀ CROMATICA ============
  "densita_cromatica.intro": {
    titolo: "Densità cromatica",
    definizione: "Tendenza del vino rosso a farsi attraversare dalla luce. Si valuta SOLO per i vini rossi: i bianchi sono naturalmente trasparenti. Dipende dalla presenza di antociani (patrimonio genetico del vitigno).",
    cosa_significa: "Non è indice di qualità del vino, ma solo della natura del vitigno. Fino a qualche anno fa era considerata criterio di qualità (alcuni produttori aggiungevano vitigni più coloranti), oggi sappiamo che NON è così. Si valuta inclinando il bicchiere a 45° sopra un foglio con scritte o immagini.",
    pagina: 80
  },
  "densita_cromatica.trasparente": {
    titolo: "Trasparente",
    definizione: "Un vino rosso è trasparente quando dalla pancia è possibile vedere con ottima o sufficiente nitidezza le scritte o le immagini sottostanti.",
    cosa_significa: "Esempi: quasi tutti i Pinot Nero, Sangiovese, Nebbiolo e molti altri.",
    pagina: 81
  },
  "densita_cromatica.compatto": {
    titolo: "Compatto",
    definizione: "Il vino rosso è compatto quando dalla pancia del bicchiere si vedono con difficoltà, o non si vedono affatto, le scritte o le immagini sottostanti.",
    cosa_significa: "Esempi: Nero d'Avola, Montepulciano d'Abruzzo, Lagrein.",
    pagina: 82
  },

  // ============ LIMPIDEZZA ============
  "limpidezza.intro": {
    titolo: "Limpidezza",
    definizione: "Nitidezza del liquido alla vista. Non va confusa con la trasparenza. Si valuta frapponendo il bicchiere a una fonte luminosa.",
    cosa_significa: "Se il vino presenta velature dovute a rotture organolettiche, si interrompe la degustazione. Non è indice di qualità: molte produzioni applicano filtrazioni non brillantanti. Se sedimenti sono dovuti al lungo affinamento (precipitazione antociani nei rossi, tartrati in rossi e bianchi), si valuta al netto di questo fenomeno (da indicare nel campo Note).",
    pagina: 82
  },
  "limpidezza.opaco": {
    titolo: "Opaco",
    definizione: "Il vino risulta opaco quando presenta una leggera torbidità alla vista. I vini non filtrati spesso hanno questa caratteristica, anche se in maniera mai decisamente marcata.",
    cosa_significa: "Ci sono vini parzialmente filtrati perfettamente limpidi.",
    pagina: 82
  },
  "limpidezza.limpido": {
    titolo: "Limpido",
    definizione: "Il vino è limpido quando non ha nessuna forma di torbidità visibile.",
    pagina: 82
  },

  // ============ VIVACITÀ ============
  "vivacita.intro": {
    titolo: "Vivacità del colore",
    definizione: "Dovuta alla presenza di acidità nel vino. L'acidità è indice di salute e vitalità del vino, ma non è indice di qualità assoluta.",
    cosa_significa: "Se il vino non ha vivacità, possiamo attenderci una prospettiva di consumo non lunga. La vivacità si apprezza grazie alla capacità del vino di riflettere la luce di una fonte luminosa.",
    pagina: 82
  },
  "vivacita.cupo": {
    titolo: "Cupo",
    definizione: "Il vino è cupo quando il colore si presenta spento e privo di luminosità.",
    pagina: 83
  },
  "vivacita.vivace": {
    titolo: "Vivace",
    definizione: "Il vino è vivace quando è dotato di buona lucentezza e il colore riflette la luce.",
    pagina: 83
  },
  "vivacita.luminoso": {
    titolo: "Luminoso",
    definizione: "Il vino è luminoso quando di grande lucentezza e riflette la luce con sfumature colorate.",
    pagina: 83
  },

  // ============ PERLAGE ============
  "perlage.intro": {
    titolo: "Perlage",
    definizione: "La fontanella di bollicine espressa dai vini spumanti. Si valuta solo per questa tipologia. Si genera per effetto del rilascio nel bicchiere della CO2 imprigionata durante la spumantizzazione.",
    cosa_significa: "Più la CO2 è integrata, più verrà rilasciata con parsimonia formando bollicine PICCOLE. Le bollicine piccole sono (con rare eccezioni) indice di QUALITÀ. Valutazione: a bicchiere fermo, negli attimi successivi al versamento. ATTENZIONE: il lavaggio del bicchiere senza detergenti tensioattivi può rendere la superficie troppo liscia, con perlage poco numeroso e poco duraturo (non legato alla qualità del vino).",
    pagina: 83
  },
  "perlage.grandi": {
    titolo: "Grane grandi",
    definizione: "Bollicine di grandi dimensioni. Solitamente indicano una CO2 meno integrata.",
    cosa_significa: "Spesso correlate a spumantizzazioni più brevi o vini di minore raffinatezza."
  },
  "perlage.fini": {
    titolo: "Grane fini",
    definizione: "Bollicine di piccole dimensioni. Indicano una CO2 ben integrata, rilasciata con parsimonia.",
    cosa_significa: "Sono (con rare eccezioni) indice di QUALITÀ dello spumante."
  },

  // ============ TECNICA OSSERVAZIONE ============
  "visivo.tecnica": {
    titolo: "Tecnica di osservazione",
    definizione: "Inclinare il bicchiere a 45°, su una superficie bianca per evitare alterazioni cromatiche. In questa posizione il vino crea una zona centrale con volume di liquido più alto chiamata pancia e una zona periferica, dove la concentrazione di liquido è bassa, chiamata in gergo unghia.",
    cosa_significa: "Il COLORE si valuta prendendo in considerazione la pancia del bicchiere. Nell'UNGHIA si valutano al meglio le sfumature (riflessi).",
    pagina: 76
  },
  "visivo.intro": {
    titolo: "Aspetto Visivo — introduzione",
    definizione: "Il vino si valuta per colore, sfumature, densità cromatica, limpidezza, vivacità e perlage. La degustazione si compie in tempi rapidi (5-6 minuti) con max 5 cl di vino. La scheda è precompilata: basta apporre crocette per restare concentrati su ciò che il bicchiere esprime.",
    cosa_significa: "L'aspetto visivo dà indicazioni che vanno confermate o smentite dagli altri esami. Tre parametri di pari dignità: visivo, olfattivo, gustativo (in quest'ordine), ma il gustativo è il più importante. Osservare il vino mentre viene servito può aiutare a notare leggera effervescenza (vino pétillant).",
    pagina: 74
  },
  "visivo.densita_vino": {
    titolo: "Densità del vino (consistenza)",
    definizione: "Si valuta ruotando il bicchiere per far depositare un po' di liquido sulle pareti: più scende lento, più è denso. La densità è data dall'insieme tra estratto secco, glicerina, alcol e zucchero.",
    cosa_significa: "I vini DOLCI e con grado alcolico importante tendono a essere più densi (spesso da evidenziare nel campo Note). Per i vini SECCHI non vale la pena valutare piccole differenze di densità: dipende anche dal tipo di lavaggio del bicchiere e non dà indicazioni sulla qualità. NB: ruotare il bicchiere a velocità sostenuta è quasi sempre una manfrina poco utile.",
    pagina: 74
  },
  "visivo.colore_intro": {
    titolo: "Perché si valuta il colore",
    definizione: "Il colore serve per: (1) definire la tipologia di degustazione (bianco/rosato/rosso si valutano diversamente), (2) avere indicazioni su vitigno, zona di produzione, tipo di vinificazione.",
    cosa_significa: "Il colore dei rossi è dato da antociani e tannini. I bianchi hanno piccole quantità di polifenoli/tannini che nel tempo tendono a scurire (imbrunimento = vino vecchio, non degustabile). Nei rossi l'imbrunimento dei polifenoli è lento e aiuta a capire l'evoluzione/affinamento.",
    pagina: 75
  },

  // ============ OLFATTO - COMPLESSITÀ ============
  "complessita.facile": {
    titolo: "Facile (complessità)",
    definizione: "Un vino è facile quando esprime fruttato e floreale dovuti alla fermentazione, con tre/quattro descrittori totali percettibili.",
    cosa_significa: "Esempio: un vino fruttato e floreale, con descrittori di pesca, mela e fiori di acacia.",
    pagina: 96
  },
  "complessita.complesso": {
    titolo: "Complesso",
    definizione: "Il vino è complesso quando sono immediatamente riconoscibili almeno 3/4 famiglie e un numero minimo di almeno 7/8 descrittori.",
    cosa_significa: "Esempio: un vino fruttato, floreale, minerale con erbe aromatiche, con descrittori di prugna, lampone, ciliegia, viola, grafite, lavanda, rosmarino, fumé.",
    pagina: 96
  },
  "complessita.piu_che_complesso": {
    titolo: "Più che complesso",
    definizione: "Il vino è più che complesso quando sono riconoscibili almeno 5 famiglie con almeno 10/12 descrittori totali.",
    cosa_significa: "Esempio: vino speziato, fruttato, floreale, minerale, balsamico. Descrittori di marasca, frutti di bosco, more, ribes, rosa canina, lavanda, pepe, legno antico, chiodi di garofano, anice stellato, tabacco, cioccolato, grafite, muschio, menta.",
    pagina: 97
  },
  "complessita.ampio": {
    titolo: "Ampio",
    definizione: "Il vino è ampio quando è possibile percepire tutte le famiglie di descrittori, fatto salvo il metodo di produzione, con un totale di una quindicina di sfumature diverse e possiede un consolidato e preciso equilibrio olfattivo che permette una netta scansione dei sentori.",
    cosa_significa: "Il nostro naso difficilmente riesce a distinguere più di 15/16 sfumature olfattive nel breve tempo. La vinosità (ricordo di mosto/gioventù) non va considerata nella definizione della complessità.",
    pagina: 97
  },

  // ============ OLFATTO - QUALITÀ ============
  "qualita_olf.accettabile": {
    titolo: "Accettabile (qualità olfattiva)",
    definizione: "Il vino risulta accettabile quando l'eleganza e la piacevolezza sono ordinari, e nell'insieme olfattivo ci sono profumi dominanti e di non grande eleganza.",
    pagina: 98
  },
  "qualita_olf.fine": {
    titolo: "Fine (qualità olfattiva)",
    definizione: "Il vino è fine quando è piacevole nel profumo, anche se non elegantissimo, con dominanti olfattive non in perfetto amalgama.",
    pagina: 98
  },
  "qualita_olf.piu_che_fine": {
    titolo: "Più che fine (qualità olfattiva)",
    definizione: "Il vino è più che fine quando ha ottima eleganza e piacevolezza. I profumi sono in bilanciamento olfattivo senza che uno sia più evidente dell'altro.",
    pagina: 98
  },
  "qualita_olf.eccellente": {
    titolo: "Eccellente (qualità olfattiva)",
    definizione: "Il vino è eccellente quando presenta un'ampia complessità: tutti i sentori sono ben scansionati e percepibili in modo equilibrato in lunghezza e potenza. Eleganza e piacevolezza sono pienamente soddisfacenti e tutti i descrittori formano un perfetto accordo olfattivo. Nel suo insieme il profumo risulta assolutamente sobrio, molto piacevole e raffinato.",
    cosa_significa: "Il grande vino è quello che ha anche un percorso olfattivo: i suoi profumi evolvono nel breve tempo esprimendo un naso profondo e qualità evolutiva.",
    pagina: 98
  },

  // ============ GUSTO - ZUCCHERO ============
  "zucchero.secco": {
    titolo: "Secco",
    definizione: "Il vino è secco quando la percezione di dolcezza è nulla.",
    pagina: 102
  },
  "zucchero.tendente_al_dolce": {
    titolo: "Tendente al dolce",
    definizione: "Il vino è tendente al dolce quando si percepisce una leggerissima dolcezza riferibile allo zucchero, appena accennata, ma non una piena sensazione di dolce.",
    pagina: 102
  },
  "zucchero.dolce": {
    titolo: "Dolce",
    definizione: "Il vino è dolce quando esprime una piena e netta sensazione di dolcezza.",
    pagina: 102
  },
  "zucchero.molto_dolce": {
    titolo: "Molto dolce",
    definizione: "Il vino è molto dolce quando la sensazione di dolcezza è piena, netta e rimane nel finale di bocca.",
    cosa_significa: "Non è necessariamente un valore negativo ma tendiamo a considerarlo troppo dolce.",
    pagina: 102
  },

  // ============ GUSTO - ALCOL ============
  "alcol.contenuto": {
    titolo: "Contenuto (alcol)",
    definizione: "Il vino è contenuto quando la sensazione di alcol è bassa e perfettamente integrata con le altre sensazioni organolettiche. Quasi non ci si accorge che sia una bevanda alcolica.",
    cosa_significa: "Un vino contenuto o caldo tende ad essere qualitativamente superiore a uno più che caldo o molto caldo. La percezione dell'alcol è bilanciata dall'acidità: a parità di grado alcolico, un vino più acido ha sensazione pseudo-calorica inferiore.",
    pagina: 103
  },
  "alcol.caldo": {
    titolo: "Caldo (alcol)",
    definizione: "Il vino è caldo quando la sensazione di alcol è percettibile seppur bene integrata con le altre sensazioni del vino, e in ottimo equilibrio con l'acidità.",
    pagina: 103
  },
  "alcol.piu_che_caldo": {
    titolo: "Più che caldo",
    definizione: "Il vino è più che caldo quando la sensazione pseudo calorica è netta ed è superiore alle altre sensazioni organolettiche, in particolare all'acidità.",
    pagina: 103
  },
  "alcol.molto_caldo": {
    titolo: "Molto caldo",
    definizione: "Il vino è molto caldo quando la sensazione pseudocalorica è nettissima, dominante nel gusto del vino e coprente le altre sensazioni organolettiche.",
    cosa_significa: "Esprime troppa sensazione di alcol dovuta a un alto quantitativo non supportato da adeguata struttura o a un mancato amalgama. Il vino molto caldo risulta penalizzato da questa caratteristica.",
    pagina: 103
  },

  // ============ GUSTO - ACIDITÀ ============
  "acidita.intro": {
    titolo: "Acidità percepita",
    definizione: "L'acidità è quella sensazione citrina che si esprime nel cavo orale facendo salivare. Siccome la salivazione dona freschezza, è proprio con il termine freschezza che si definisce la scala di valutazione dell'acidità.",
    cosa_significa: "La qualità di acidità migliore è quella che dona freschezza gustativa, non aggredisce le gengive e non lascia finale eccessivamente citrino.",
    pagina: 104
  },
  "acidita.contenuto": {
    titolo: "Contenuto (acidità)",
    definizione: "Il vino è contenuto quando la sensazione di acidità è bassa e perfettamente integrata con le altre sensazioni organolettiche, oppure perché l'acidità è decaduta. Pur salivando, quasi non ci si accorge che sia presente.",
    cosa_significa: "Tendenza ad avere meno durezze gustative. Per i vini bianchi, contenuto NON è qualitativamente superiore a fresco/più che fresco — anzi è il contrario.",
    pagina: 105
  },
  "acidita.fresco": {
    titolo: "Fresco (acidità)",
    definizione: "Il vino è fresco quando la sensazione di acidità è percettibile seppur bene integrata con le altre sensazioni del vino, e in ottimo equilibrio con l'alcol. La salivazione iniziale è fluida e importante.",
    cosa_significa: "Oggi, nel caso di moltissimi vini rossi, rappresenta la caratteristica principale dello stile di produzione e della propria bevibilità.",
    pagina: 105
  },
  "acidita.piu_che_fresco": {
    titolo: "Più che fresco",
    definizione: "Il vino è più che fresco quando la sensazione di acidità è netta ed è superiore alle altre sensazioni organolettiche, in particolare all'alcol. La salivazione è abbondante e prolungata nel tempo.",
    cosa_significa: "Per la maggior parte dei vini bianchi indica il momento migliore: si può attribuire bilanciato (17) all'equilibrio.",
    pagina: 105
  },
  "acidita.molto_fresco": {
    titolo: "Molto fresco",
    definizione: "Il vino è molto fresco quando la sensazione di acidità è nettissima, dominante nel gusto del vino e coprente le altre sensazioni organolettiche. Il vino molto fresco esprime una salivazione prolungata e una certa aggressione sulle gengive.",
    cosa_significa: "Può voler dire che il vino è troppo giovane o che l'acidità non è ben integrata. Va penalizzato.",
    pagina: 105
  },

  // ============ GUSTO - TANNINO ============
  "tannino.amaro": {
    titolo: "Tannino amaro",
    definizione: "Il vino ha tannino amaro quando nel centro bocca e nel finale si ha una chiara e netta sensazione di amaro. In bocca il tannino asciuga in maniera non uniforme e aggressiva.",
    pagina: 106
  },
  "tannino.vegetale": {
    titolo: "Tannino vegetale",
    definizione: "Il vino ha tannino vegetale quando si sente una leggera presenza di amaro, ma soprattutto una chiara sensazione vegetale nel centro bocca, dovuta a una non perfetta maturazione fenolica delle uve. Si sente una leggera aggressività.",
    pagina: 107
  },
  "tannino.maturo": {
    titolo: "Tannino maturo",
    definizione: "Il vino ha tannino maturo quando non esprime aggressività, ma produce un'asciugatura uniforme e levigata che, seppur forte, viene bilanciata dalla salivazione prodotta dalla acidità. Non vi è presenza di amaro.",
    pagina: 107
  },
  "tannino.raffinato": {
    titolo: "Tannino raffinato",
    definizione: "Il vino ha tannino raffinato quando non esprime amaro, non esprime aggressività ma solo una leggera asciugatura limitata nel tempo e viene percepito come setoso nella sua espressione tattile.",
    pagina: 107
  },
  "tannino.descrizione_generale": {
    titolo: "Cos'è il tannino?",
    definizione: "La valutazione del tannino è indipendente dalla quantità presente nel vino. Si valuta solo nei vini rossi per convenzione (anche se è sempre più accettato che alcuni bianchi come il Grechetto esprimano tannicità). Valutiamo solo la qualità del tannino perché influenza in maniera decisa la qualità della fase gustativa.",
    cosa_significa: "Il tannino reagisce con la saliva asciugando il cavo orale. La sua maturità dipende dalla maturità polifenolica degli acini. Il vino con tannino MATURO e RAFFINATO è sempre superiore a un vino con tannino DURO e AMARO. La scala esprime quindi anche la qualità: amaro in basso, raffinato in alto. Nel tempo la percezione di tannino si attenua (polimerizzazione). Sagrantino e Nebbiolo hanno carica polifenolica superiore a Rossese o Barbera.",
    pagina: 105
  },

  // ============ GUSTO - EQUILIBRIO ============
  "equilibrio.intro": {
    titolo: "Equilibrio del vino",
    definizione: "L'equilibrio del vino è dato dal bilanciamento e contrapposizione delle durezze (acidità, tannino) e delle morbidezze (zucchero, alcol, glicerina). Va valutato nel momento della degustazione e non può essere considerato un elemento assoluto, dato che nel tempo tende a variare.",
    cosa_significa: "La morbidezza si valuta nel cavo orale premendo il vino con la lingua sul palato: più scivolosità e ricaduta densa = più morbidezza. Un vino ha PERFETTO EQUILIBRIO quando le componenti sono amalgamate e in perfetta contrapposizione. L'amalgama si ha quando il vino si presenta come un corpo unico e nessuna caratteristica è lungamente protagonista (es. alcol scisso = quando l'alcol resta lungamente nell'assaggio). Il percorso migliore: leggera dolcezza, leggerissima pungenza dell'alcol, asciugatura del tannino che dopo pochi secondi cede alla salivazione dell'acidità.",
    pagina: 107
  },
  "equilibrio.dinamica": {
    titolo: "Dinamicità dell'equilibrio",
    definizione: "L'equilibrio è dinamico nel tempo: le morbidezze (alcol, zucchero, glicerina) non variano nel tempo, mentre le durezze sì. L'acidità tende a scendere a causa della precipitazione di tartrati o modifiche chimiche. Il tannino tende a polimerizzarsi (unire le proprie catene di carbonio creando catene più lunghe con minore capacità di legare la saliva).",
    cosa_significa: "Quindi col tempo il vino tende a diventare più morbido. Per convenzione, se un vino si presenta con eccesso di MORBIDEZZE, è vecchio e non valutabile: si considera eccesso solo nelle DUREZZE. Le durezze (specie l'acidità) sono la 'spina dorsale' del vino; in loro mancanza si parla di vino seduto o vecchio. Il tannino è più facilmente amalgamabile in vini di grande struttura perché lì diluito.",
    pagina: 108
  },
  "equilibrio.tipologie": {
    titolo: "Equilibrio nelle varie tipologie",
    definizione: "BIANCHI: ci si aspetta una freschezza che li contraddistingua, per cui si dà il bilanciato quando il vino si attesta su 'più che fresco' (durezza ben marcata, acidità libera). È corretto che si avverta una maggiore presenza di acidità. SPUMANTI: fanno della verve il loro asso nella manica, ci si aspetta che esprimano durezze data la presenza della CO2 che le evidenzia. L'equilibrio non va calcolato nel perfetto bilanciamento ma in una leggera maggior percezione delle durezze.",
    cosa_significa: "Eccezioni: grandi vini ancora non equilibrati (ma è solo questione di tempo) possono risultare più pregevoli di altri già bilanciati.",
    pagina: 109
  },
  "equilibrio.squilibrato": {
    titolo: "Squilibrato (12-13)",
    definizione: "Il vino è squilibrato quando è spigoloso e ha una netta predominanza di durezze.",
    pagina: 109
  },
  "equilibrio.in_fase_di_equilibrio": {
    titolo: "In fase di equilibrio (14-15)",
    definizione: "Il vino in fase di equilibrio ha ancora una prevalenza delle durezze e ancora spiccata acidità, sebbene in via di attenuazione. Se rosso, ha un tannino già uniformemente astringente.",
    pagina: 109
  },
  "equilibrio.bilanciato": {
    titolo: "Bilanciato (16-17)",
    definizione: "Il vino bilanciato non ha prevalenze di durezze, le componenti sono sufficientemente amalgamate e il tannino è quasi levigato.",
    pagina: 110
  },
  "equilibrio.equilibrato": {
    titolo: "Equilibrato (18)",
    definizione: "Il vino è equilibrato quando le componenti sono fuse in un solo unico sapore caratteristico, perfetto amalgama, perfetto equilibrio, tannino levigato e assorbito in tempi brevissimi.",
    pagina: 110
  },

  // ============ GUSTO - PERSISTENZA ============
  "persistenza.intro": {
    titolo: "Persistenza gustativa",
    definizione: "Importante fattore qualitativo perché definisce quanto e per quanto tempo la bevanda marca il palato. È un fattore impossibile (o molto difficile) da modificare artificialmente. Si misura in secondi.",
    cosa_significa: "Va considerata in TUTTA la struttura gustativa, non solo in una componente. Se la struttura si perde subito e rimane solo alcol/amaro/acido per lungo tempo, NON possiamo definire il vino lungo.",
    pagina: 110
  },
  "persistenza.accettabile": {
    titolo: "Accettabile (10-11)",
    definizione: "Il vino è accettabile quando la dissoluzione del gusto avviene tra i 3 e i 5 secondi.",
    pagina: 110
  },
  "persistenza.persistente": {
    titolo: "Persistente (12-13)",
    definizione: "Il vino è persistente quando la dissoluzione del gusto avviene tra i 6 e i 10 secondi.",
    pagina: 110
  },
  "persistenza.piu_che_persistente": {
    titolo: "Più che persistente (14-15)",
    definizione: "Il vino è più che persistente quando la dissoluzione del gusto avviene tra i 10 e i 15 secondi.",
    pagina: 111
  },
  "persistenza.lungo": {
    titolo: "Lungo (16)",
    definizione: "Il vino è lungo quando la dissoluzione del gusto avviene oltre i 16 secondi.",
    pagina: 111
  },

  // ============ GUSTO - SAPIDITÀ ============
  "sapidita.intro": {
    titolo: "Sapidità percepita",
    definizione: "Sensazione di salato. È una microsensazione, nascosta dall'acidità con cui spesso è confusa, poiché anch'essa fa salivare (ma con salivazione più densa). Si valuta DOPO la persistenza per dare il tempo di percepirla.",
    cosa_significa: "Aiuta a capire l'identità territoriale del vino, ma non dà grandi indicazioni sulla qualità: la scala NON assume valore qualitativo. Non sempre correlata alla mineralità percepita al naso.",
    pagina: 111
  },
  "sapidita.non_avvertibile": {
    titolo: "Non avvertibile",
    definizione: "La sapidità è non avvertibile quando non si ha nessuna sensazione di sale.",
    pagina: 112
  },
  "sapidita.contenuta": {
    titolo: "Contenuta (sapidità)",
    definizione: "Il vino è contenuto quando si percepisce una leggera presenza di sale perfettamente amalgamato e avvertibile dopo lunga attesa.",
    pagina: 112
  },
  "sapidita.sapida": {
    titolo: "Sapida",
    definizione: "Il vino è sapido quando la sensazione di sale è netta e si avverte dopo una breve attesa.",
    pagina: 112
  },
  "sapidita.piu_che_sapida": {
    titolo: "Più che sapida",
    definizione: "Il vino è più che sapido quando si avverte una netta sensazione di sale, quasi dominante, e si percepisce nel palato sin da subito.",
    pagina: 112
  },

  // ============ GUSTO - CHIUSURA DI BOCCA ============
  "chiusura.intro": {
    titolo: "Chiusura di bocca",
    definizione: "Parametro molto importante: definisce il ricordo che il vino lascia nel tempo. È l'assenza di sensazioni organolettiche riconducibili al vino in bocca, al termine della persistenza gustativa. L'obiettivo è lasciare il cavo orale pronto a un nuovo assaggio.",
    cosa_significa: "L'amaro finale accentuato non si perdona mai. Eccezione positiva: la sapidità finale ben controllata e di qualità iodata tende a impreziosire. Se la chiusura non è almeno accettabile, si interrompe la degustazione tecnica.",
    pagina: 112
  },
  "chiusura.imprecisa": {
    titolo: "Imprecisa",
    definizione: "Il vino ha una chiusura di bocca imprecisa quando lascia una o più sensazioni organolettiche nette e durature. A volte abbiamo bisogno di bere acqua. Spesso è presente l'amaro: nel totale esprime una scarsa piacevolezza.",
    pagina: 113
  },
  "chiusura.buona": {
    titolo: "Buona",
    definizione: "Il vino ha una chiusura di bocca buona quando lascia una o più sensazioni organolettiche leggermente presenti e non durature nel tempo. Nell'immediato può essere richiesta un po' d'acqua, ma nel complesso il vino è di convincente piacevolezza. Non ha presenza di amaro, se non leggerissima e tollerabile dalla tipologia.",
    pagina: 114
  },
  "chiusura.precisa": {
    titolo: "Precisa",
    definizione: "Il vino ha una chiusura di bocca precisa quando non lascia sensazioni organolettiche nel finale, l'amaro non compare e non abbiamo necessità di bere acqua. È di ottima gradevolezza.",
    pagina: 114
  },
  "chiusura.elegante": {
    titolo: "Elegante",
    definizione: "Il vino è impeccabile: dopo la persistenza, anche lunghissima, tutte le componenti del vino si attenuano all'unisono e il cavo orale è pronto al nuovo assaggio. L'amaro non è presente se non quando richiesto dalla tipicità del vitigno (versione ammandorlata). L'eleganza espressa è assoluta.",
    pagina: 114
  },

  // ============ GUSTO - QUALITÀ GUSTATIVA ============
  "qualita_gust.intro": {
    titolo: "Qualità gustativa",
    definizione: "Sintesi tra persistenza e finale di bocca (parametri oggettivi) e definizione dell'eleganza sulla quale il degustatore esprime il proprio giudizio. Se il vino non ha qualità nemmeno accettabile, si interrompe la degustazione.",
    cosa_significa: "Se persistenza e finale sono discordanti (es. poco persistente con finale preciso), conta più il finale di bocca della persistenza. Il vino potrà essere giudicato fine o più che fine se per il degustatore è piacevole/rimarchevole.",
    pagina: 114
  },
  "qualita_gust.accettabile": {
    titolo: "Accettabile (18-19)",
    definizione: "Il vino accettabile è quello poco persistente, con un finale di bocca accettabile che il degustatore definisce come buono, ma al livello di tanti altri.",
    pagina: 114
  },
  "qualita_gust.fine": {
    titolo: "Fine (20-21)",
    definizione: "Il vino fine è di discreta persistenza, con finale di bocca pulito che il degustatore definisce decisamente piacevole.",
    pagina: 114
  },
  "qualita_gust.piu_che_fine": {
    titolo: "Più che fine (22-23)",
    definizione: "Il vino più che fine è quello di buona persistenza, con finale più che pulito che il degustatore definisce rimarchevole.",
    pagina: 115
  },
  "qualita_gust.eccellente": {
    titolo: "Eccellente (24)",
    definizione: "Il vino eccellente è quello di lunga persistenza, con finale di bocca impeccabile che il degustatore definisce eccellente.",
    pagina: 115
  },

  // ============ GUSTO - DIMENSIONE ============
  "dimensione.intro": {
    titolo: "Dimensione del vino",
    definizione: "Parametro con cui il degustatore esprime al meglio il proprio gusto personale e la sua esperienza. Giudizio di sintesi tra struttura, forma e percezione del degustatore.",
    cosa_significa: "Strutturato e Sottile = descrittivi (struttura gustativa, non qualità). Distinto e Suggestivo = espressioni di qualità che coinvolgono trasporto ed emozione. Distinto/Suggestivo possono valere indipendentemente che il vino sia sottile o strutturato.",
    pagina: 116
  },
  "dimensione.strutturato": {
    titolo: "Strutturato (3)",
    definizione: "Il vino è strutturato quando presenta molte componenti gustative e ad alto contenuto. Normalmente nel palato presenta buona densità gustativa e avvolge in maniera orizzontale tutto il cavo orale.",
    pagina: 117
  },
  "dimensione.sottile": {
    titolo: "Sottile (3)",
    definizione: "Il vino è sottile quando presenta qualche caratteristica organolettica in meno rispetto allo strutturato e ha contenuto più basso. Si parla di vino verticale perché tende a evidenziare i propri punti di forza con immediatezza e decisione. Si concentra meglio nel centro bocca.",
    pagina: 117
  },
  "dimensione.distinto": {
    titolo: "Distinto (5)",
    definizione: "Il vino è attraente quando il degustatore è colpito da uno o più parametri che lo catturano, nel gusto o nel profumo, distinguendolo dalla media. È il vino che si consiglierebbe all'amico del cuore.",
    pagina: 117
  },
  "dimensione.suggestivo": {
    titolo: "Suggestivo (6)",
    definizione: "Il vino è suggestivo quando il degustatore non solo rimane rapito dal suo gusto e dal profumo, ma questi sono in grado di evocare in lui immagini, luoghi o momenti. È il vino al quale si darebbe per trasporto il massimo del punteggio assoluto.",
    cosa_significa: "Parametro che per sua natura va utilizzato con cautela, solo quando ci sentiamo emotivamente coinvolti.",
    pagina: 117
  },

  // ============ PROSPETTIVE DI CONSUMO ============
  "prospettive.intro": {
    titolo: "Prospettive di consumo",
    definizione: "Indicano la vita che il vino può avere prima di divenire vecchio. NON hanno valenza qualitativa: indicano solo il periodo di salute del vino. Oggi in commercio non si trovano più vini giovani (i produttori attendono il momento giusto), e difficilmente si trovano vini vecchi.",
    cosa_significa: "Se ci si imbatte in vini troppo giovani o vecchi si interrompe la degustazione. VINO GIOVANE = non equilibrato, troppo fresco, vinoso al naso, deve assestarsi. VINO VECCHIO = senza vitalità, ossidato, ha perso colore virando verso l'arancio.",
    pagina: 117
  },
  "prospettive.da_bere_subito": {
    titolo: "Da bere subito",
    definizione: "Il vino da bere subito va consumato nell'immediato o al massimo in tre-quattro mesi. Ha già degli indicatori nel colore, nel profumo e nel gusto che lo posizionano a ridosso della vecchiaia.",
    pagina: 118
  },
  "prospettive.brevi_prospettive": {
    titolo: "Brevi prospettive",
    definizione: "Il vino di brevi prospettive è quello bevibile in uno o due anni, perfettamente vitale ma per tipologia o dimensione non ha caratteristiche per durare ancora a lungo.",
    pagina: 118
  },
  "prospettive.medie_prospettive": {
    titolo: "Medie prospettive",
    definizione: "Il vino di medie prospettive è quello che è consumabile per certo ancora fino a 5-6 anni senza alcun problema organolettico.",
    pagina: 118
  },
  "prospettive.lunghe_prospettive": {
    titolo: "Lunghe prospettive",
    definizione: "Il vino di lunghe prospettive ha una prospettiva di oltre 6 anni.",
    cosa_significa: "BIANCHI: meno protettori naturali (no tannino, no antociani), normalmente meno resistenza dei rossi. Bianchi con struttura importante, forte acidità e profumi di evoluzione possono durare anche 30-40 anni. ROSSI: tannino evidente + forte acidità = vino che si conserva nel tempo. Aspetto rosso mattone + tannino molle + scarsa acidità = vita breve.",
    pagina: 118
  },

  // ============ FAMIGLIE OLFATTIVE ============
  "olfatto.intro": {
    titolo: "Aspetto olfattivo — introduzione",
    definizione: "Il profumo del vino si rileva con inspirazioni profonde ma brevi (per evitare assuefazione). Nel vino ci sono circa 600 sostanze volatili con peso, tempi e concentrazioni diverse: per coglierle si ruota il bicchiere per rompere la tensione superficiale e farle evaporare.",
    cosa_significa: "INTENSITÀ olfattiva = primo impatto al naso (verticale o delicato): dipende da vitigno, vinificazione, temperatura. NON è criterio di qualità: meglio valutare la qualità olfattiva. ASSUEFAZIONE: il cervello spegne la concentrazione su un profumo già catalogato, ecco perché in inspirazioni diverse scopriamo sentori diversi. Tecnica: prima inspirazione a bicchiere fermo per controllare difetti (es. tappo → si interrompe); poi inspirazioni successive per complessità e qualità.",
    pagina: 84
  },
  "olfatto.retronasale": {
    titolo: "Aspetto retronasale",
    definizione: "Dopo la deglutizione, le pareti dell'ipofaringe e dell'orofaringe si verniciano del vino e con l'espirazione le molecole odorose tornano alla volta nasale. Il contatto con la mucosa orofaringea (~36°C) rende volatili nuove molecole, ecco perché la percezione olfattiva indiretta è spesso più ricca della diretta.",
    cosa_significa: "Quando c'è piena rispondenza tra nasale diretto e retronasale, il vino è più coerente e di qualità superiore. Se il retronasale è più ricco del nasale diretto, lo preferiamo.",
    pagina: 86
  },
  "olfatto.come_si_dice": {
    titolo: "Perché si usano nomi 'familiari'",
    definizione: "Le sostanze chimiche del vino hanno nomi scientifici (es. acetato di isoamile, aldeide cinnamica), ma sono difficili da memorizzare e poco suggestivi. Usiamo invece il nome di cose note di cui queste sostanze sono caratterizzanti: declineremo banana o cannella anziché i nomi chimici.",
    cosa_significa: "Le molecole chimiche possono trasformarsi e produrre reazioni che cambiano i profumi nel tempo: ecco perché ci sono sentori tipici di vini giovani e altri tipici di vini evoluti.",
    pagina: 86
  },
  "olfatto.fruttato": {
    titolo: "Famiglia Fruttata",
    definizione: "I profumi fruttati si generano nella fermentazione quando i precursori aromatici si liberano. Difficilmente non sono presenti: quando mancano vuol dire che il vino ha un'evoluzione molto lunga (i fruttati vengono superati da speziature o aromi di riduzione).",
    cosa_significa: "Categorie: FRUTTI ROSSI (ciliegia, lampone, frutti di bosco), FRUTTI SCURI (mora, marasca, cassis, mirtillo), POLPA BIANCA (pera, mela, pesca bianca), POLPA GIALLA (pesca gialla, albicocca), TROPICALI (banana, ananas, mango), AGRUMI (arancia, cedro, pompelmo). FRUTTA FRESCA = vino giovane; MATURA = vino più maturo; SOTTO SPIRITO = buona presenza di alcol; CONFETTURA = uve molto mature/surmature (annate calde 'marmellatose'); SECCA = vini dolci o molto maturi; LIOFILIZZATA = vini dolci da uve passite. Termini 'croccante' o 'fragrante' per fruttato vivace e fresco. È un MARCATORE DEL VITIGNO.",
    pagina: 87
  },
  "olfatto.floreale": {
    titolo: "Famiglia Floreale",
    definizione: "Famiglia ampia quanto il fruttato. Anche questi aromi si liberano dai precursori aromatici dopo la fermentazione, sono sempre presenti (più o meno marcati).",
    cosa_significa: "Categorie: FIORI ROSSI (rosa, viola), FIORI BIANCHI (iris bianco, giglio), FIORI GIALLI (acacia, mimosa). FIORI FRESCHI = vini giovani; FIORI APPASSITI = vini maturi. 'Fiori di campo' o 'potpourri' quando i descrittori sono difficilmente separabili. Fiori GIALLI e BIANCHI = prerogativa dei BIANCHI. Fiori ROSSI/ROSA = nei ROSSI (salvo limitate eccezioni). È un MARCATORE DEL VITIGNO.",
    pagina: 89
  },
  "olfatto.vegetale": {
    titolo: "Famiglia Vegetale",
    definizione: "Riconducibili a erbe e verdure, presenti come pirazine (sostanze chimiche degli acini che scendono di concentrazione fino a sparire durante la maturazione delle uve).",
    cosa_significa: "Quindi negli acini maturi le pirazine non dovrebbero essere reperibili. Tuttavia alcuni vitigni le consumano lentamente. NEGATIVI: peperone, erba tagliata, pomodoro fresco, melanzana. POSITIVI: fieno, passata di pomodoro dolce, sottobosco, muschio. Vitigni che esprimono peperone: Cabernet Sauvignon, Merlot, Carmenere, Malbec. Fieno: Chardonnay, Sylvaner. A Bordeaux i viticoltori spingono la maturazione per far svanire il peperone (considerato negativo). È INDICATORE DELLO STATO DI MATURITÀ DELLE UVE.",
    pagina: 90
  },
  "olfatto.minerale": {
    titolo: "Famiglia Minerale",
    definizione: "Famiglia in assoluto più controversa. Per Assosommelier, la mineralità è dovuta in parte al territorio e in parte alla fermentazione: alcuni vitigni sono più predisposti a 'leggere' il territorio.",
    cosa_significa: "Esempi territoriali: gesso nei terreni gessosi/calcarei, pietra focaia nei terreni silicei. Vitigni che esprimono mineralità: Riesling (specie nelle ardesie della Mosella), Sauvignon Blanc nella silice di Sancerre e Pouilly Fumé (sentore fumé). Convenzionalmente per 'minerale' si intende: pietra focaia, polvere da sparo, silice, fumé, pietra di fiume. NB: la nota minerale è più evidente nel vino appena versato e freddo. Marcatore di vitigno/territorio.",
    pagina: 91
  },
  "olfatto.erbe_aromatiche": {
    titolo: "Famiglia Erbe Aromatiche",
    definizione: "Dipende da sostanze terpeniche primarie e secondarie liberate dopo la fermentazione, proprie del DNA di alcuni vitigni. Diversamente dal minerale, è ESCLUSIVA ESPRESSIONE DEL VITIGNO (indipendente dal territorio).",
    cosa_significa: "Esempi: basilico, tiglio, timo, rosmarino, salvia. Salvo casi netti (salvia nei Moscato, basilico nei Pigato), questi sentori non hanno grande forza: vanno colti con un po' di attesa, inspirazioni profonde, olfatto sveglio e sensibile.",
    pagina: 92
  },
  "olfatto.speziato": {
    titolo: "Famiglia Speziata",
    definizione: "La famiglia più ampia e diffusa nei vini. Varietale in alcuni vitigni (pepe nero nel Syrah), molto più spesso formata da reazioni con sostanze cedute dal legno.",
    cosa_significa: "Descrittori più tipici di BARRIQUE: chiodi di garofano, vaniglia. Tipici di LEGNO GRANDE: liquirizia, noce moscata. Dalla tipologia di spezie si può capire (non in maniera categorica) la dimensione del legno. Pepe (bianco, nero, verde), cardamomo, anice stellato: passaggio in legno o varietali. Curcuma, paprika, zafferano: spesso impreziosiscono (es. note di zafferano nei muffati). Marcatori della MODALITÀ DI PRODUZIONE/ÉLEVAGE.",
    pagina: 92
  },
  "olfatto.tostato": {
    titolo: "Famiglia Tostata",
    definizione: "Chiaro e inequivocabile segno del PASSAGGIO IN BARRIQUE. Le tostature sono dovute a sostanze empireumatiche prodotte dalla bruciatura (tostatura) del legno. Solo le barrique sono tostate.",
    cosa_significa: "Descrittori: cioccolato, caffè, arachide, goudron, tabacco, cuoio. Marcatori esclusivi della barrique (rare eccezioni varietali). Sono molecole più pesanti: si sprigionano dopo qualche inspirazione, ma si colgono ancora a bicchiere vuoto. Il FREDDO ne diminuisce l'intensità, che cresce man mano che il vino si scalda. Nel gusto moderno NON sono più molto amate: meglio che non siano dominanti per non coprire gli altri descrittori.",
    pagina: 93
  },
  "olfatto.balsamico": {
    titolo: "Famiglia Balsamica",
    definizione: "Nel vino è SEMPRE una nota positiva. Non è mai troppo invasivo ed è sempre piacevole. Non è chiaro se sia un'evoluzione dei vegetali o delle erbe aromatiche: si produce in molti vini dopo un periodo di elevazione e affinamento.",
    cosa_significa: "Descrittori: menta, eucalipto, conifera. Menta = tipica di vini più giovani; incenso = dopo lunga evoluzione. Tipico di alcuni vitigni e quindi marcatore.",
    pagina: 94
  },
  "olfatto.etereo": {
    titolo: "Famiglia Eterea",
    definizione: "Si genera per reazione chimica tra alcoli, ha bisogno di tempo evolutivo e ambiente riduttivo. Si produce quindi con AFFINAMENTO IN BOTTIGLIA, più facile in vini di buon grado alcolico.",
    cosa_significa: "POSITIVI (impreziosiscono): sapone, cera, gommalacca, ceralacca. Marcatori di affinamento in bottiglia. NEGATIVI (anche in vini giovani): acetone, vernice, smalto → indicano alcol poco integrato o lavorazione non perfetta, marcatori di non alta qualità. Da usare solo se nettamente percettibili: la sola presenza non basta per descrivere il vino come etereo.",
    pagina: 94
  },
  "olfatto.sentori_diversi": {
    titolo: "Sentori diversi (no famiglia)",
    definizione: "Descrittori non riconducibili a categorie specifiche. Tra i più importanti per la degustazione.",
    cosa_significa: "MIELE: nei vini dolci e bianchi da uve mature (castagno=vegetale, acacia=pungente, millefiori=dolce). TARTUFO/FUNGO: grandi vini in lungo élevage. FOXY: leggera nota selvatica in alcuni Sangiovese, considerata positiva ed elegante. GIBIER: selvaggina, rustico, marcatore dell'Aglianico. VINOSO: complesso fruttato/floreale che ricorda il mosto, tipico dei novelli/giovanissimi. PIPÌ DI GATTO (bosso): componente solforato, tipico del Sauvignon Blanc; se troppo evidente è quasi un difetto. CROSTA DI PANE: lieviti o riposo sui lieviti, inevitabile nel metodo classico. LEGNO ANTICO/ANTIQUARIO: tra etereo e speziato, sempre positivo da buon affinamento.",
    pagina: 94
  },
  "olfatto.difetti": {
    titolo: "Difetti olfattivi",
    definizione: "Tra i sentori, alcuni non sono MAI positivi: pelliccia umida/straccio bagnato (non perfetta conduzione igienica, oppure semplice riduzione che svanisce in pochi minuti), muffa (estremamente negativo), formaggio, yogurt, geranio.",
    cosa_significa: "Vanno notati ma con cautela: alcuni potrebbero essere riduzione transitoria del soggiorno in vetro. Il sentore di TAPPO si valuta alla prima inspirazione a bicchiere fermo: se presente, si interrompe la degustazione. La forza impattante del profumo è mediamente uguale tra i vini e non denota qualità.",
    pagina: 96
  },

  // ============ SENSAZIONI TATTILI ============
  "tattili.intro": {
    titolo: "Sensazioni tattili del vino",
    definizione: "Percezioni che non hanno sapore ma hanno effetto tattile. Le principali: PUNGENZA (CO2, tipica spumanti), PSEUDO-CALORE (alcol), ASTRINGENZA (tannino, lega gengive), CONSISTENZA (densità gustativa, dalla scala acqua-olio).",
    pagina: 101
  },
  "tattili.mappa_sapori": {
    titolo: "Mappa dei sapori",
    definizione: "DOLCE (punta lingua, immediato). ACIDO (lati lingua, dopo 2s, dura 4-5s). SALATO/SAPIDITÀ (lati posteriori, dopo 3-4s, dura 6-7s). AMARO (zona centrale posteriore, dopo 4-5s, dura 7-8s, ultima ad apparire e a sparire). UMAMI (zona ancora dibattuta).",
    cosa_significa: "Le diverse sensazioni si intersecano nel tempo. Un buon vino dà subito dolcezza (se ha zucchero), poi acidità che diventa freschezza, tannino (se rosso) che si riassorbe prima dell'acidità, poi alcol (mai sovrastante), infine sapidità e amaro.",
    pagina: 100
  },

  // ============ ESERCIZIO DEI 6 BICCHIERINI ============
  "esercizio.sei_bicchierini": {
    titolo: "Esercizio dei 6 bicchierini",
    definizione: "Si prendono 6 bicchierini: (1) 50 g/l zucchero, (2) acqua + 12% alcol, (3) 2% glicerina, (4) 5% acido tartarico, (5) 3% acido tannico, (6) sale da cucina. In un settimo bicchiere si compone un 'vino' miscelando le componenti.",
    cosa_significa: "Esempi di scoperte pratiche: ACIDO + SALE → il sale quasi sparisce e riappare solo nel finale. AGGIUNTA ALCOL → sia acidità che alcol si attenuano (si bilanciano). AGGIUNTA TANNINO → assaggio spigoloso, durezze prevalenti. AGGIUNTA ZUCCHERO + GLICERINA → riequilibrio durezze e calo della sensazione tannica.",
    pagina: 115
  }
};

// ============================================================
// MAPPATURA: associa ogni chip/opzione della scheda alla voce teoria
// ============================================================
// La chiave è "{tipo}.{valore}" dove valore è il data-v del chip
// ============================================================

window.TEORIA_MAP = {
  // Colore (chip esame visivo)
  "colore:paglierino": "colore.paglierino",
  "colore:dorato": "colore.dorato",
  "colore:aranciato": "colore.aranciato",
  "colore:cerasuolo": "colore.cerasuolo",
  "colore:ramato": "colore.ramato",
  "colore:porpora": "colore.porpora",
  "colore:rubino": "colore.rubino",
  "colore:granato": "colore.granato",
  // Riflesso (rimanda al colore)
  "riflesso:non_rilevato": "riflesso.intro",
  "riflesso:verdolino": "riflesso.verdolino",
  "riflesso:dorato": "riflesso.dorato",
  "riflesso:aranciato": "riflesso.aranciato",
  "riflesso:porpora": "riflesso.porpora",
  "riflesso:granato": "riflesso.granato",
  // Densità cromatica
  "densita:trasparente": "densita_cromatica.trasparente",
  "densita:compatto": "densita_cromatica.compatto",
  // Limpidezza
  "limpidezza:opaco": "limpidezza.opaco",
  "limpidezza:limpido": "limpidezza.limpido",
  // Vivacità
  "vivacita:cupo": "vivacita.cupo",
  "vivacita:vivace": "vivacita.vivace",
  "vivacita:luminoso": "vivacita.luminoso",
  // Perlage
  "perlage_grana:grandi": "perlage.grandi",
  "perlage_grana:fini": "perlage.fini",
  // Zucchero
  "zucchero:secco": "zucchero.secco",
  "zucchero:tendente_al_dolce": "zucchero.tendente_al_dolce",
  "zucchero:dolce": "zucchero.dolce",
  "zucchero:molto_dolce": "zucchero.molto_dolce",
  // Alcol
  "alcol:contenuto": "alcol.contenuto",
  "alcol:caldo": "alcol.caldo",
  "alcol:piu_che_caldo": "alcol.piu_che_caldo",
  "alcol:molto_caldo": "alcol.molto_caldo",
  // Acidità
  "acidita:contenuto": "acidita.contenuto",
  "acidita:fresco": "acidita.fresco",
  "acidita:piu_che_fresco": "acidita.piu_che_fresco",
  "acidita:molto_fresco": "acidita.molto_fresco",
  // Tannino
  "tannino:amaro": "tannino.amaro",
  "tannino:vegetale": "tannino.vegetale",
  "tannino:maturo": "tannino.maturo",
  "tannino:raffinato": "tannino.raffinato",
  // Sapidità
  "sapidita:non_avvertibile": "sapidita.non_avvertibile",
  "sapidita:contenuta": "sapidita.contenuta",
  "sapidita:sapida": "sapidita.sapida",
  "sapidita:piu_che_sapida": "sapidita.piu_che_sapida",
  // Chiusura
  "chiusura:imprecisa": "chiusura.imprecisa",
  "chiusura:buona": "chiusura.buona",
  "chiusura:precisa": "chiusura.precisa",
  "chiusura:elegante": "chiusura.elegante",
  // Prospettive
  "prospettive:da_bere_subito": "prospettive.da_bere_subito",
  "prospettive:brevi_prospettive": "prospettive.brevi_prospettive",
  "prospettive:medie_prospettive": "prospettive.medie_prospettive",
  "prospettive:lunghe_prospettive": "prospettive.lunghe_prospettive",
  // Famiglie olfattive (data-v delle 9 famiglie)
  "olfatto:fruttato": "olfatto.fruttato",
  "olfatto:floreale": "olfatto.floreale",
  "olfatto:vegetale": "olfatto.vegetale",
  "olfatto:erbe_aromatiche": "olfatto.erbe_aromatiche",
  "olfatto:minerale": "olfatto.minerale",
  "olfatto:speziato": "olfatto.speziato",
  "olfatto:tostato": "olfatto.tostato",
  "olfatto:balsamico": "olfatto.balsamico",
  "olfatto:etereo": "olfatto.etereo",
};

// ============================================================
// MAPPATURA SCALE NUMERICHE
// La chiave è "scala:NUM" → voce teoria
// ============================================================

window.TEORIA_SCALA = {
  // Complessità olfattiva 12-16
  "complessita:12": "complessita.facile",
  "complessita:13": "complessita.facile",
  "complessita:14": "complessita.complesso",
  "complessita:15": "complessita.piu_che_complesso",
  "complessita:16": "complessita.ampio",
  // Qualità olfattiva 14-20
  "qualita_olf:14": "qualita_olf.accettabile",
  "qualita_olf:15": "qualita_olf.accettabile",
  "qualita_olf:16": "qualita_olf.fine",
  "qualita_olf:17": "qualita_olf.fine",
  "qualita_olf:18": "qualita_olf.piu_che_fine",
  "qualita_olf:19": "qualita_olf.piu_che_fine",
  "qualita_olf:20": "qualita_olf.eccellente",
  // Equilibrio 12-18
  "equilibrio:12": "equilibrio.squilibrato",
  "equilibrio:13": "equilibrio.squilibrato",
  "equilibrio:14": "equilibrio.in_fase_di_equilibrio",
  "equilibrio:15": "equilibrio.in_fase_di_equilibrio",
  "equilibrio:16": "equilibrio.bilanciato",
  "equilibrio:17": "equilibrio.bilanciato",
  "equilibrio:18": "equilibrio.equilibrato",
  // Persistenza 10-16
  "persistenza:10": "persistenza.accettabile",
  "persistenza:11": "persistenza.accettabile",
  "persistenza:12": "persistenza.persistente",
  "persistenza:13": "persistenza.persistente",
  "persistenza:14": "persistenza.piu_che_persistente",
  "persistenza:15": "persistenza.piu_che_persistente",
  "persistenza:16": "persistenza.lungo",
  // Qualità gustativa 18-24
  "qualita_gust:18": "qualita_gust.accettabile",
  "qualita_gust:19": "qualita_gust.accettabile",
  "qualita_gust:20": "qualita_gust.fine",
  "qualita_gust:21": "qualita_gust.fine",
  "qualita_gust:22": "qualita_gust.piu_che_fine",
  "qualita_gust:23": "qualita_gust.piu_che_fine",
  "qualita_gust:24": "qualita_gust.eccellente",
  // Dimensione
  "dimensione:strutturato": "dimensione.strutturato",
  "dimensione:sottile": "dimensione.sottile",
  "dimensione:distinto": "dimensione.distinto",
  "dimensione:suggestivo": "dimensione.suggestivo",
};

