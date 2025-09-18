# Creazione Icone per l'Estensione

L'estensione Chrome richiede icone in formato PNG di diverse dimensioni. Puoi utilizzare il file `icon.svg` fornito per creare tutte le icone necessarie.

## 📏 Dimensioni Richieste

- **icon16.png** - 16x16 pixel (mostrata nelle pagine delle estensioni)
- **icon48.png** - 48x48 pixel (mostrata nella pagina di gestione estensioni)  
- **icon128.png** - 128x128 pixel (mostrata nel Chrome Web Store)

## 🎨 Metodo 1: Conversione Online (Raccomandato)

### Usando un convertitore SVG-PNG online:

1. Vai su [SVG to PNG Converter](https://svgtopng.com/) o simili
2. Carica il file `icon.svg`
3. Imposta le dimensioni richieste:
   - 16x16 → salva come `icon16.png`
   - 48x48 → salva come `icon48.png` 
   - 128x128 → salva come `icon128.png`
4. Crea una cartella `icons/` nella directory dell'estensione
5. Inserisci i file PNG nella cartella `icons/`

## 🖥️ Metodo 2: Usando Inkscape (Software Gratuito)

1. Scarica e installa [Inkscape](https://inkscape.org/)
2. Apri `icon.svg` in Inkscape
3. Vai su File → Esporta PNG
4. Imposta le dimensioni e esporta ogni icona:

```bash
# Comando da terminale (se hai Inkscape installato)
inkscape icon.svg -w 16 -h 16 -o icons/icon16.png
inkscape icon.svg -w 48 -h 48 -o icons/icon48.png  
inkscape icon.svg -w 128 -h 128 -o icons/icon128.png
```

## 🎯 Metodo 3: Usando GIMP

1. Apri GIMP
2. Importa `icon.svg`
3. Quando richiesto, imposta le dimensioni (16x16, 48x48, 128x128)
4. Esporta come PNG per ogni dimensione

## 🚀 Metodo 4: Creazione Automatica con Node.js

Se hai Node.js installato, puoi usare questo script:

```javascript
// save as generate-icons.js
const sharp = require('sharp'); // npm install sharp

const sizes = [16, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('icon.svg')
      .resize(size, size)
      .png()
      .toFile(`icons/icon${size}.png`);
    
    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(console.error);
```

Esegui:
```bash
npm init -y
npm install sharp
mkdir icons
node generate-icons.js
```

## 📂 Struttura File Finale

Dopo aver creato le icone, la tua cartella dovrebbe apparire così:

```
chatgpt-pdf-exporter/
├── manifest.json
├── content.js
├── styles.css
├── popup.html
├── popup.css  
├── popup.js
├── icon.svg              # File sorgente (opzionale)
├── icons/                # Cartella icone richiesta
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🎨 Personalizzazione Icona

Se vuoi personalizzare l'icona, modifica il file `icon.svg`:

### Cambia Colori
```xml
<!-- Gradiente principale -->
<stop offset="0%" style="stop-color:#TUO_COLORE_1"/>
<stop offset="100%" style="stop-color:#TUO_COLORE_2"/>

<!-- Colore PDF -->
<circle cx="64" cy="102" r="16" fill="#TUO_COLORE_PDF"/>
```

### Cambia Testo
```xml
<!-- Cambia "PDF" con altro testo -->
<text x="64" y="108">TUO_TESTO</text>
```

## ⚠️ Note Importanti

1. **Formato**: Usa solo PNG per le icone (non JPG o altri formati)
2. **Dimensioni esatte**: Le dimensioni devono essere esatte (16x16, 48x48, 128x128)
3. **Trasparenza**: PNG supporta la trasparenza se necessaria
4. **Qualità**: Assicurati che le icone siano nitide a tutte le dimensioni
5. **Percorso**: Il manifest.json punta a `icons/iconXX.png`, quindi rispetta questa struttura

## 🔧 Risoluzione Problemi

### "Icona non trovata"
- Verifica che la cartella `icons/` sia nella directory principale dell'estensione
- Controlla che i nomi dei file corrispondano a quelli nel `manifest.json`
- Assicurati che i file siano in formato PNG

### "Icona sfocata"
- Usa dimensioni esatte senza ridimensionamento automatico
- Assicurati che l'SVG sia vettoriale e non rasterizzato

### "Errore di caricamento estensione"
- Controlla la console di Chrome per errori specifici
- Verifica che tutti i file icona siano presenti e leggibili

---

Una volta create le icone, la tua estensione sarà completa e pronta per l'uso! 🎉