# ChatGPT to PDF Exporter 📄

Un'estensione Chrome che ti permette di esportare facilmente le tue conversazioni ChatGPT in formato PDF con un design professionale e pulito.

## ✨ Funzionalità

- **Esportazione PDF con un click** - Converti le tue conversazioni ChatGPT in PDF formattati professionalmente
- **🖼️ Supporto immagini completo** - Include automaticamente tutte le immagini presenti nella conversazione
- **📄 Layout immagini ottimizzato** - Ogni immagine viene posizionata su pagina separata a larghezza piena con margini
- **Interfaccia intuitiva** - Bottone di esportazione integrato nell'interfaccia ChatGPT
- **👁️ Anteprima avanzata** - Visualizza testo E immagini prima dell'esportazione
- **Opzioni personalizzabili** - Includi o escludi timestamp e URL
- **Design responsive** - Funziona perfettamente sia su desktop che mobile
- **Supporto multilingua** - Interfaccia in italiano con supporto per contenuti in qualsiasi lingua

## 🚀 Installazione

### Metodo 1: Installazione Manuale (Modalità Sviluppatore)

1. **Scarica i file dell'estensione**
   - I file sono già salvati nella cartella `chatgpt-pdf-exporter`

2. **Abilita la modalità sviluppatore in Chrome**
   - Apri Chrome e vai su `chrome://extensions/`
   - Attiva l'interruttore "Modalità sviluppatore" in alto a destra

3. **Carica l'estensione**
   - Clicca su "Carica estensione non pacchettizzata"
   - Seleziona la cartella `chatgpt-pdf-exporter`
   - L'estensione apparirà nella lista delle estensioni installate

4. **Fissa l'estensione** (opzionale)
   - Clicca sull'icona del puzzle nella barra degli strumenti
   - Clicca sulla puntina accanto a "ChatGPT to PDF Exporter"

## 📁 Struttura dei File

```
chatgpt-pdf-exporter/
├── manifest.json          # Configurazione dell'estensione
├── content.js             # Script che interagisce con ChatGPT
├── styles.css             # Stili per il bottone di esportazione
├── popup.html             # Interfaccia del popup
├── popup.css              # Stili del popup
├── popup.js               # Logica del popup
└── README.md              # Questo file
```

## 🎯 Come Utilizzare

### Esportazione Rapida
1. Vai su [ChatGPT](https://chat.openai.com) o [ChatGPT.com](https://chatgpt.com)
2. Apri una conversazione
3. Cerca il bottone **"📄 Esporta PDF"** nell'interfaccia
4. Clicca sul bottone per esportare immediatamente

### Esportazione con Opzioni
1. Clicca sull'icona dell'estensione nella barra degli strumenti
2. Visualizza l'anteprima della conversazione (opzionale)
3. Configura le opzioni di esportazione:
   - ✅ Includi timestamp
   - ✅ Includi URL conversazione
4. Clicca su **"Esporta PDF"**

### Anteprima
- Clicca su **"Anteprima"** nel popup per vedere come apparirà il PDF
- Usa i controlli di anteprima per stampare o chiudere la finestra

## 🎨 Caratteristiche del PDF

Il PDF esportato include:

- **Intestazione elegante** con titolo della conversazione
- **Metadata** con data di esportazione, URL e conteggio messaggi
- **Messaggi formattati** con colori distinti per utente e ChatGPT
- **🖼️ Immagini ad alta qualità** - Tutte le immagini della conversazione incluse automaticamente
- **📐 Layout immagini professionale** - Ogni immagine su pagina separata, larghezza piena con margini
- **🏷️ Didascalie immagini** - Alt-text e descrizioni preservati
- **Design pulito** ottimizzato per la stampa
- **Responsive** che si adatta a diverse dimensioni di pagina

## 🖼️ Gestione Immagini

L'estensione gestisce automaticamente tutti i tipi di immagini presenti nelle conversazioni ChatGPT:

### **Tipi di immagini supportate:**
- **Immagini caricate dall'utente** - Foto, screenshot, documenti
- **Immagini generate da DALL-E** - Creazioni AI di ChatGPT
- **Immagini condivise nei messaggi** - Link e allegati

### **Caratteristiche del layout immagini:**
- **Una immagine per pagina** - Ogni immagine occupa una pagina dedicata
- **Larghezza piena con margini** - Utilizzazione ottimale dello spazio pagina
- **Qualità preservata** - Conversione in alta risoluzione (JPEG 90%)
- **Didascalie incluse** - Alt-text e descrizioni mantenute
- **Ordine cronologico** - Immagini nell'ordine di apparizione nella conversazione

### **Dimensioni e qualità:**
- **Risoluzione**: Mantenuta quella originale
- **Formato**: Convertito in JPEG per ottimizzare dimensione file
- **Filtro intelligente**: Ignora icone e elementi UI (< 50x50 px)
- **Compatibilità stampa**: Layout ottimizzato per stampa fisica

## 🔧 Risoluzione Problemi

### Il bottone non appare
- Verifica di essere su una pagina ChatGPT valida
- Ricarica la pagina
- Controlla che l'estensione sia abilitata

### L'esportazione non funziona
- Assicurati che ci siano messaggi nella conversazione
- Controlla la console per errori (F12 → Console)
- Riavvia Chrome e riprova

### Errori di permessi
- L'estensione richiede accesso a `chat.openai.com` e `chatgpt.com`
- Verifica che i permessi siano concessi nelle impostazioni dell'estensione

### Problemi con le immagini
- **Immagini non appaiono nel PDF**: Ricarica la pagina e riprova l'esportazione
- **Immagini sfocate**: Dovute alla conversione - la qualità è ottimizzata al 90%
- **File PDF troppo grande**: Le immagini ad alta risoluzione aumentano la dimensione
- **Alcune immagini mancanti**: L'estensione ignora icone e elementi UI (< 50x50 px)

## 📝 Note Tecniche

- **Versione Manifest**: V3 (ultima versione)
- **Compatibilità**: Chrome 88+
- **Permessi richiesti**: activeTab, storage
- **Host supportati**: chat.openai.com, chatgpt.com

## 🔄 Aggiornamenti

Per aggiornare l'estensione:
1. Sostituisci i file nella cartella dell'estensione
2. Vai su `chrome://extensions/`
3. Clicca il bottone "Ricarica" dell'estensione

---

**Versione**: 1.0  
**Data**: Settembre 2025  
**Compatibilità**: Chrome 88+ (Manifest V3)  
**Lingua**: Italiano

L'estensione è pronta all'uso! 🎉