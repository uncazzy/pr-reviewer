# PR Code Reviewer

🔍 A Chrome extension that leverages OpenAI to provide intelligent code review suggestions for GitHub pull requests. Like its namesake from Greek mythology, PR Code Reviewer keeps a vigilant eye on your code, providing comprehensive feedback and enabling contextual discussions about your code changes directly in the GitHub interface.

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
   - Start reviewing code!

## 💡 Usage

1. Navigate to any GitHub pull request
2. Click the PR Code Reviewer icon
3. Click "Show Available Files" to load the PR files
4. Select the files you want to review
5. Click "Start Analysis" to begin the review process
6. Click the "Expand Feedback" chevron icon on any file to view detailed feedback
7. Click the "Chat" icon to access the chat interface

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

## ⚠️ Known Issues

1. **Mac OS Navigation Bug**: On Mac OS, if not already on the `/files` tab, the extension may close when the browser redirects to the files tab, requiring users to click "Show Available Files" again. 

2. **Page Refresh Requirement**: Depending on when the extension was activated, you may need to refresh the page for it to work properly. While the app should handle this gracefully and display an error message instructing users to refresh, this is a known limitation that will be addressed in future updates.

## 🤝 Contributing

Contributions are welcome! Please see [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Submitting pull requests
- Coding standards
- Bug reports and feature requests

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
