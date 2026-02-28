# TruthPrompt

> Your AI coding mentor that tells the truth — not just what you want to hear.

[Try Demo](#) • [Documentation](#) • [Roadmap](#roadmap)

---

## 🎯 The Problem

You ask AI to write code → it generates → you copy → it breaks in production.

**Sound familiar?**

- AI generates code without error handling
- You miss security vulnerabilities
- Performance suffers because "it works though"
- Result: hours debugging someone else's code

---

## 💡 The Solution

**TruthPrompt** is the intermediate layer between you and AI.

Before sending your prompt:
```
❌ "Write a function to fetch users"

✅ "Write async function getUserById(id: number),
    that:
    - makes GET /api/users/{id}
    - returns User or null
    - handles 404 and network errors
    - uses fetch with 5s timeout"
```

After receiving code:
```
🔍 Code analysis:
  ⚠️ No timeout handling (hang risk)
  ⚠️ Missing API response typing
  ✅ Function structure is correct
  💡 Tip: add AbortController for cancellation
```

---

## 🚀 Quick Start

### Web Version (Now)
1. Open [truthprompt.dev](#) (in development)
2. Enter your AI prompt
3. Get score and recommendations
4. Improve prompt → send to AI

### VS Code Extension (Planned)
1. Install from VS Code Marketplace
2. Configure API keys (OpenAI, Gemini, Anthropic, Qwen)
3. Use directly in editor

---

## ✨ Key Features

### 1. Prompt Analysis with Score
| Criterion | What We Check |
|-----------|---------------|
| **Clarity** | No vague formulations |
| **Completeness** | Input/output/errors specified |
| **Context** | Dependencies and constraints |
| **Testability** | Can be covered with tests |

**Result:** 0-100 score + specific improvement recommendations.

### 2. AI Code Review
| Category | Example Checks |
|----------|----------------|
| 🚫 **Security** | `eval()`, hardcoded secrets, XSS |
| 🐌 **Performance** | N+1 queries, missing caching |
| 💣 **Fragility** | No error handling, ignored edge cases |
| 🧪 **Testability** | No pure functions, hidden dependencies |

**Result:** Interactive report with clickable warnings.

### 3. AI Hall of Shame 🏆
Save worst AI code examples with breakdowns.

**Why:**
- Learn from others' (and your own) mistakes
- Share on social media (viral potential!)
- Track progress: "AI used to write this, now better"

Example:
```
📌 AI generated:
  const user = users.find(u => u.id === id); // ❌ users might be undefined

💡 Breakdown:
  - No null/undefined check
  - No typing
  - No "not found" handling

✅ Fixed version:
  const user = users?.find(u => u.id === id) ?? null;
```

### 4. Progress Gamification
Earn badges for improving skills:

| Badge | How to Get |
|-------|------------|
| 🥉 **Newcomer** | Send 10 prompts |
| 🥈 **Advanced** | 5 prompts without vulnerabilities |
| 🥇 **Prompt Master** | Score ≥ 90 on 10 prompts |
| 🏆 **Bug Hunter** | Find 25 issues in AI code |
| 💎 **Legend** | All badges earned |

**Why:** Motivation to learn and visible progress.

---

## 🛠 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   You       │ ──▶ │  TruthPrompt │ ──▶ │    AI       │
│   Prompt    │     │  Analysis +  │     │  (OpenAI,   │
│             │     │  Improvement │     │   Gemini)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   AI Code    │
                    │   Review     │
                    │   Report     │
                    └──────────────┘
```

### Tech Stack:
- **Web:** React + TypeScript + Vite
- **Analysis:** Local rules + AI assistant
- **Storage:** localStorage (no telemetry!)
- **VS Code Extension:** Planned (same analysis engine)

---

## 🔒 Privacy

| Principle | What It Means |
|-----------|---------------|
| **No telemetry** | We don't collect your prompts or code |
| **Everything local** | Analysis happens in your browser |
| **Your API keys** | Keys stored only on your device |
| **Open-source** | Anyone can audit the code |

---

## 📊 Roadmap

| Phase | Timeline | Status |
|-------|----------|--------|
| **MVP Web Version** | Q2 2026 | 🟡 In Development |
| **Prompt Analysis** | Q2 2026 | ⚪ Planned |
| **Code Review** | Q3 2026 | ⚪ Planned |
| **Hall of Shame + Badges** | Q3 2026 | ⚪ Planned |
| **VS Code Extension** | Q4 2026 | ⚪ Planned |

---

## 🤝 Contributing

Open-source project (MIT). Welcome:
- Bug reports
- Suggestions for analysis rules
- Translations to other languages

---

## 📄 License

MIT — use freely, learn openly, build boldly.

---

> **Ask better. Code smarter. Learn faster.**
>
> Made with ❤️ for everyone tired of AI magic that breaks in production.
