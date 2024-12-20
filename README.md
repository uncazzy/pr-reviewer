# PR Code Reviewer

A Chrome extension that leverages OpenAI to provide intelligent code review suggestions for GitHub pull requests. Get comprehensive feedback and engage in contextual discussions about your code changes directly in the GitHub interface.

## Features

- 🤖 **AI-Powered Code Review**: Utilizes OpenAI to analyze code changes and provide intelligent feedback
- 💬 **Interactive Code Chat**: Discuss specific files and get clarification on suggested changes
- 📝 **Multi-tier Review**: Get initial assessments followed by comprehensive feedback
- 🔍 **File Selection**: Choose which files to review in large PRs
- ⚙️ **Configurable**: Select OpenAI models and customize your API key
- 🔄 **Re-analysis**: Easily reanalyze changes after updates

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/pr-reviewer.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

## Usage

1. Navigate to any GitHub pull request
2. Click the extension icon in your browser
3. Configure your OpenAI API key in the extension settings
4. Select files to review (optional)
5. Click "Analyze" to get AI-powered code review
6. Use the chat interface to ask questions about specific files

## Configuration

Access the extension settings to:
- Set your OpenAI API key
- Choose the OpenAI model
- Clear stored PR data
- Manage other preferences

## How It Works

The extension provides a sophisticated three-tier review system for your pull requests:

1. **Initial Assessment**:
   - Quick, high-level review of code changes
   - Status-based feedback: "Looks Good", "Warning", or "Requires Changes"
   - Focuses on critical issues that could affect functionality or security
   - Provides concise summary of identified concerns

2. **Comprehensive Feedback**:
   - In-depth analysis of code modifications
   - Specific recommendations for improvements
   - Detailed rationale for suggested changes
   - Practical code examples when applicable

3. **Interactive Discussion**:
   - Context-aware conversations about specific files
   - References initial review findings
   - Clarify suggestions and explore alternatives
   - Maintain full code context during discussions

### Review Process

Each review stage is carefully designed to provide increasingly detailed insights:

1. **Code Extraction** (`dataExtractor.js`):
   - Accurately captures current code state from PR diffs
   - Preserves line numbers for precise feedback
   - Focuses on new and modified code while maintaining context
   - Handles both split and unified diff views

2. **Initial Review** (`reviewPrompt.js`):
   - Evaluates code changes within full file context

3. **Detailed Analysis** (`detailedFeedbackPrompt.js`):
   - Builds upon initial assessment
   - Provides actionable improvement suggestions
   - Explains reasoning behind recommendations
   - Includes example implementations where helpful

4. **Interactive Feedback** (`chatPrompt.js`):
   - Enables focused discussions about specific code sections
   - Maintains awareness of previous review feedback
   - Helps clarify complex suggestions
   - Facilitates collaborative problem-solving

## Development

### Prerequisites
- Node.js and npm
- Chrome browser
- OpenAI API key

### Key Components

1. **Content Script** (`contentScript.js`):
   - Injects into GitHub PR pages
   - Handles file expansion and data extraction
   - Manages communication with the extension

2. **Popup Interface** (`popup.js`):
   - Controls the main extension interface
   - Manages file selection and analysis
   - Displays review results

3. **Options Page** (`options.js`):
   - Handles API key configuration
   - Manages model selection
   - Provides data clearing options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


## Privacy

This extension requires an OpenAI API key to function. Your code is sent to OpenAI for analysis. Please review OpenAI's privacy policy and ensure you comply with your organization's security requirements before use.
