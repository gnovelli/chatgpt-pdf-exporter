// Popup script per l'estensione ChatGPT to PDF
class PopupController {
  constructor() {
    this.elements = {
      exportBtn: document.getElementById('exportBtn'),
      previewBtn: document.getElementById('previewBtn'),
      status: document.getElementById('status'),
      messageCount: document.getElementById('messageCount'),
      conversationTitle: document.getElementById('conversationTitle'),
      includeTimestamp: document.getElementById('includeTimestamp'),
      includeUrl: document.getElementById('includeUrl')
    };
    
    this.currentTab = null;
    this.conversation = null;
    
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    this.setupEventListeners();
    await this.loadConversationInfo();
    this.loadSettings();
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      // Verifica se siamo su ChatGPT
      if (!this.isChatGPTTab()) {
        this.showError('Questa estensione funziona solo su ChatGPT');
        return;
      }
    } catch (error) {
      this.showError('Errore nel recupero della tab corrente');
      console.error(error);
    }
  }

  isChatGPTTab() {
    return this.currentTab && 
           (this.currentTab.url.includes('chat.openai.com') || 
            this.currentTab.url.includes('chatgpt.com'));
  }

  setupEventListeners() {
    this.elements.exportBtn.addEventListener('click', () => this.handleExport());
    this.elements.previewBtn.addEventListener('click', () => this.handlePreview());
    
    // Salva le impostazioni quando cambiano
    this.elements.includeTimestamp.addEventListener('change', () => this.saveSettings());
    this.elements.includeUrl.addEventListener('change', () => this.saveSettings());
  }

  async loadConversationInfo() {
    if (!this.isChatGPTTab()) return;

    try {
      this.showStatus('Caricamento informazioni conversazione...', 'loading');
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getConversation'
      });
      
      if (response && response.conversation) {
        this.conversation = response.conversation;
        this.updateConversationInfo();
        
        // Conta le immagini totali
        const totalImages = this.conversation.messages.reduce((count, msg) => {
          return count + (msg.images ? msg.images.length : 0);
        }, 0);
        
        const statusMsg = totalImages > 0 
          ? `Pronto per esportare (${totalImages} immagine${totalImages > 1 ? 'e' : ''})`
          : 'Pronto per esportare';
          
        this.showStatus(statusMsg, 'success');
      } else {
        this.showError('Impossibile trovare una conversazione attiva');
      }
    } catch (error) {
      console.error('Errore nel caricamento delle informazioni:', error);
      this.showError('Errore nel caricamento delle informazioni della conversazione');
    }
  }

  updateConversationInfo() {
    if (!this.conversation) return;

    this.elements.messageCount.textContent = this.conversation.messages.length;
    this.elements.conversationTitle.textContent = this.conversation.title;
    this.elements.conversationTitle.title = this.conversation.title; // Tooltip per titoli lunghi
  }

  async handleExport() {
    if (!this.isChatGPTTab() || !this.conversation) {
      this.showError('Nessuna conversazione disponibile');
      return;
    }

    try {
      this.setButtonLoading(this.elements.exportBtn, true);
      this.showStatus('Esportazione in corso...', 'loading');

      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'exportToPDF',
        options: this.getExportOptions()
      });

      this.showStatus('PDF esportato con successo!', 'success');
      
      // Chiudi il popup dopo un breve ritardo
      setTimeout(() => window.close(), 1500);
      
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      this.showError('Errore durante l\'esportazione del PDF');
    } finally {
      this.setButtonLoading(this.elements.exportBtn, false);
    }
  }

  async handlePreview() {
    if (!this.conversation) {
      this.showError('Nessuna conversazione disponibile');
      return;
    }

    try {
      this.setButtonLoading(this.elements.previewBtn, true);
      
      // Crea una finestra di anteprima
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      const html = this.generatePreviewHTML(this.conversation);
      
      previewWindow.document.write(html);
      previewWindow.document.close();
      previewWindow.focus();
      
    } catch (error) {
      console.error('Errore nella creazione dell\'anteprima:', error);
      this.showError('Errore nella creazione dell\'anteprima');
    } finally {
      this.setButtonLoading(this.elements.previewBtn, false);
    }
  }

  generatePreviewHTML(conversation) {
    const options = this.getExportOptions();
    
    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Anteprima - ${conversation.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            background: #f8f9fa;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
          }
          .meta {
            color: #666;
            font-size: 14px;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          .meta-item {
            background: #f8f9fa;
            padding: 5px 12px;
            border-radius: 20px;
            border: 1px solid #e9ecef;
          }
          .message {
            margin-bottom: 25px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .message-header {
            padding: 12px 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .user-header {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
          }
          .assistant-header {
            background: linear-gradient(135deg, #3498db, #5dade2);
            color: white;
          }
          .message-content {
            padding: 20px;
            white-space: pre-wrap;
            background: white;
            border-left: 4px solid #ddd;
          }
          .user-content {
            border-left-color: #27ae60;
            background: #f8fff8;
          }
          .assistant-content {
            border-left-color: #3498db;
            background: #f8fcff;
          }
          .preview-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
            color: #856404;
          }
          .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
          }
          .control-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-right: 8px;
            font-size: 12px;
          }
          .control-btn:hover {
            background: #5a6fd8;
          }
          .message-images {
            margin-top: 15px;
          }
          .image-container {
            margin: 15px 0;
            text-align: center;
            padding: 10px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .message-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .image-caption {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="controls">
          <button class="control-btn" onclick="window.print()">🖨️ Stampa</button>
          <button class="control-btn" onclick="window.close()">✖️ Chiudi</button>
        </div>
        
        <div class="container">
          <div class="preview-note">
            📋 <strong>Anteprima PDF</strong> - Questa è un'anteprima di come apparirà il tuo PDF esportato
          </div>
          
          <div class="header">
            <div class="title">${conversation.title}</div>
            <div class="meta">
              ${options.includeTimestamp ? `<span class="meta-item">📅 ${conversation.timestamp}</span>` : ''}
              <span class="meta-item">💬 ${conversation.messages.length} messaggi</span>
              ${options.includeUrl ? `<span class="meta-item">🔗 ${conversation.url}</span>` : ''}
            </div>
          </div>
          
          <div class="conversation">
            ${conversation.messages.map(msg => {
              let messageHtml = `
                <div class="message">
                  <div class="message-header ${msg.role}-header">
                    ${msg.role === 'user' ? '👤 UTENTE' : '🤖 CHATGPT'}
                  </div>
                  <div class="message-content ${msg.role}-content">
                    ${this.escapeHtml(msg.content)}
                  </div>`;
              
              // Aggiungi le immagini se presenti
              if (msg.images && msg.images.length > 0) {
                messageHtml += `<div class="message-images">`;
                msg.images.forEach((image, imgIndex) => {
                  messageHtml += `
                    <div class="image-container">
                      <img src="${image.data}" 
                           alt="${this.escapeHtml(image.alt)}" 
                           class="message-image" />
                      ${image.alt ? `<div class="image-caption">${this.escapeHtml(image.alt)}</div>` : ''}
                    </div>`;
                });
                messageHtml += `</div>`;
              }
              
              messageHtml += `</div>`;
              return messageHtml;
            }).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getExportOptions() {
    return {
      includeTimestamp: this.elements.includeTimestamp.checked,
      includeUrl: this.elements.includeUrl.checked
    };
  }

  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  showStatus(message, type = 'info') {
    const statusEl = this.elements.status;
    statusEl.className = `status ${type}`;
    statusEl.querySelector('p').textContent = message;
  }

  showError(message) {
    this.showStatus(message, 'error');
    this.elements.exportBtn.disabled = true;
    this.elements.previewBtn.disabled = true;
  }

  async saveSettings() {
    const settings = this.getExportOptions();
    try {
      await chrome.storage.sync.set({ exportSettings: settings });
    } catch (error) {
      console.warn('Impossibile salvare le impostazioni:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['exportSettings']);
      if (result.exportSettings) {
        this.elements.includeTimestamp.checked = result.exportSettings.includeTimestamp !== false;
        this.elements.includeUrl.checked = result.exportSettings.includeUrl !== false;
      }
    } catch (error) {
      console.warn('Impossibile caricare le impostazioni:', error);
    }
  }
}

// Inizializza il controller del popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Gestione errori globale
window.addEventListener('error', (event) => {
  console.error('Errore nel popup:', event.error);
});