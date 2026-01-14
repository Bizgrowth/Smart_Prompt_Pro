import { TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
  showCount?: boolean
}

export default function Textarea({
  label,
  error,
  required,
  helperText,
  showCount,
  value,
  maxLength,
  className = '',
  ...props
}: TextareaProps) {
  const count = typeof value === 'string' ? value.length : 0

  return (
    <div className={styles.textareaWrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        className={`${styles.textarea} ${error ? styles.textareaError : ''} ${className}`}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className={styles.footer}>
        <div className={styles.messages}>
          {error && <span className={styles.errorText}>{error}</span>}
          {helperText && !error && (
            <span className={styles.helperText}>{helperText}</span>
          )}
        </div>
        {showCount && maxLength && (
          <span className={styles.count}>
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
