'use client';

import { Sparkles } from 'lucide-react';
import styles from './GenerateButton.module.css';

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export default function GenerateButton({
  onClick,
  loading,
  label,
  sublabel,
  icon,
  variant = 'primary',
}: GenerateButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={loading}
    >
      <div className={styles.iconWrapper}>
        {loading ? (
          <div className="spinner" />
        ) : (
          icon || <Sparkles size={20} />
        )}
      </div>
      <div className={styles.text}>
        <span className={styles.label}>{loading ? 'Generating...' : label}</span>
        {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
      </div>
      {!loading && <div className={styles.glow} />}
    </button>
  );
}
