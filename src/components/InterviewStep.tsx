'use client';

import { useState, KeyboardEvent } from 'react';
import styles from './InterviewStep.module.css';

interface InterviewStepProps {
  title: string;
  subtitle: string;
  description: string;
  fields: FieldConfig[];
  onSubmit: (data: Record<string, unknown>) => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  initialData?: Record<string, unknown>;
  loading?: boolean;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'tags' | 'select';
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export default function InterviewStep({
  title,
  subtitle,
  description,
  fields,
  onSubmit,
  onBack,
  isFirst,
  isLast,
  initialData = {},
  loading,
}: InterviewStepProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [tagInput, setTagInput] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = (name: string, value: string) => {
    if (!value.trim()) return;
    const current = (formData[name] as string[]) || [];
    if (!current.includes(value.trim())) {
      handleChange(name, [...current, value.trim()]);
    }
    setTagInput((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTagRemove = (name: string, index: number) => {
    const current = (formData[name] as string[]) || [];
    handleChange(name, current.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (name: string, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd(name, tagInput[name] || '');
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.subtitle}>{subtitle}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.fields}>
        {fields.map((field) => (
          <div key={field.name} className="input-group">
            <label className="input-label">{field.label}</label>
            {field.hint && <span className="input-hint">{field.hint}</span>}

            {field.type === 'text' && (
              <input
                className="input"
                type="text"
                placeholder={field.placeholder}
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                className="input"
                placeholder={field.placeholder}
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                rows={5}
              />
            )}

            {field.type === 'select' && (
              <select
                className="input select"
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'tags' && (
              <div className="tag-container" onClick={(e) => {
                const input = (e.currentTarget as HTMLElement).querySelector('input');
                input?.focus();
              }}>
                {((formData[field.name] as string[]) || []).map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                    <button
                      className="tag-remove"
                      onClick={(e) => { e.stopPropagation(); handleTagRemove(field.name, i); }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="tag-input"
                  type="text"
                  placeholder={field.placeholder}
                  value={tagInput[field.name] || ''}
                  onChange={(e) => setTagInput((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  onKeyDown={(e) => handleTagKeyDown(field.name, e)}
                  onBlur={() => handleTagAdd(field.name, tagInput[field.name] || '')}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        {!isFirst && onBack && (
          <button className="btn btn-secondary" onClick={onBack} disabled={loading}>
            Back
          </button>
        )}
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : isLast ? (
            '✨ Complete Interview'
          ) : (
            'Continue →'
          )}
        </button>
      </div>
    </div>
  );
}
