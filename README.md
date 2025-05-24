# Gmail AI Chatbot Extension 🤖📧

A powerful browser extension that adds an AI-powered chatbot sidebar to Gmail for intelligent email summarization and interactive Q&A sessions.

![Extension Preview](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox-blue) ![Version](https://img.shields.io/badge/Version-1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🤖 Smart Email Summarization**: Automatically analyzes opened emails using Google's Gemini 2.0 Flash model
- **💬 Interactive Chat**: Ask follow-up questions about email content
- **🎨 Clean UI**: Modern, responsive sidebar design that doesn't interfere with Gmail
- **🔐 Secure**: API keys stored locally, no data sent to third parties
- **🌐 Cross-Browser**: Compatible with Chrome and Firefox
- **⚡ Fast**: Uses OpenRouter's free Gemini model for quick responses

## 🚀 Quick Start

### Installation

#### Chrome
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `gmail-chatbot-extension` folder
6. The extension will appear in your toolbar

#### Firefox
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension folder and select `manifest.json`
6. The extension will be loaded (temporary installation)

### Setup

1. **Get API Key**: Sign up at [OpenRouter.ai](https://openrouter.ai) and get your free API key
2. **Configure Extension**: Click the extension icon in your browser toolbar
3. **Enter API Key**: Paste your OpenRouter API key and click "Save Settings"
4. **Visit Gmail**: Navigate to [Gmail](https://mail.google.com)
5. **Open Email**: Click on any email to see the AI sidebar appear
6. **Start Chatting**: The AI will automatically summarize the email and you can ask questions

## 📁 File Structure

```
gmail-chatbot-extension/
├── manifest.json              # Extension configuration
├── README.md                  # This file
├── icons/                     # Extension icons
│   ├── icon16.svg            # 16x16 icon
│   ├── icon48.svg            # 48x48 icon
│   └── icon128.svg           # 128x128 icon
├── content/                   # Content scripts
│   └── content.js            # Main Gmail integration logic
├── popup/                     # Extension popup
│   ├── popup.html            # Settings interface
│   ├── popup.js              # Popup functionality
│   └── popup.css             # Popup styling
├── background/                # Background scripts
│   └── background.js         # Service worker
└── styles/                    # Stylesheets
    └── sidebar.css           # Sidebar UI styling
```

## 🔧 Technical Details

### Technologies Used
- **Manifest V3**: Modern extension API
- **Vanilla JavaScript**: No external dependencies
- **CSS3**: Modern styling with gradients and animations
- **OpenRouter API**: AI model access
- **Chrome Storage API**: Secure local data storage

### API Configuration
- **Model**: `google/gemini-2.0-flash-exp:free`
- **Provider**: OpenRouter.ai
- **Cost**: Free tier available
- **Rate Limits**: Subject to OpenRouter's free tier limits

### Browser Permissions
- `storage`: Store API key locally
- `activeTab`: Access current Gmail tab
- `https://mail.google.com/*`: Gmail integration
- `https://openrouter.ai/*`: API communication

## 🎯 How It Works

1. **Email Detection**: Content script monitors Gmail DOM for opened emails
2. **Content Extraction**: Extracts email subject, sender, and body text
3. **AI Processing**: Sends content to Gemini 2.0 Flash via OpenRouter API
4. **Smart Summarization**: AI provides concise summary with key points
5. **Interactive Chat**: Users can ask follow-up questions about the email
6. **Real-time Updates**: Sidebar updates automatically when new emails are opened

## 🛠️ Development

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd gmail-chatbot-extension

# Load in Chrome for testing
# 1. Open chrome://extensions
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select the project folder
```

### Customization
- **Styling**: Modify `styles/sidebar.css` for UI changes
- **AI Prompts**: Edit prompts in `content/content.js`
- **Models**: Change model in API call (requires OpenRouter account)

## 📸 Screenshots

### Extension Popup
The clean settings interface for API key configuration.

### Gmail Integration
The sidebar appears automatically when viewing emails in Gmail.

### AI Conversation
Interactive chat interface for email analysis and Q&A.

## 🔒 Privacy & Security

- **Local Storage**: API keys stored only on your device
- **No Tracking**: Extension doesn't collect or transmit personal data
- **Secure API**: All communication encrypted via HTTPS
- **Permission Minimal**: Only requests necessary browser permissions

## 🐛 Troubleshooting

### Common Issues

**Sidebar not appearing?**
- Refresh Gmail page
- Check if extension is enabled
- Verify you're on mail.google.com

**API errors?**
- Verify API key is correct
- Check OpenRouter account status
- Ensure internet connection is stable

**No email summary?**
- Make sure email is fully loaded
- Check browser console for errors
- Verify API key has sufficient credits

### Debug Mode
1. Open Chrome DevTools (F12)
2. Check Console tab for error messages
3. Look for network requests to OpenRouter API

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
