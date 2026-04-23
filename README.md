# 🐛 BugRadar — AI Code Analysis Engine

> Find and fix bugs before they hit production. BugRadar combines fast static analysis with AI-powered deep scanning, interactive debugging chat, and a REST API you can plug into any system.

![BugRadar](https://img.shields.io/badge/BugRadar-v2.0-00d4ff?style=flat-square&logo=data:image/svg+xml;base64,)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20Claude-00ff88?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Static Scan** | Instant regex-based analysis — no API key needed |
| 🤖 **AI Deep Scan** | Claude / Llama 3 understands context, logic & semantics |
| 🛠️ **Auto-Fix** | One click to get AI-rewritten code with all bugs fixed |
| 💬 **AI Debug Chat** | Ask questions about your code, get expert answers |
| 📊 **Export Reports** | Download analysis as JSON or Markdown |
| 🔌 **REST API** | Integrate into CI/CD, IDEs, or any system via HTTP |
| 🌐 **16+ Languages** | JS, TS, Python, Java, Go, Rust, C#, PHP, Ruby, Kotlin, Swift, C++, SQL, Bash + more |
| 🆓 **Free AI** | Powered by Groq (free tier, no credit card) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/bugradar.git
cd bugradar
npm install
```

### 2. Get a Free AI Key (takes 1 minute)

1. Go to **[console.groq.com](https://console.groq.com)** — sign up free, no credit card
2. Click **API Keys → Create API Key**
3. Copy the key (starts with `gsk_...`)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# FREE — Groq (llama-3.3-70b-versatile)
GROQ_API_KEY=gsk_your_key_here
```

### 4. Run

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — paste code, click **AI Deep Scan**, done.

---

## 🔑 AI Provider Options

BugRadar auto-detects which key you have configured:

| Provider | Cost | Key | Model |
|---|---|---|---|
| **Groq** ✅ recommended | **Free** | `GROQ_API_KEY` | llama-3.3-70b-versatile |
| **Anthropic** | Paid | `ANTHROPIC_API_KEY` | claude-haiku-4-5 |

> If both keys are set, Groq is used (it's free).  
> The static scan (`/api/analyze`) never needs any key.

---

## 🔌 REST API

All endpoints are CORS-enabled — call them from any language or system.

**Base URL:** `http://localhost:3000`

### Endpoints

| Method | Endpoint | Description | Key required? |
|---|---|---|---|
| `POST` | `/api/analyze` | Fast static analysis | No |
| `POST` | `/api/ai-analyze` | AI deep analysis | Yes |
| `POST` | `/api/ai-fix` | AI auto-fix code | Yes |
| `POST` | `/api/ai-chat` | Interactive debug chat | Yes |

### Quick Examples

**cURL — static scan:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "var x = eval(input);", "language": "javascript"}'
```

**cURL — AI scan:**
```bash
curl -X POST http://localhost:3000/api/ai-analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "def process(items=[]): items.append(1)", "language": "python"}'
```

**Python:**
```python
import requests

result = requests.post("http://localhost:3000/api/ai-analyze", json={
    "code": open("myfile.py").read(),
    "language": "python"
}).json()["result"]

print(f"Score: {result['score']}/100 — {result['totalBugs']} issues")
for bug in result["bugs"]:
    print(f"  [{bug['severity'].upper()}] Line {bug['line']}: {bug['title']}")
```

**JavaScript / Node:**
```js
const res = await fetch("http://localhost:3000/api/ai-analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: myCode, language: "javascript" }),
});
const { result } = await res.json();
console.log(`Score: ${result.score}/100`);
```

### Response Schema

```typescript
{
  result: {
    language: string;
    analysisMode: "static" | "ai";
    score: number;           // 0–100
    totalBugs: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    summary: string;
    bugs: Array<{
      id: string;
      line: number;
      severity: "critical" | "warning" | "info";
      type: string;
      title: string;
      description: string;
      codeSnippet?: string;
      fix: { explanation: string; code?: string };
    }>;
    aiInsights?: {          // only for AI analysis
      overallAssessment: string;
      architecturalNotes?: string;
      securitySummary?: string;
      performanceSummary?: string;
      topPriorities?: string[];
    };
  }
}
```

---

## 🧰 JavaScript SDK

Copy `bugradar-sdk.js` into your project for a zero-dependency client:

```js
import BugRadar from "./bugradar-sdk.js";

const br = new BugRadar("http://localhost:3000");

// Static scan (no API key)
const result = await br.analyze(code, "javascript");

// AI deep scan
const aiResult = await br.aiAnalyze(code, "python");

// Auto-fix all bugs
const { fixedCode, changes } = await br.fix(code, "javascript", result.bugs);

// Chat about the code
const reply = await br.chat(code, "javascript", [
  { role: "user", content: "What is the worst security issue?" }
], result);

// Analyze + fix in one call
const { result, fixedCode } = await br.analyzeAndFix(code, "typescript");
```

---

## 🔄 CI/CD Integration

### GitHub Actions — Block deploys on critical bugs

```yaml
name: BugRadar Check
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start BugRadar
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
        run: |
          npm install && npm run build && npm start &
          sleep 5
      - name: Scan for critical bugs
        run: |
          python3 -c "
          import requests, sys, glob
          files = glob.glob('**/*.js', recursive=True)[:10]
          critical = 0
          for f in files:
              r = requests.post('http://localhost:3000/api/analyze',
                  json={'code': open(f).read(), 'language': 'javascript'})
              critical += r.json().get('result', {}).get('criticalCount', 0)
          sys.exit(1 if critical > 0 else 0)
          "
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
BUGRADAR="http://localhost:3000"
for FILE in $(git diff --cached --name-only | grep -E '\.(js|ts|py)$'); do
  CRITICAL=$(curl -s -X POST $BUGRADAR/api/analyze \
    -H "Content-Type: application/json" \
    -d "{\"code\":$(cat $FILE | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),\"language\":\"javascript\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('result',{}).get('criticalCount',0))")
  if [ "$CRITICAL" -gt "0" ]; then
    echo "❌ $CRITICAL critical bug(s) in $FILE — commit blocked"
    exit 1
  fi
done
echo "✅ BugRadar: No critical bugs"
```

---

## 📁 Project Structure

```
bugradar/
├── app/
│   ├── api/
│   │   ├── analyze/          # Static analysis endpoint
│   │   ├── ai-analyze/       # AI deep analysis (Groq / Claude)
│   │   ├── ai-fix/           # AI auto-fix endpoint
│   │   └── ai-chat/          # Interactive debug chat
│   ├── components/
│   │   ├── Header.tsx        # Navigation header
│   │   ├── CodeEditor.tsx    # Code editor (16+ languages)
│   │   ├── BugReport.tsx     # Analysis results + export
│   │   └── AIChat.tsx        # Floating AI chat drawer
│   ├── libs/
│   │   ├── types.ts          # Shared TypeScript types
│   │   ├── analyzer.ts       # Static analysis engine
│   │   └── ai.ts             # AI provider (Groq / Anthropic)
│   ├── styles/               # CSS modules
│   ├── integrate/            # Integration docs page
│   └── page.tsx              # Main analyzer page
├── .env.example              # Environment variable template
└── README.md
```

---

## 🌐 Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
# Add environment variable in Vercel dashboard:
# GROQ_API_KEY = gsk_your_key_here
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
ENV GROQ_API_KEY=your_key_here
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t bugradar .
docker run -p 3000:3000 -e GROQ_API_KEY=gsk_... bugradar
```

### Self-hosted

```bash
npm run build
npm start
# Runs on http://localhost:3000
```

---

## 🛠️ Development

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Production build
npm run start    # Start production server
```

### Adding a New Language

Open `app/libs/analyzer.ts` and add a new pattern array (for static scan), then the AI scan supports any language automatically.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  <p>Built with Next.js · TypeScript · Groq (Llama 3) · Anthropic Claude</p>
  <p>
    <a href="http://localhost:3000">Analyzer</a> ·
    <a href="http://localhost:3000/integrate">Integration Guide</a> ·
    <a href="https://console.groq.com">Get Free Groq Key</a>
  </p>
</div>
