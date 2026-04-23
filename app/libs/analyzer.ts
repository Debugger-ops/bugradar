import { Bug, AnalysisResult, Severity } from '@/app/libs/types';

// Static bug pattern detection for common languages
interface BugPattern {
  pattern: RegExp;
  type: string;
  title: string;
  severity: Severity;
  getDescription: (match: RegExpMatchArray) => string;
  getFix: (match: RegExpMatchArray) => { explanation: string; code?: string };
}

const jsPatterns: BugPattern[] = [
  {
    pattern: /==(?!=)/g,
    type: 'LOOSE_EQUALITY',
    title: 'Loose Equality Comparison',
    severity: 'warning',
    getDescription: () => 'Using == performs type coercion which can lead to unexpected behavior. For example, `0 == ""` returns true.',
    getFix: () => ({
      explanation: 'Use strict equality === instead of == to avoid unintended type coercion.',
      code: '// Instead of: if (x == y)\n// Use:        if (x === y)',
    }),
  },
  {
    pattern: /var\s+\w+/g,
    type: 'VAR_DECLARATION',
    title: 'Use of var Declaration',
    severity: 'info',
    getDescription: () => 'var has function scope and is hoisted, which can cause confusing behavior in block scopes like loops and conditionals.',
    getFix: () => ({
      explanation: 'Use const for immutable values, or let for mutable variables to get block scoping.',
      code: '// Instead of: var count = 0\n// Use:        let count = 0\n// Or:         const MAX = 100',
    }),
  },
  {
    pattern: /console\.(log|warn|error|info)\(/g,
    type: 'CONSOLE_CALL',
    title: 'Console Statement Left in Code',
    severity: 'info',
    getDescription: () => 'Console statements should be removed from production code as they can expose sensitive data and impact performance.',
    getFix: () => ({
      explanation: 'Remove console statements or use a proper logging library with log levels for production.',
      code: '// Remove or replace with a logger:\n// import logger from "./logger";\n// logger.debug("message");',
    }),
  },
  {
    pattern: /eval\s*\(/g,
    type: 'EVAL_USAGE',
    title: 'Dangerous eval() Call',
    severity: 'critical',
    getDescription: () => 'eval() executes arbitrary code strings and is a major security vulnerability. It can lead to XSS attacks and makes code difficult to optimize.',
    getFix: () => ({
      explanation: 'Replace eval() with safer alternatives like JSON.parse() for data, or Function() for dynamic code (with caution).',
      code: '// Instead of: eval(jsonString)\n// Use:        JSON.parse(jsonString)',
    }),
  },
  {
    pattern: /innerHTML\s*=/g,
    type: 'INNER_HTML',
    title: 'Unsafe innerHTML Assignment',
    severity: 'critical',
    getDescription: () => 'Directly assigning to innerHTML with unsanitized user input creates XSS (Cross-Site Scripting) vulnerabilities.',
    getFix: () => ({
      explanation: 'Use textContent for plain text, or sanitize HTML with DOMPurify before using innerHTML.',
      code: '// Safe: element.textContent = userInput\n// Or:   element.innerHTML = DOMPurify.sanitize(userInput)',
    }),
  },
  {
    pattern: /setTimeout\s*\(\s*["'`]/g,
    type: 'SETTIMEOUT_STRING',
    title: 'setTimeout with String Argument',
    severity: 'critical',
    getDescription: () => 'Passing a string to setTimeout is equivalent to eval() and has the same security risks.',
    getFix: () => ({
      explanation: 'Always pass a function reference to setTimeout.',
      code: '// Instead of: setTimeout("doSomething()", 1000)\n// Use:        setTimeout(() => doSomething(), 1000)',
    }),
  },
  {
    pattern: /catch\s*\(\s*\w*\s*\)\s*\{[\s\n]*\}/g,
    type: 'EMPTY_CATCH',
    title: 'Empty Catch Block',
    severity: 'warning',
    getDescription: () => 'An empty catch block silently swallows errors, making debugging extremely difficult.',
    getFix: () => ({
      explanation: 'At minimum, log the error in the catch block. Better: handle it gracefully.',
      code: 'catch (error) {\n  console.error("Operation failed:", error);\n  // Handle or re-throw the error\n}',
    }),
  },
  {
    pattern: /!{0,1}=={0,1}\s*null/g,
    type: 'NULL_CHECK',
    title: 'Fragile Null Check',
    severity: 'info',
    getDescription: () => 'Checking for null explicitly may miss undefined values. Consider using nullish coalescing.',
    getFix: () => ({
      explanation: 'Use optional chaining (?.) and nullish coalescing (??) for safer null/undefined handling.',
      code: '// Instead of: if (obj != null && obj.prop)\n// Use:        if (obj?.prop)',
    }),
  },
  {
    pattern: /new Array\(\d+\)/g,
    type: 'ARRAY_CONSTRUCTOR',
    title: 'Array Constructor with Length',
    severity: 'info',
    getDescription: () => 'Using new Array(n) creates a sparse array with n empty slots, not an array of n zeros. This is often a source of bugs.',
    getFix: () => ({
      explanation: 'Use Array.from() or Array.fill() to create arrays with default values.',
      code: '// Instead of: new Array(5)\n// Use:        Array.from({ length: 5 }, () => 0)\n// Or:         new Array(5).fill(0)',
    }),
  },
  {
    pattern: /document\.write\s*\(/g,
    type: 'DOCUMENT_WRITE',
    title: 'document.write() Usage',
    severity: 'critical',
    getDescription: () => 'document.write() can completely overwrite the page content if called after load, and is considered bad practice.',
    getFix: () => ({
      explanation: 'Use DOM manipulation methods like createElement, appendChild, or innerHTML (sanitized).',
      code: '// Instead of: document.write("<p>Hello</p>")\n// Use:        const p = document.createElement("p")\n//             p.textContent = "Hello"\n//             document.body.appendChild(p)',
    }),
  },
];

const pythonPatterns: BugPattern[] = [
  {
    pattern: /except\s*:/g,
    type: 'BARE_EXCEPT',
    title: 'Bare Except Clause',
    severity: 'critical',
    getDescription: () => 'A bare except: catches all exceptions including KeyboardInterrupt and SystemExit, which can make it impossible to interrupt a hanging program.',
    getFix: () => ({
      explanation: 'Always specify the exception type(s) you expect to handle.',
      code: '# Instead of:\nexcept:\n    pass\n\n# Use:\nexcept (ValueError, TypeError) as e:\n    print(f"Error: {e}")',
    }),
  },
  {
    pattern: /def\s+\w+\([^)]*=\s*\[/g,
    type: 'MUTABLE_DEFAULT',
    title: 'Mutable Default Argument',
    severity: 'critical',
    getDescription: () => 'Using a mutable object (list, dict) as a default argument is a classic Python gotcha. The object is shared across all calls to the function.',
    getFix: () => ({
      explanation: 'Use None as the default and create a new mutable object inside the function.',
      code: '# Instead of:\ndef add_item(item, lst=[]):\n    lst.append(item)\n\n# Use:\ndef add_item(item, lst=None):\n    if lst is None:\n        lst = []\n    lst.append(item)',
    }),
  },
  {
    pattern: /print\s*\(/g,
    type: 'PRINT_STATEMENT',
    title: 'Debug Print Statement',
    severity: 'info',
    getDescription: () => 'Print statements are often left from debugging. In production, use the logging module for better control.',
    getFix: () => ({
      explanation: 'Replace print() with the logging module for production code.',
      code: 'import logging\nlogging.basicConfig(level=logging.DEBUG)\n\n# Instead of: print("value:", value)\n# Use:        logging.debug("value: %s", value)',
    }),
  },
  {
    pattern: /==\s*True|==\s*False|==\s*None/g,
    type: 'TRUTHINESS_CHECK',
    title: 'Explicit Boolean/None Comparison',
    severity: 'warning',
    getDescription: () => 'Comparing to True, False, or None explicitly is not Pythonic and should use `is` for None or implicit truthiness.',
    getFix: () => ({
      explanation: 'Use `is` for None checks, and implicit truthiness for booleans.',
      code: '# Instead of: if x == True:\n# Use:        if x:\n\n# Instead of: if x == None:\n# Use:        if x is None:',
    }),
  },
  {
    pattern: /import\s+\*/g,
    type: 'WILDCARD_IMPORT',
    title: 'Wildcard Import',
    severity: 'warning',
    getDescription: () => 'Wildcard imports pollute the namespace, make it hard to track where names come from, and can cause silent name collisions.',
    getFix: () => ({
      explanation: 'Always import specific names or use qualified imports.',
      code: '# Instead of: from math import *\n# Use:        from math import sqrt, pi\n# Or:         import math; math.sqrt(4)',
    }),
  },
];

const generalPatterns: BugPattern[] = [
  {
    pattern: /TODO|FIXME|HACK|XXX/g,
    type: 'TODO_COMMENT',
    title: 'Unresolved TODO/FIXME Comment',
    severity: 'info',
    getDescription: () => 'A TODO or FIXME comment indicates unfinished work that may cause issues in production.',
    getFix: () => ({
      explanation: 'Address the TODO before shipping to production. If it cannot be fixed now, create a proper issue/ticket.',
    }),
  },
  {
    pattern: /password\s*=\s*["'`]\w+["'`]/gi,
    type: 'HARDCODED_PASSWORD',
    title: 'Hardcoded Password / Secret',
    severity: 'critical',
    getDescription: () => 'Hardcoded passwords or secrets in source code are a severe security risk, especially if the code is in version control.',
    getFix: () => ({
      explanation: 'Use environment variables or a secrets manager to store sensitive credentials.',
      code: '// Instead of:\nconst password = "mySecret123";\n\n// Use:\nconst password = process.env.DB_PASSWORD;',
    }),
  },
];

function detectPatterns(code: string, patterns: BugPattern[], lines: string[]): Bug[] {
  const bugs: Bug[] = [];
  let idCounter = 0;

  for (const { pattern, type, title, severity, getDescription, getFix } of patterns) {
    const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
    let match: RegExpMatchArray | null;

    while ((match = globalPattern.exec(code)) !== null) {
      const before = code.substring(0, match.index);
      const lineNum = before.split('\n').length;
      const lineContent = lines[lineNum - 1] ?? '';

      bugs.push({
        id: `bug_${idCounter++}`,
        line: lineNum,
        severity,
        type,
        title,
        description: getDescription(match),
        codeSnippet: lineContent.trim(),
        fix: getFix(match),
      });

      // Don't add same bug type on same line twice
      break;
    }
  }

  return bugs;
}

export function analyzeCode(code: string, language: string): AnalysisResult {
  const lines = code.split('\n');
  let bugs: Bug[] = [];

  const lang = language.toLowerCase();

  if (lang === 'javascript' || lang === 'typescript' || lang === 'jsx' || lang === 'tsx') {
    bugs = [...bugs, ...detectPatterns(code, jsPatterns, lines)];
  } else if (lang === 'python') {
    bugs = [...bugs, ...detectPatterns(code, pythonPatterns, lines)];
  }

  // Always run general patterns
  bugs = [...bugs, ...detectPatterns(code, generalPatterns, lines)];

  // Deduplicate by type (keep only first occurrence)
  const seen = new Set<string>();
  bugs = bugs.filter((b) => {
    const key = b.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: critical first, then warning, then info
  const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  bugs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const criticalCount = bugs.filter((b) => b.severity === 'critical').length;
  const warningCount = bugs.filter((b) => b.severity === 'warning').length;
  const infoCount = bugs.filter((b) => b.severity === 'info').length;

  const deductions = criticalCount * 25 + warningCount * 10 + infoCount * 5;
  const score = Math.max(0, 100 - deductions);

  let summary = '';
  if (bugs.length === 0) {
    summary = 'No issues detected. Your code looks clean!';
  } else if (criticalCount > 0) {
    summary = `Found ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} that need immediate attention.`;
  } else {
    summary = `Found ${bugs.length} issue${bugs.length > 1 ? 's' : ''} worth addressing.`;
  }

  return {
    language,
    totalBugs: bugs.length,
    criticalCount,
    warningCount,
    infoCount,
    score,
    bugs,
    summary,
  };
}