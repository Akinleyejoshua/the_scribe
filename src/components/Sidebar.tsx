'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiBook, FiUser, FiMenu, FiChevronLeft } from 'react-icons/fi';
import { PenLine } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthorStore } from '@/store/useAuthorStore';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { currentAuthor } = useAuthorStore();

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiBook, label: 'Dashboard', path: '/dashboard', requiresAuthor: true },
  ];

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <PenLine size={sidebarCollapsed ? 20 : 24} />
        </div>
        {!sidebarCollapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>The Scribe</span>
            <span className={styles.logoSubtitle}>AI Writing Assistant</span>
          </div>
        )}
        <button
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <FiMenu size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          if (item.requiresAuthor && !currentAuthor?.interviewCompleted) return null;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => router.push(item.path)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* Author Profile Mini Card */}
      {currentAuthor && !sidebarCollapsed && (
        <div className={styles.authorCard}>
          <div className={styles.authorAvatar}>
            <FiUser size={18} />
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{currentAuthor.name}</span>
            <span className={styles.authorMinistry}>{currentAuthor.ministry || 'Ministry Author'}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className={styles.footer}>
          <span className={styles.footerText}>Spirit-Led Writing</span>
        </div>
      )}
    </aside>
  );
}
