'use client';

import { useRef, useCallback } from 'react';
import styles from '@/app/styles/CodeEditor.module.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  readOnly?: boolean;
  highlightLines?: number[];
}

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'typescript', label: 'TypeScript', icon: 'TS' },
  { value: 'python', label: 'Python', icon: 'PY' },
  { value: 'jsx', label: 'React JSX', icon: 'JSX' },
  { value: 'tsx', label: 'React TSX', icon: 'TSX' },
  { value: 'java', label: 'Java', icon: 'JV' },
  { value: 'go', label: 'Go', icon: 'GO' },
  { value: 'rust', label: 'Rust', icon: 'RS' },
  { value: 'csharp', label: 'C#', icon: 'C#' },
  { value: 'php', label: 'PHP', icon: 'PHP' },
  { value: 'ruby', label: 'Ruby', icon: 'RB' },
  { value: 'kotlin', label: 'Kotlin', icon: 'KT' },
  { value: 'swift', label: 'Swift', icon: 'SW' },
  { value: 'cpp', label: 'C++', icon: 'C++' },
  { value: 'sql', label: 'SQL', icon: 'SQL' },
  { value: 'bash', label: 'Bash/Shell', icon: 'SH' },
];

export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
  highlightLines = [],
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 10) }, (_, i) => i + 1);
  const charPercent = Math.min(100, (value.length / 50000) * 100);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 2;
            textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    },
    [value, onChange]
  );

  const selectedLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className={`${styles.editorWrapper} ${readOnly ? styles.readOnly : ''}`}>
      <div className={styles.editorHeader}>
        <div className={styles.editorDots}>
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
        </div>

        <div className={styles.editorMeta}>
          {selectedLang && (
            <span className={styles.langIcon}>{selectedLang.icon}</span>
          )}
          {!readOnly ? (
            <select
              className={styles.langSelect}
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          ) : (
            <span className={styles.langLabel}>{selectedLang?.label ?? language}</span>
          )}
        </div>

        {readOnly && (
          <span className={styles.readOnlyBadge}>READ ONLY</span>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex' }}>
        <div className={styles.lineNumbers}>
          {lineNumbers.map((n) => (
            <span
              key={n}
              className={`${styles.lineNum} ${highlightLines.includes(n) ? styles.lineNumHighlight : ''}`}
            >
              {n}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={
            readOnly
              ? ''
              : `// Paste your ${language} code here...\n// BugRadar will scan for:\n//   • Security vulnerabilities\n//   • Logic errors & anti-patterns\n//   • Performance issues\n//   • Code quality problems`
          }
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      <div className={styles.editorFooter}>
        <span>{lineCount} lines · {value.length.toLocaleString()} chars</span>
        <div className={styles.charBar}>
          <div className={styles.charFill} style={{ width: `${charPercent}%`, background: charPercent > 80 ? 'var(--accent-red)' : 'var(--accent-cyan)' }} />
        </div>
        <span className={styles.charCount}>{value.length.toLocaleString()} / 50,000</span>
      </div>
    </div>
  );
}
