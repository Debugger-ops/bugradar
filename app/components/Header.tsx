'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/styles/Header.module.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
          <div className={styles.logoIcon}>🐛</div>
          <div>
            <div className={styles.logoText}>BugRadar</div>
            <div className={styles.logoSub}>AI Code Analysis Engine</div>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navBtn} ${pathname === '/' ? styles.navBtnActive : ''}`}
          >
            Analyzer
          </Link>
          <Link
            href="/integrate"
            className={`${styles.navBtn} ${pathname === '/integrate' ? styles.navBtnActive : ''}`}
          >
            Integration
          </Link>
          <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navBtn}
          >
            Get API Key ↗
          </a>
        </nav>

        <div className={styles.statusBadge}>
          <span className={styles.statusDot} />
          <span>SYSTEMS ONLINE</span>
        </div>
      </div>
    </header>
  );
}
