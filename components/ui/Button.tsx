import React, { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    loading?: boolean
}

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = styles.button
    const variantClass = styles[variant]
    const sizeClass = styles[size]
    const widthClass = fullWidth ? styles.fullWidth : ''
    const loadingClass = loading ? styles.loading : ''

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className={styles.spinner} />}
            <span className={loading ? styles.hiddenText : ''}>{children}</span>
        </button>
    )
}
