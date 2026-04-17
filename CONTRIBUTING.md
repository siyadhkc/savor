# Contributing to Savor 🍽️

First off — **thank you** for taking the time to contribute! Every improvement, bug fix, and idea makes Savor better for everyone.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |
| Git | Latest |

### Local Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/food-delivery.git
   cd food-delivery
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/siyadhkc/food-delivery.git
   ```
4. **Follow the Local Setup Guide** in [README.md](README.md) to get both backend and frontend running.

---

## Development Workflow

```
upstream/main  ←─── your fork/main  ←─── feature/your-branch
```

1. Sync your fork with upstream before starting:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```
2. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/add-order-rating
   ```
3. Make your changes, commit often.
4. Push and open a Pull Request against `upstream/main`.

---

## Branching Strategy

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/live-chat` |
| `fix/` | Bug fix | `fix/cart-total-bug` |
| `docs/` | Documentation only | `docs/update-readme` |
| `refactor/` | Code cleanup, no features | `refactor/order-serializer` |
| `chore/` | Build, CI, dependencies | `chore/upgrade-drf` |
| `test/` | Tests only | `test/payment-webhook` |

---

## Commit Message Convention

We follow **Conventional Commits**:

```
<type>(scope): short description

[optional body]

[optional footer]
```

**Examples:**
```
feat(orders): add real-time status polling
fix(auth): resolve token refresh race condition
docs(readme): add docker-compose setup steps
```

---

## Pull Request Process

1. Ensure your branch is up to date with `upstream/main`.
2. Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely.
3. Link any related issues using `Closes #123`.
4. Request a review from a maintainer.
5. Address all review comments before merge.

> **Note**: PRs that break existing functionality or lack a clear description will be closed without merging.

---

## Reporting Bugs

Use the **Bug Report** issue template on GitHub. Include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots / console logs if applicable
- Environment (OS, Python version, Node version)

---

## Suggesting Features

Use the **Feature Request** issue template. Describe:
- The problem you're solving
- Your proposed solution
- Any alternatives you considered

---

Thank you for making Savor better! 🚀
