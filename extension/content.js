// Content script per l'estensione ChatGPT to PDF
class ChatGPTExporter {
  constructor() {
    this.messages = [];
    this.isExporting = false;
    this.init();
  }

  init() {
    this.createExportButton();
    this.setupMessageListener();
  }

  createExportButton() {
    // Rimuovi bottone esistente se presente
    const existingBtn = document.getElementById('chatgpt-pdf-export-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Crea il bottone di esportazione
    const exportBtn = document.createElement('button');
    exportBtn.id = 'chatgpt-pdf-export-btn';
    exportBtn.innerHTML = '📄 Esporta PDF';
    exportBtn.className = 'pdf-export-button';
    exportBtn.title = 'Esporta questa conversazione in PDF';
    
    exportBtn.addEventListener('click', () => this.exportToPDF());

    // Inserisci il bottone nell'interfaccia
    this.insertButton(exportBtn);
  }

  insertButton(button) {
    // Prova diversi selettori per trovare il posto giusto per il bottone
    const selectors = [
      'nav[aria-label="Chat history"] + div',
      '.flex.flex-col.items-end',
      'main .flex.flex-col',
      'main > div'
    ];

    let inserted = false;
    for (const selector of selectors) {
      const target = document.querySelector(selector);
      if (target && !inserted) {
        target.appendChild(button);
        inserted = true;
        break;
      }
    }

    // Fallback: inserisci in alto a destra
    if (!inserted) {
      document.body.appendChild(button);
      button.style.position = 'fixed';
      button.style.top = '20px';
      button.style.right = '20px';
      button.style.zIndex = '10000';
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'exportToPDF') {
        this.exportToPDF();
        sendResponse({ success: true });
      } else if (request.action === 'getConversation') {
        const conversation = this.extractConversation();
        sendResponse({ conversation });
      }
    });
  }

  async extractConversation() {
    const messages = [];
    
    // Selettori per i messaggi (possono cambiare con gli aggiornamenti di ChatGPT)
    const messageSelectors = [
      '[data-message-author-role]',
      '.group.w-full',
      '[data-testid*="conversation-turn"]'
    ];

    let messageElements = [];
    for (const selector of messageSelectors) {
      messageElements = document.querySelectorAll(selector);
      if (messageElements.length > 0) break;
    }

    for (let index = 0; index < messageElements.length; index++) {
      const messageEl = messageElements[index];
      try {
        const isUser = this.isUserMessage(messageEl);
        const messageContent = this.extractMessageContent(messageEl);
        const images = await this.extractMessageImages(messageEl);
        
        if (messageContent.text.trim() || images.length > 0) {
          messages.push({
            role: isUser ? 'user' : 'assistant',
            content: messageContent.text,
            html: messageContent.html,
            images: images,
            index: index
          });
        }
      } catch (error) {
        console.warn('Errore nell\'estrazione del messaggio:', error);
      }
    }

    return {
      title: this.getConversationTitle(),
      timestamp: new Date().toLocaleString('it-IT'),
      messages: messages,
      url: window.location.href
    };
  }

  isUserMessage(element) {
    // Vari modi per identificare se è un messaggio utente
    const userIndicators = [
      () => element.getAttribute('data-message-author-role') === 'user',
      () => element.querySelector('[data-message-author-role="user"]'),
      () => element.classList.contains('dark:bg-gray-800'),
      () => !element.querySelector('[data-message-author-role="assistant"]')
    ];

    return userIndicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  extractMessageContent(element) {
    const result = {
      text: '',
      html: '',
      images: []
    };

    // Estrai le immagini dal messaggio
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && !img.src.includes('data:image/svg')) {
        result.images.push({
          src: img.src,
          alt: img.alt || 'Immagine',
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        });
      }
    });

    // Prova diversi selettori per il contenuto testuale
    const contentSelectors = [
      '.markdown',
      '[data-message-content]',
      '.prose',
      'div > div > div',
      'p',
      'div'
    ];

    for (const selector of contentSelectors) {
      const contentEl = element.querySelector(selector);
      if (contentEl) {
        // Crea una copia dell'elemento per rimuovere le immagini
        const clonedContent = contentEl.cloneNode(true);
        const imgElements = clonedContent.querySelectorAll('img');
        imgElements.forEach(img => {
          const placeholder = document.createElement('span');
          placeholder.textContent = '[IMMAGINE]';
          img.parentNode.replaceChild(placeholder, img);
        });

        // Estrai sia HTML che testo per compatibilità
        result.html = this.cleanHTML(clonedContent.innerHTML);
        result.text = this.cleanContent(clonedContent.innerText || clonedContent.textContent || '');
        break;
      }
    }

    if (!result.text && !result.html) {
      // Fallback
      const clonedContent = element.cloneNode(true);
      const imgElements = clonedContent.querySelectorAll('img');
      imgElements.forEach(img => {
        const placeholder = document.createElement('span');
        placeholder.textContent = '[IMMAGINE]';
        img.parentNode.replaceChild(placeholder, img);
      });
      result.html = this.cleanHTML(clonedContent.innerHTML);
      result.text = this.cleanContent(clonedContent.innerText || clonedContent.textContent || '');
    }

    return result;
  }

  cleanHTML(html) {
    // Pulisci l'HTML da classi e attributi specifici di ChatGPT
    return html
      .replace(/\sclass="[^"]*"/g, '')
      .replace(/\sdata-[a-z-]+="[^"]*"/g, '')
      .trim();
  }

  cleanContent(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  async extractMessageImages(element) {
    const images = [];
    
    // Selettori per diverse tipologie di immagini in ChatGPT
    const imageSelectors = [
      'img[src]',
      '[data-testid*="image"] img',
      '.dalle-image img',
      '.uploaded-image img',
      '[role="img"]',
      'picture img',
      '.image-container img'
    ];
    
    for (const selector of imageSelectors) {
      const imgElements = element.querySelectorAll(selector);
      
      for (const img of imgElements) {
        try {
          // Salta le icone e immagini piccole (probabilmente UI elements)
          if (img.width < 50 || img.height < 50) continue;
          
          const imageData = await this.convertImageToBase64(img);
          if (imageData) {
            images.push({
              data: imageData,
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
              alt: img.alt || '',
              src: img.src
            });
          }
        } catch (error) {
          console.warn('Errore nell\'estrazione dell\'immagine:', error);
        }
      }
    }
    
    return images;
  }

  async convertImageToBase64(img) {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Usa le dimensioni naturali dell'immagine
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        // Disegna l'immagine sul canvas
        ctx.drawImage(img, 0, 0);
        
        // Converti in base64
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64);
      } catch (error) {
        console.warn('Errore nella conversione immagine:', error);
        resolve(null);
      }
    });
  }

  getConversationTitle() {
    // Cerca il titolo della conversazione
    const titleSelectors = [
      'title',
      'h1',
      '[data-testid*="conversation-title"]',
      'nav a.active',
      '.text-token-text-primary'
    ];

    for (const selector of titleSelectors) {
      const titleEl = document.querySelector(selector);
      if (titleEl && titleEl.textContent.trim()) {
        return titleEl.textContent.trim();
      }
    }

    return 'Conversazione ChatGPT';
  }

  async exportToPDF() {
    if (this.isExporting) return;
    
    this.isExporting = true;
    const button = document.getElementById('chatgpt-pdf-export-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Esportando...';
    button.disabled = true;

    try {
      const conversation = await this.extractConversation();
      await this.generatePDF(conversation);
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      alert('Errore durante l\'esportazione del PDF. Controlla la console per i dettagli.');
    } finally {
      this.isExporting = false;
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  async generatePDF(conversation) {
    // Crea una finestra nascosta con il contenuto formattato
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${conversation.title}</title>
        <!-- Highlight.js per syntax highlighting -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          .meta {
            color: #666;
            font-size: 14px;
          }
          .message {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .message-role {
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .user-role {
            color: #27ae60;
          }
          .assistant-role {
            color: #3498db;
          }
          .message-content {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ddd;
          }
          .user-content {
            background: #e8f5e8;
            border-left-color: #27ae60;
          }
          .assistant-content {
            background: #e3f2fd;
            border-left-color: #3498db;
          }

          /* Stili Markdown */
          .message-content h1 {
            font-size: 1.8em;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            border-bottom: 2px solid #ddd;
            padding-bottom: 0.3em;
          }
          .message-content h2 {
            font-size: 1.5em;
            margin-top: 0.5em;
            margin-bottom: 0.4em;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.2em;
          }
          .message-content h3 {
            font-size: 1.3em;
            margin-top: 0.5em;
            margin-bottom: 0.3em;
          }
          .message-content h4 {
            font-size: 1.1em;
            margin-top: 0.4em;
            margin-bottom: 0.3em;
          }
          .message-content ul, .message-content ol {
            margin: 0.8em 0;
            padding-left: 2em;
          }
          .message-content li {
            margin: 0.3em 0;
          }
          .message-content blockquote {
            border-left: 4px solid #ddd;
            margin: 1em 0;
            padding: 0.5em 1em;
            background: rgba(0,0,0,0.03);
            font-style: italic;
          }
          .message-content p {
            margin: 0.8em 0;
          }
          .message-content strong {
            font-weight: 600;
          }
          .message-content em {
            font-style: italic;
          }
          .message-content code {
            background: rgba(27,31,35,0.05);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 0.9em;
          }
          .message-content pre {
            background: #f6f8fa;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1em 0;
            border: 1px solid #e1e4e8;
          }
          .message-content pre code {
            background: none;
            padding: 0;
            font-size: 0.85em;
            line-height: 1.45;
          }
          .message-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          .message-content th, .message-content td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
          }
          .message-content th {
            background: #f6f8fa;
            font-weight: 600;
          }
          .message-content a {
            color: #0366d6;
            text-decoration: none;
          }
          .message-content a:hover {
            text-decoration: underline;
          }

          .message-images {
            margin-top: 15px;
          }
          .image-container {
            page-break-before: always;
            page-break-after: always;
            page-break-inside: avoid;
            margin: 20px 0;
            text-align: center;
            padding: 0;
          }
          .message-image {
            max-width: calc(100% - 40px);
            max-height: calc(100vh - 100px);
            width: auto;
            height: auto;
            margin: 20px auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            object-fit: contain;
          }
          .image-caption {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            font-style: italic;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            .message {
              page-break-inside: avoid;
            }
            .image-container {
              page-break-before: always;
              page-break-after: always;
              page-break-inside: avoid;
              margin: 0;
              padding: 20px 0;
              height: calc(100vh - 40px);
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .message-image {
              max-width: calc(100% - 30px);
              max-height: calc(100vh - 80px);
              margin: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${conversation.title}</div>
          <div class="meta">
            Esportato il: ${conversation.timestamp}<br>
            URL: ${conversation.url}<br>
            Messaggi: ${conversation.messages.length}
          </div>
        </div>
        <div class="conversation">
          ${conversation.messages.map(msg => {
            let messageHtml = `
              <div class="message">
                <div class="message-role ${msg.role}-role">
                  ${msg.role === 'user' ? 'UTENTE' : 'CHATGPT'}
                </div>
                <div class="message-content ${msg.role}-content">
                  ${msg.html || msg.content}
                </div>`;

            // Aggiungi le immagini se presenti
            if (msg.images && msg.images.length > 0) {
              messageHtml += `<div class="message-images">`;
              msg.images.forEach((image, imgIndex) => {
                messageHtml += `
                  <div class="image-container">
                    <img src="${image.data}"
                         alt="${image.alt}"
                         class="message-image"
                         data-width="${image.width}"
                         data-height="${image.height}" />
                    ${image.alt ? `<div class="image-caption">${image.alt}</div>` : ''}
                  </div>`;
              });
              messageHtml += `</div>`;
            }

            messageHtml += `</div>`;
            return messageHtml;
          }).join('')}
        </div>
        <script>
          // Inizializza syntax highlighting quando la pagina è caricata
          document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('pre code').forEach((block) => {
              hljs.highlightElement(block);
            });
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Attendi che la finestra sia caricata, poi apri il dialogo di stampa
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // La finestra si chiuderà automaticamente dopo la stampa/salvataggio
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  }
}

// Inizializza l'esportatore quando la pagina è caricata
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ChatGPTExporter());
} else {
  new ChatGPTExporter();
}

// Reinizializza se la pagina cambia (per le SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => new ChatGPTExporter(), 1000);
  }
}).observe(document, { subtree: true, childList: true });