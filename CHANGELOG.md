# Changelog

## [0.6.0]

### Added
- Multi-provider support for AI models
  - Added DeepSeek model integration
  - Prepared framework for future AI providers
- Provider-specific API key management in options page
- Dynamic model selection based on chosen provider

### Changed
- Refactored API integration to use OpenAI SDK
- Updated UI text to be provider-agnostic
- Improved error handling with provider-specific messages
- Enhanced documentation to reflect multi-provider support

### Developer Updates
- Migrated from direct API calls to OpenAI SDK
- Added provider-specific base URL configuration
- Improved TypeScript type safety in API responses

## [0.5.0] - Initial Release

### Features
- GitHub pull request code review automation
- Real-time code analysis using AI models
- Interactive chat interface for code discussions
- Customizable model settings
- File-specific code review and feedback
- Support for all programming languages
- Local storage of API keys and settings
- Privacy-focused design with no intermediate servers

### Technical Details
- Chrome extension with manifest v3
- OpenAI API integration
- TypeScript/JavaScript implementation
- Parcel-based build system
- GitHub API integration for PR access
