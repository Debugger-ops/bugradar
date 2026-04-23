'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import styles from '@/app/styles/Integrate.module.css';

function CodeBlock({ code, language = 'bash', title }: { code: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{language}</span>
        {title && <span className={styles.codeTitle}>{title}</span>}
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>
      <pre className={styles.codePre}><code>{code}</code></pre>
    </div>
  );
}

const SECTIONS = [
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'setup', label: 'Setup' },
  { id: 'endpoints', label: 'API Endpoints' },
  { id: 'examples', label: 'Code Examples' },
  { id: 'sdk', label: 'JS SDK' },
  { id: 'cicd', label: 'CI/CD Integration' },
  { id: 'response', label: 'Response Schema' },
];

export default function IntegratePage() {
  const [activeSection, setActiveSection] = useState('quickstart');

  return (
    <>
      <Header />
      <div className={styles.page}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Integration Guide</div>
          <nav className={styles.sidebarNav}>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`${styles.sidebarLink} ${activeSection === s.id ? styles.sidebarLinkActive : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className={styles.sidebarInfo}>
            <div className={styles.sidebarInfoTitle}>Base URL</div>
            <code className={styles.sidebarCode}>http://localhost:3000</code>
            <div className={styles.sidebarInfoTitle} style={{ marginTop: '12px' }}>CORS</div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>All origins allowed</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          {/* Quick Start */}
          <section id="quickstart" className={styles.section}>
            <div className={styles.sectionEyebrow}>01</div>
            <h2 className={styles.sectionTitle}>Quick Start</h2>
            <p className={styles.sectionDesc}>
              BugRadar exposes a REST API that you can call from any language or system.
              All endpoints accept JSON and return JSON. CORS is enabled for all origins,
              so you can call the API from browser or server.
            </p>

            <div className={styles.quickGrid}>
              <div className={styles.quickCard}>
                <div className={styles.quickNum}>1</div>
                <div className={styles.quickText}>
                  <strong>Clone & install</strong>
                  <span>Run the Next.js app locally</span>
                </div>
              </div>
              <div className={styles.quickCard}>
                <div className={styles.quickNum}>2</div>
                <div className={styles.quickText}>
                  <strong>Add free AI key</strong>
                  <span>Set <code>GROQ_API_KEY</code> from <code>console.groq.com</code> (free)</span>
                </div>
              </div>
              <div className={styles.quickCard}>
                <div className={styles.quickNum}>3</div>
                <div className={styles.quickText}>
                  <strong>POST your code</strong>
                  <span>Call any endpoint with code + language</span>
                </div>
              </div>
            </div>

            <CodeBlock
              language="bash"
              title="30-second setup"
              code={`git clone <your-bugradar-repo>
cd bugradar
npm install
cp .env.example .env.local

# Add your FREE Groq key (no credit card at console.groq.com):
echo 'GROQ_API_KEY=gsk_your_key_here' >> .env.local

npm run dev
# API ready at http://localhost:3000/api/`}
            />
          </section>

          {/* Setup */}
          <section id="setup" className={styles.section}>
            <div className={styles.sectionEyebrow}>02</div>
            <h2 className={styles.sectionTitle}>Environment Setup</h2>
            <p className={styles.sectionDesc}>
              Copy <code>.env.example</code> to <code>.env.local</code> and configure your API key.
            </p>

            <CodeBlock
              language="bash"
              title=".env.local — pick ONE (or both)"
              code={`# ✅ FREE OPTION — Groq (no credit card, sign up at console.groq.com)
# Uses llama-3.3-70b-versatile — fast and great at code analysis
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# 💳 PAID OPTION — Anthropic Claude (higher quality, costs money)
# Get key at console.anthropic.com
# ANTHROPIC_API_KEY=sk-ant-api03-...

# If BOTH are set, Groq is used automatically (it's free).`}
            />

            <div className={styles.infoBox}>
              <span>🆓</span>
              <span>
                <strong>Groq is completely free</strong> — create an account at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                  console.groq.com
                </a>{' '}
                and generate an API key in under a minute, no credit card required.
                The static scan (<code>/api/analyze</code>) never needs any key.
              </span>
            </div>
          </section>

          {/* Endpoints */}
          <section id="endpoints" className={styles.section}>
            <div className={styles.sectionEyebrow}>03</div>
            <h2 className={styles.sectionTitle}>API Endpoints</h2>

            {[
              {
                method: 'POST',
                path: '/api/analyze',
                desc: 'Fast static analysis using regex pattern matching. No API key required. Returns bugs for JS, TS, Python, JSX, TSX.',
                badge: '⚡ Static',
                color: 'green',
              },
              {
                method: 'POST',
                path: '/api/ai-analyze',
                desc: 'Deep AI analysis using Claude. Understands context, logic, and semantics. Supports all 16+ languages. Requires ANTHROPIC_API_KEY.',
                badge: '🤖 AI',
                color: 'cyan',
              },
              {
                method: 'POST',
                path: '/api/ai-fix',
                desc: 'Submit code + bug list and get back AI-rewritten fixed code. Requires ANTHROPIC_API_KEY.',
                badge: '🛠 AI',
                color: 'cyan',
              },
              {
                method: 'POST',
                path: '/api/ai-chat',
                desc: 'Interactive debugging chat. Send conversation history + code context and get expert AI responses. Requires ANTHROPIC_API_KEY.',
                badge: '💬 AI',
                color: 'cyan',
              },
            ].map((ep) => (
              <div key={ep.path} className={styles.endpoint}>
                <div className={styles.endpointHeader}>
                  <span className={styles.methodBadge}>{ep.method}</span>
                  <code className={styles.endpointPath}>{ep.path}</code>
                  <span className={`${styles.endpointBadge} ${styles[`badge${ep.color}`]}`}>{ep.badge}</span>
                </div>
                <p className={styles.endpointDesc}>{ep.desc}</p>
              </div>
            ))}
          </section>

          {/* Code Examples */}
          <section id="examples" className={styles.section}>
            <div className={styles.sectionEyebrow}>04</div>
            <h2 className={styles.sectionTitle}>Code Examples</h2>

            <h3 className={styles.subTitle}>cURL</h3>
            <CodeBlock
              language="bash"
              title="Static analysis"
              code={`curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "var x = 1; eval(x); const password = \\"secret\\"",
    "language": "javascript"
  }'`}
            />

            <CodeBlock
              language="bash"
              title="AI analysis"
              code={`curl -X POST http://localhost:3000/api/ai-analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "def process(items=[]): items.append(1); return items",
    "language": "python"
  }'`}
            />

            <CodeBlock
              language="bash"
              title="AI auto-fix"
              code={`curl -X POST http://localhost:3000/api/ai-fix \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "var x = eval(input);",
    "language": "javascript",
    "bugs": [
      {
        "id": "bug_0",
        "line": 1,
        "severity": "critical",
        "type": "EVAL_USAGE",
        "title": "Dangerous eval() Call",
        "description": "eval executes arbitrary code",
        "fix": { "explanation": "Remove eval" }
      }
    ]
  }'`}
            />

            <h3 className={styles.subTitle}>Python</h3>
            <CodeBlock
              language="python"
              title="python_client.py"
              code={`import requests
import json

BUGRADAR_URL = "http://localhost:3000"

def analyze_code(code: str, language: str, use_ai: bool = False) -> dict:
    """Analyze code with BugRadar API."""
    endpoint = "/api/ai-analyze" if use_ai else "/api/analyze"

    response = requests.post(
        f"{BUGRADAR_URL}{endpoint}",
        json={"code": code, "language": language},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()

def fix_code(code: str, language: str, bugs: list) -> str:
    """Get AI-fixed code."""
    response = requests.post(
        f"{BUGRADAR_URL}/api/ai-fix",
        json={"code": code, "language": language, "bugs": bugs},
        timeout=60,
    )
    response.raise_for_status()
    return response.json().get("fixedCode", "")

# Example usage
code = """
def process(items=[]):
    items.append("done")
    return items
"""

result = analyze_code(code, "python", use_ai=True)
data = result.get("result", {})

print(f"Score: {data['score']}/100")
print(f"Issues: {data['totalBugs']} ({data['criticalCount']} critical)")
for bug in data.get("bugs", []):
    print(f"  [{bug['severity'].upper()}] Line {bug['line']}: {bug['title']}")`}
            />

            <h3 className={styles.subTitle}>Node.js / TypeScript</h3>
            <CodeBlock
              language="typescript"
              title="bugradar-client.ts"
              code={`const BUGRADAR_URL = "http://localhost:3000";

interface AnalysisResult {
  score: number;
  totalBugs: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  bugs: Bug[];
  summary: string;
  aiInsights?: Record<string, any>;
}

async function analyzeCode(
  code: string,
  language: string,
  useAI = false
): Promise<AnalysisResult> {
  const endpoint = useAI ? "/api/ai-analyze" : "/api/analyze";
  const res = await fetch(\`\${BUGRADAR_URL}\${endpoint}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });

  if (!res.ok) throw new Error(\`BugRadar error: \${res.status}\`);
  const { result, error } = await res.json();
  if (error) throw new Error(error);
  return result;
}

// Example
const result = await analyzeCode(
  'const password = "admin123"; eval(input)',
  "javascript",
  true
);

console.log(\`Score: \${result.score}/100\`);
result.bugs.forEach((bug) => {
  console.log(\`[\${bug.severity.toUpperCase()}] L\${bug.line}: \${bug.title}\`);
});`}
            />
          </section>

          {/* JS SDK */}
          <section id="sdk" className={styles.section}>
            <div className={styles.sectionEyebrow}>05</div>
            <h2 className={styles.sectionTitle}>JavaScript SDK</h2>
            <p className={styles.sectionDesc}>
              Copy this file into your project for a ready-to-use BugRadar client.
            </p>

            <CodeBlock
              language="javascript"
              title="bugradar-sdk.js — copy into your project"
              code={`/**
 * BugRadar SDK
 * Lightweight client for the BugRadar Analysis API
 * Usage: const br = new BugRadar("http://localhost:3000");
 */
class BugRadar {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl.replace(/\\/$/, "");
  }

  async _post(path, body) {
    const res = await fetch(\`\${this.baseUrl}\${path}\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  /** Static analysis (fast, no AI) */
  async analyze(code, language) {
    const { result } = await this._post("/api/analyze", { code, language });
    return result;
  }

  /** AI deep analysis using Claude */
  async aiAnalyze(code, language) {
    const { result } = await this._post("/api/ai-analyze", { code, language });
    return result;
  }

  /** Get AI-fixed version of the code */
  async fix(code, language, bugs) {
    return this._post("/api/ai-fix", { code, language, bugs });
  }

  /** Interactive debug chat */
  async chat(code, language, messages, analysisResult = null) {
    const { message } = await this._post("/api/ai-chat", {
      code, language, messages, analysisResult,
    });
    return message;
  }

  /** Convenience: analyze + fix in one call */
  async analyzeAndFix(code, language) {
    const result = await this.aiAnalyze(code, language);
    if (result.totalBugs === 0) return { result, fixedCode: code };
    const { fixedCode, changes } = await this.fix(code, language, result.bugs);
    return { result, fixedCode, changes };
  }
}

// Node.js / ESM export
if (typeof module !== "undefined") module.exports = { BugRadar };
export default BugRadar;`}
            />

            <CodeBlock
              language="javascript"
              title="Usage example"
              code={`import BugRadar from "./bugradar-sdk.js";

const br = new BugRadar("http://localhost:3000");

// Analyze code
const result = await br.analyze(myCode, "javascript");
console.log(\`Score: \${result.score}/100, Issues: \${result.totalBugs}\`);

// AI analysis + auto fix
const { result: aiResult, fixedCode } = await br.analyzeAndFix(myCode, "python");
console.log("Fixed code:", fixedCode);

// Chat
const reply = await br.chat(myCode, "javascript", [
  { role: "user", content: "What is the worst security issue here?" }
], aiResult);
console.log("AI:", reply);`}
            />
          </section>

          {/* CI/CD */}
          <section id="cicd" className={styles.section}>
            <div className={styles.sectionEyebrow}>06</div>
            <h2 className={styles.sectionTitle}>CI/CD Integration</h2>
            <p className={styles.sectionDesc}>
              Block deployments when critical bugs are found. Works with GitHub Actions, GitLab CI, and any CI system.
            </p>

            <CodeBlock
              language="yaml"
              title="GitHub Actions"
              code={`name: BugRadar Code Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start BugRadar
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npm install
          npm run build
          npm start &
          sleep 5  # Wait for server to be ready

      - name: Analyze Changed Files
        run: |
          python3 - <<'EOF'
          import requests, sys, glob

          files = glob.glob("**/*.js", recursive=True) + glob.glob("**/*.ts", recursive=True)
          critical_total = 0

          for f in files[:10]:  # Analyze first 10 JS/TS files
              with open(f) as fh:
                  code = fh.read()
              if len(code) < 50: continue

              r = requests.post("http://localhost:3000/api/analyze",
                  json={"code": code, "language": "javascript"})
              result = r.json().get("result", {})
              critical_total += result.get("criticalCount", 0)

              if result.get("criticalCount", 0) > 0:
                  print(f"CRITICAL BUGS in {f}:")
                  for bug in result.get("bugs", []):
                      if bug["severity"] == "critical":
                          print(f"  L{bug['line']}: {bug['title']}")

          if critical_total > 0:
              print(f"\\n❌ {critical_total} critical bugs found. Blocking deployment.")
              sys.exit(1)
          else:
              print("✅ No critical bugs found.")
          EOF`}
            />

            <CodeBlock
              language="bash"
              title="Pre-commit hook (.git/hooks/pre-commit)"
              code={`#!/bin/bash
# BugRadar pre-commit hook — blocks commits with critical bugs

BUGRADAR_URL="http://localhost:3000"
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\\.(js|ts|py)$")

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

echo "🔍 BugRadar scanning staged files..."
CRITICAL_COUNT=0

for FILE in $CHANGED_FILES; do
  LANG="javascript"
  [[ "$FILE" == *.py ]] && LANG="python"
  [[ "$FILE" == *.ts ]] && LANG="typescript"

  CODE=$(cat "$FILE")
  RESULT=$(curl -s -X POST "$BUGRADAR_URL/api/analyze" \\
    -H "Content-Type: application/json" \\
    -d "{\\"code\\":$(echo "$CODE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),\\"language\\":\\"$LANG\\"}")

  CRITICAL=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('result',{}).get('criticalCount',0))" 2>/dev/null || echo 0)

  if [ "$CRITICAL" -gt "0" ]; then
    echo "❌ Critical bugs in $FILE ($CRITICAL critical)"
    CRITICAL_COUNT=$((CRITICAL_COUNT + CRITICAL))
  fi
done

if [ "$CRITICAL_COUNT" -gt "0" ]; then
  echo ""
  echo "🛑 Commit blocked: $CRITICAL_COUNT critical bug(s) found."
  echo "   Run 'npm run dev' and open http://localhost:3000 to review."
  exit 1
fi

echo "✅ BugRadar: No critical bugs found."
exit 0`}
            />
          </section>

          {/* Response Schema */}
          <section id="response" className={styles.section}>
            <div className={styles.sectionEyebrow}>07</div>
            <h2 className={styles.sectionTitle}>Response Schema</h2>
            <p className={styles.sectionDesc}>
              All analysis endpoints return the same <code>AnalysisResult</code> structure.
              AI endpoints additionally include <code>aiInsights</code>.
            </p>

            <CodeBlock
              language="typescript"
              title="Full response schema"
              code={`// POST /api/analyze or /api/ai-analyze
interface AnalysisResult {
  language: string;           // "javascript" | "python" | ...
  analysisMode: "static" | "ai";
  score: number;              // 0–100 quality score
  totalBugs: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  summary: string;            // Human-readable summary
  bugs: Bug[];
  aiInsights?: AIInsights;    // Only present for AI analysis
}

interface Bug {
  id: string;                 // "bug_0", "bug_1", ...
  line: number;               // Line number in the original code
  severity: "critical" | "warning" | "info";
  type: string;               // e.g. "EVAL_USAGE", "SQL_INJECTION"
  title: string;
  description: string;
  codeSnippet?: string;       // The problematic code
  fix: {
    explanation: string;      // How to fix it
    code?: string;            // Fixed code example
  };
}

interface AIInsights {
  overallAssessment: string;
  architecturalNotes?: string;
  securitySummary?: string;
  performanceSummary?: string;
  topPriorities?: string[];
}

// POST /api/ai-fix
interface FixResponse {
  fixedCode: string;          // Complete rewritten code
  changes: string[];          // List of changes made
}

// POST /api/ai-chat
interface ChatResponse {
  message: string;            // AI assistant response
}`}
            />

            <div className={styles.infoBox}>
              <span>⚠️</span>
              <span>
                On error, all endpoints return <code>{"{ \"error\": \"...\" }"}</code> with an appropriate HTTP status code
                (400 for bad input, 503 if API key is missing, 500 for server errors).
              </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
