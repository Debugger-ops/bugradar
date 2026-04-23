'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import CodeEditor from '@/app/components/CodeEditor';
import BugReport from '@/app/components/BugReport';
import AIChat from '@/app/components/AIChat';
import { AnalysisResult } from '@/app/libs/types';
import styles from '@/app/styles/Home.module.css';

type Mode = 'static' | 'ai';

const SAMPLE_CODE: Record<string, string> = {
  javascript: `// Sample JavaScript with real bugs
var userName = "Alice";
var userScore = "42";

function checkLogin(user) {
  if (user.role == "admin") {
    eval(user.redirectCommand);
    document.getElementById("output").innerHTML = user.name;
  }
}

async function fetchData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    console.log("Fetched:", data);
    return data;
  } catch (e) {
    // TODO: handle this properly
  }
}

const password = "superSecret123";
`,
  typescript: `// TypeScript with issues
interface User {
  id: number;
  name: string;
  role: string;
}

function getUser(id: any): any {
  // No type safety
  const user = fetchFromDB(id);
  return user;
}

async function processUsers(users: User[]) {
  for (var i = 0; i < users.length; i++) {
    const result = await doWork(users[i]);
    console.log(result);
  }
}

// Hardcoded secret
const API_KEY = "sk-1234567890abcdef";

function divide(a: number, b: number) {
  return a / b; // No division by zero check
}
`,
  python: `# Sample Python with bugs
from os import *

def process_items(items=[]):
    for item in items:
        print(f"Processing: {item}")
    items.append("done")
    return items

def divide(a, b):
    try:
        result = a / b
        return result
    except:
        pass

def check_value(x):
    if x == True:
        return "yes"
    if x == None:
        return "nothing"

# TODO: Add input validation
password = "admin123"
`,
  java: `// Java with common bugs
import java.util.*;

public class UserService {
    private static String DB_PASSWORD = "root123";

    public User findUser(String id) {
        // SQL Injection vulnerability
        String query = "SELECT * FROM users WHERE id = " + id;
        return executeQuery(query);
    }

    public void processUsers(List<User> users) {
        for (int i = 0; i <= users.size(); i++) {
            // Off-by-one error
            System.out.println(users.get(i));
        }
    }

    public String formatName(User user) {
        // Potential NPE
        return user.getName().toUpperCase();
    }
}
`,
  go: `// Go with issues
package main

import (
    "fmt"
    "database/sql"
)

var dbPassword = "secretpassword"

func getUser(id string) (*User, error) {
    // SQL injection
    query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", id)
    row := db.QueryRow(query)

    var user User
    err := row.Scan(&user.ID, &user.Name)
    if err != nil {
        // Ignoring error
    }
    return &user, nil
}

func divide(a, b int) int {
    // No zero check
    return a / b
}
`,
};

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Deep Analysis',
    desc: 'Claude AI understands context, logic, and semantics — not just patterns.',
  },
  {
    icon: '🔍',
    title: '16+ Languages',
    desc: 'JS, TS, Python, Java, Go, Rust, C#, PHP, Ruby, Kotlin and more.',
  },
  {
    icon: '🛠️',
    title: 'Auto-Fix Engine',
    desc: 'One click to get AI-rewritten code with all bugs fixed.',
  },
  {
    icon: '💬',
    title: 'AI Debug Chat',
    desc: 'Ask questions about your code and get expert guidance instantly.',
  },
  {
    icon: '🔌',
    title: 'REST API',
    desc: 'Integrate BugRadar into your CI/CD pipeline or any system.',
  },
  {
    icon: '📊',
    title: 'Export Reports',
    desc: 'Download analysis as JSON or Markdown for your workflow.',
  },
];

export default function HomePage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [mode, setMode] = useState<Mode>('static');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<{ type: string; text: string }[]>([
    { type: 'prompt', text: 'bugradar --version 2.0.0 --ai-enabled' },
    { type: 'out', text: 'BugRadar AI Analysis Engine initialized.' },
    { type: 'out', text: 'Static + AI modes available. Waiting for input...' },
  ]);

  const addLog = (type: string, text: string) =>
    setTerminalLines((prev) => [...prev.slice(-20), { type, text }]);

  const loadSample = () => {
    const sample = SAMPLE_CODE[language] ?? SAMPLE_CODE.javascript;
    setCode(sample);
    setResult(null);
    setError(null);
    addLog('out', `Loaded ${language} sample code.`);
  };

  const analyze = async () => {
    if (!code.trim()) {
      setError('Please paste some code to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const endpoint = mode === 'ai' ? '/api/ai-analyze' : '/api/analyze';
    addLog('prompt', `bugradar analyze --lang ${language} --mode ${mode}`);
    addLog('out', mode === 'ai' ? 'Sending to Claude AI for deep analysis...' : 'Running static pattern analysis...');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        addLog('err', `Analysis failed: ${data.error}`);
      } else if (data.result) {
        setResult(data.result);
        const r = data.result;
        addLog('out', `Analysis complete. Score: ${r.score}/100 · ${r.totalBugs} issue(s) found.`);
        if (r.criticalCount > 0) {
          addLog('err', `${r.criticalCount} CRITICAL issue(s) require immediate attention.`);
        }
        if (mode === 'ai') {
          addLog('out', 'AI insights generated. Use the chat for deeper questions.');
        }
      }
    } catch (err) {
      const msg = 'Network error. Please try again.';
      setError(msg);
      addLog('err', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroEyebrow}>
            <span>🤖</span> AI-Powered Code Analysis & Debugging
          </div>
          <h1 className={styles.heroTitle}>
            Find & Fix Bugs Before<br />
            <span>They Hit Production</span>
          </h1>
          <p className={styles.heroSub}>
            BugRadar combines static analysis with Claude AI to detect security vulnerabilities,
            logic errors, and anti-patterns — with actionable fixes and interactive debugging.
          </p>
        </section>

        {/* Feature Grid */}
        <section className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </section>

        {/* Workspace */}
        <div className={styles.workspace}>
          {/* Left: Editor + Controls */}
          <div className={styles.panel}>

            {/* Mode Toggle */}
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${mode === 'static' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('static')}
              >
                <span>⚡</span>
                <span>Static Scan</span>
                <span className={styles.modeMeta}>Fast · No API key</span>
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'ai' ? styles.modeBtnActiveAI : ''}`}
                onClick={() => setMode('ai')}
              >
                <span>🤖</span>
                <span>AI Deep Scan</span>
                <span className={styles.modeMeta}>Groq (free) or Claude</span>
              </button>
            </div>

            {mode === 'ai' && (
              <div className={styles.aiNote}>
                🆓 <strong>Free AI:</strong> add <code>GROQ_API_KEY</code> from{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">console.groq.com</a>{' '}
                (no credit card) to your <code>.env.local</code>.
                Also supports <code>ANTHROPIC_API_KEY</code>.{' '}
                <a href="/integrate">Setup guide →</a>
              </div>
            )}

            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <span className={styles.panelTitleDot} />
                Code Input
              </div>
              <button
                className={styles.analyzeBtn}
                style={{ width: 'auto', padding: '8px 20px', fontSize: '11px' }}
                onClick={loadSample}
              >
                <span className={styles.analyzeBtnText}>Load Sample</span>
              </button>
            </div>

            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={(lang) => { setLanguage(lang); setResult(null); }}
            />

            {loading && (
              <div className={styles.loadingBar}>
                <div className={styles.loadingFill} />
              </div>
            )}

            {error && <div className={styles.errorBox}>⚠ {error}</div>}

            <button
              className={`${styles.analyzeBtn} ${mode === 'ai' ? styles.analyzeBtnAI : ''}`}
              onClick={analyze}
              disabled={loading}
            >
              <span className={styles.analyzeBtnText}>
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    {mode === 'ai' ? 'ASKING CLAUDE...' : 'SCANNING...'}
                  </>
                ) : (
                  mode === 'ai' ? '🤖 RUN AI ANALYSIS' : '▶ RUN STATIC SCAN'
                )}
              </span>
            </button>

            {/* Terminal */}
            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <span className={styles.terminalDot} style={{ background: '#ff5f57' }} />
                <span className={styles.terminalDot} style={{ background: '#febc2e' }} />
                <span className={styles.terminalDot} style={{ background: '#28c840' }} />
                <span className={styles.terminalTitle}>bugradar — terminal</span>
              </div>
              <div className={styles.terminalBody}>
                {terminalLines.map((line, i) => (
                  <div key={i} className={styles.terminalLine}>
                    {line.type === 'prompt' && (
                      <>
                        <span className={styles.terminalPrompt}>$</span>
                        <span className={styles.terminalCmd}>{line.text}</span>
                      </>
                    )}
                    {line.type === 'out' && (
                      <span className={styles.terminalOut}>&gt; {line.text}</span>
                    )}
                    {line.type === 'err' && (
                      <span className={styles.terminalErr}>✗ {line.text}</span>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className={styles.terminalLine}>
                    <span className={styles.terminalCursor}>█</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <span className={styles.panelTitleDot} />
                Analysis Report
              </div>
              {result && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {result.language.toUpperCase()} · {result.totalBugs} issue{result.totalBugs !== 1 ? 's' : ''}
                  {result.analysisMode === 'ai' && ' · AI'}
                </span>
              )}
            </div>

            {result ? (
              <BugReport result={result} originalCode={code} />
            ) : (
              <div className={styles.emptyReport}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {mode === 'ai' ? '🤖' : '🔭'}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {mode === 'ai' ? 'AI analysis ready' : 'Static scan ready'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
                  Paste code → click Run → get results<br />
                  {mode === 'ai'
                    ? 'Claude will find deep logic bugs, security issues & more'
                    : 'Pattern-based scan for 15+ common bug types'}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          BugRadar v2.0 · Built with Next.js + Claude AI ·{' '}
          <a href="/integrate" style={{ color: 'var(--accent-cyan)' }}>Integration Guide</a>
        </footer>
      </main>

      {/* AI Chat — always available */}
      <AIChat code={code} language={language} analysisResult={result} />
    </>
  );
}
