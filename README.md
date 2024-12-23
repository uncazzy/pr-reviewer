# PR Code Reviewer

🔍 A Chrome extension that leverages OpenAI to provide intelligent code review suggestions for GitHub pull requests. Get comprehensive feedback and engage in contextual discussions about your code changes directly in the GitHub interface.

## ✨ Features

- 🤖 **AI-Powered Code Review**: Intelligent feedback using OpenAI
- 💬 **Interactive Code Chat**: Contextual discussions about specific code changes
- 📝 **Multi-tier Review**: Initial assessment + comprehensive feedback
- ⚡ **Efficient**: Quick analysis of selected files in large PRs
- ⚙️ **Configurable**: Customizable OpenAI models and settings
- 🔄 **Re-analysis**: Easily reanalyze changes after updates

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Extension**
   ```bash
   npm run build
   ```

3. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

4. **Configure**
   - Open the extension options
   - Add your OpenAI API key and select a model
   - Start reviewing PRs!

## 💡 Usage

1. Navigate to any GitHub pull request
2. Click the extension icon
3. Click "Show Available Files" to load the PR files
4. Select the files you want to review
5. Click "Start Analysis" to begin the review process
6. Click "Expand Feedback" on any file to:
   - View detailed feedback for that file
   - Access the chat interface for specific discussions

Note: Large files are automatically excluded from selection to ensure optimal performance.

## 🔒 Privacy & Security

- Requires OpenAI API key (stored locally)
- Code is sent to OpenAI for analysis
- Review OpenAI's privacy policy before use
- No data is stored on external servers

## 🛠️ Development

### Prerequisites
- Node.js (v18+)
- npm
- Chrome browser
- OpenAI API key

### Local Setup
1. Clone the repository
2. Install dependencies (`npm install`)
3. Start dev server (`npm run dev`)
4. Load unpacked extension from `dist`

## 🤝 Contributing

Contributions are welcome! Please see [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Submitting pull requests
- Coding standards
- Bug reports and feature requests

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
