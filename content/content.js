// Gmail AI Chatbot Content Script
class GmailChatbot {
  constructor() {
    this.sidebar = null;
    this.currentEmailContent = '';
    this.conversationHistory = [];
    this.apiKey = '';
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    // Load API key from storage
    const result = await chrome.storage.local.get(['openrouter_api_key']);
    this.apiKey = result.openrouter_api_key || '';
    
    // Wait for Gmail to load
    this.waitForGmail();
  }

  waitForGmail() {
    const checkGmail = () => {
      if (document.querySelector('[role="main"]') && !this.isInitialized) {
        this.isInitialized = true;
        this.setupEmailObserver();
        this.createSidebar();
      } else if (!this.isInitialized) {
        setTimeout(checkGmail, 1000);
      }
    };
    checkGmail();
  }

  setupEmailObserver() {
    // Observe changes in the email view
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.detectEmailContent();
        }
      });
    });

    const gmailContent = document.querySelector('[role="main"]');
    if (gmailContent) {
      observer.observe(gmailContent, {
        childList: true,
        subtree: true
      });
    }

    // Initial email detection
    setTimeout(() => this.detectEmailContent(), 2000);
  }

  detectEmailContent() {
    // Try multiple selectors for email content
    const emailSelectors = [
      '[data-message-id] .ii.gt',
      '.ii.gt',
      '[role="listitem"] .ii.gt',
      '.adn.ads .ii.gt'
    ];

    let emailElement = null;
    for (const selector of emailSelectors) {
      emailElement = document.querySelector(selector);
      if (emailElement) break;
    }

    if (!emailElement) return;

    // Extract email content and metadata
    const emailContent = this.extractEmailContent(emailElement);
    
    if (emailContent && emailContent !== this.currentEmailContent) {
      this.currentEmailContent = emailContent;
      this.updateSidebar();
    }
  }

  extractEmailContent(element) {
    // Get subject
    const subjectElement = document.querySelector('[data-thread-perm-id] h2, .hP');
    const subject = subjectElement ? subjectElement.textContent.trim() : '';

    // Get sender
    const senderElement = document.querySelector('.go .g2, .gD');
    const sender = senderElement ? senderElement.textContent.trim() : '';

    // Get email body
    const bodyText = element.textContent.trim();

    if (!bodyText) return null;

    return {
      subject,
      sender,
      body: bodyText,
      timestamp: new Date().toLocaleString()
    };
  }

  createSidebar() {
    if (this.sidebar) return;

    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'gmail-chatbot-sidebar';
    this.sidebar.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          AI Email Assistant
        </div>
        <button class="chatbot-toggle" onclick="this.closest('#gmail-chatbot-sidebar').style.display='none'">×</button>
      </div>
      <div class="chatbot-content">
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="welcome-message">
            <div class="bot-message">
              <div class="message-content">
                👋 Hi! I'm your AI email assistant. Open an email and I'll provide a summary and answer any questions you have about it.
              </div>
            </div>
          </div>
        </div>
        <div class="chatbot-input-container">
          <div class="chatbot-input-wrapper">
            <input type="text" id="chatbot-input" placeholder="Ask me about this email..." disabled>
            <button id="chatbot-send" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(this.sidebar);

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    const input = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send');

    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;

      input.value = '';
      await this.handleUserMessage(message);
    };

    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Listen for API key updates
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.openrouter_api_key) {
        this.apiKey = changes.openrouter_api_key.newValue || '';
        this.updateSidebar();
      }
    });
  }

  async updateSidebar() {
    if (!this.sidebar) return;

    const input = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send');

    if (!this.apiKey) {
      this.addMessage('bot', '⚠️ Please set your OpenRouter API key in the extension popup to get started.');
      input.disabled = true;
      sendButton.disabled = true;
      return;
    }

    if (!this.currentEmailContent) {
      input.disabled = true;
      sendButton.disabled = true;
      return;
    }

    // Enable chat when email is detected
    input.disabled = false;
    sendButton.disabled = false;

    // Auto-summarize the email
    await this.summarizeEmail();
  }

  async summarizeEmail() {
    if (!this.currentEmailContent || !this.apiKey) return;

    this.addMessage('bot', '📧 Analyzing email...');

    try {
      const summary = await this.callOpenRouter(
        `Please provide a concise summary of this email:

Subject: ${this.currentEmailContent.subject}
From: ${this.currentEmailContent.sender}

Content:
${this.currentEmailContent.body}

Please provide:
1. A brief summary (2-3 sentences)
2. Key action items or important points
3. The tone/urgency of the email`
      );

      // Replace the analyzing message with the summary
      this.replaceLastMessage(summary);
    } catch (error) {
      this.replaceLastMessage('❌ Failed to summarize email. Please check your API key and try again.');
    }
  }

  async handleUserMessage(message) {
    this.addMessage('user', message);
    this.addMessage('bot', '🤔 Thinking...');

    try {
      const context = `Email Context:
Subject: ${this.currentEmailContent.subject}
From: ${this.currentEmailContent.sender}
Content: ${this.currentEmailContent.body}

User Question: ${message}

Please answer the user's question based on the email content above.`;

      const response = await this.callOpenRouter(context);
      this.replaceLastMessage(response);
    } catch (error) {
      this.replaceLastMessage('❌ Sorry, I encountered an error. Please try again.');
    }
  }

  async callOpenRouter(prompt) {
    if (!this.apiKey) {
      throw new Error('No API key configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mail.google.com',
        'X-Title': 'Gmail AI Chatbot'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  addMessage(type, content) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  replaceLastMessage(content) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const lastMessage = messagesContainer.lastElementChild;
    
    if (lastMessage && lastMessage.classList.contains('bot-message')) {
      lastMessage.querySelector('.message-content').textContent = content;
    }
  }
}

// Initialize the chatbot when the page loads
if (window.location.hostname === 'mail.google.com') {
  new GmailChatbot();
}