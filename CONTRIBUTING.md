# Contributing to object-diff-ts

Thank you for your interest in contributing to object-diff-ts! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Mouraoea/object-diff-ts.git
cd object-diff-ts

# Install dependencies
npm install
```

### Available Scripts

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write your code following the existing style
- Add tests for new functionality
- Update documentation if needed

### 3. Run Tests and Linting

```bash
npm run lint
npm test
npm run build
```

### 4. Commit Your Changes

Use semantic commit messages:

```bash
git commit -m "feat: add new comparison option"
git commit -m "fix: resolve array comparison issue"
git commit -m "docs: update README with new examples"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow the existing type definitions
- Add proper JSDoc comments for public APIs

### Testing

- Write tests for all new functionality
- Maintain high test coverage
- Use descriptive test names
- Test both positive and negative cases

### Linting

- Follow ESLint rules
- Use Prettier for code formatting
- Run `npm run lint:fix` before committing

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All tests pass
- [ ] New functionality has tests
- [ ] Documentation is updated
- [ ] Commit messages are semantic

### Pull Request Template

When creating a pull request, please include:

- Description of changes
- Related issue (if any)
- Type of change (feature, bug fix, documentation)
- Breaking changes (if any)

## Issue Guidelines

### Bug Reports

- Use the bug report template
- Include steps to reproduce
- Provide expected vs actual behavior
- Include environment information

### Feature Requests

- Use the feature request template
- Describe the problem and proposed solution
- Provide use cases and examples

## Release Process

### Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Publishing

- Only maintainers can publish to npm
- Releases are created from the main branch
- Changelog is updated automatically

## Getting Help

- Check existing issues and pull requests
- Search the documentation
- Create an issue if you can't find an answer

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

Thank you for contributing to object-diff! 🚀
