# CodeLixer

**CodeLixer** is a real-time AI-powered code autocorrect extension for Visual Studio Code. It detects typos and syntax errors as you type and automatically fixes them using advanced AI models.



---

## 🚀 Features

- ✅ Detects typos and syntax errors in real time
- ⚡ Automatically replaces the incorrect line with a corrected version
- 🤖 Powered by OpenRouter (OpenAI/GPT)
- 🌐 Backend-proxy architecture for secure key handling
- 💻 Supports multiple programming languages

---

## 🔧 Requirements

- A running backend proxy server with OpenRouter or OpenAI API integration
- Internet connection
- VS Code 1.85.0 or higher

---

## ⚙️ Extension Settings

Currently, CodeLixer does not require user configuration.

Future versions may include:

- `codelixer.enable`: Enable/disable CodeLixer
- `codelixer.languageSupport`: Define languages for correction

---

## 🐛 Known Issues

- Only corrects one line at a time
- Not optimized for multi-line errors or large files
- Backend must be running for extension to work

---

## 📝 Release Notes

### 0.1.0

- First public release of CodeLixer
- Real-time line-level autocorrection
- Integrated with secure backend using OpenAI API

---

## 🛠️ Developer Info

This extension is built using:

- Frontend: TypeScript, VS Code Extension API
- Backend: Node.js, Express, OpenRouter/OpenAI API

---

## 📄 Useful Links

- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Markdown Syntax Guide](https://www.markdownguide.org/basic-syntax/)
- [Visual Studio Code API Docs](https://code.visualstudio.com/api)

---

**Enjoy using CodeLixer!**  
_Enhance your coding flow with instant AI corrections._

---

📌 **Made with ❤️ by [Swaraj Ladke](https://github.com/swarajladke20)**
