'use client';

import styles from './InterviewProgress.module.css';
import { FiCheck } from 'react-icons/fi';

const STEPS = [
  { label: 'Identity', icon: '✝️' },
  { label: 'Tone & Style', icon: '🎵' },
  { label: 'Signature Language', icon: '✍️' },
  { label: 'Scripture Foundation', icon: '📖' },
  { label: 'Personal Stories', icon: '💎' },
  { label: 'Theology', icon: '⛪' },
  { label: 'Audience', icon: '👥' },
];

interface InterviewProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export default function InterviewProgress({ currentStep }: InterviewProgressProps) {
  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <div className={styles.steps}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div
              key={index}
              className={`${styles.step} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
            >
              <div className={styles.stepIcon}>
                {isCompleted ? <FiCheck size={14} /> : <span>{step.icon}</span>}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
