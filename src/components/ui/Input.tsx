import { forwardRef, useState } from 'react'
import { cn } from '../../lib/utils'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false)
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`

    return (
      <div className={cn(styles.wrapper, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div
          className={cn(
            styles.box,
            focused && styles.focused,
            error && styles.hasError,
          )}
        >
          {leftIcon && (
            <span className={cn(styles.icon, styles.iconLeft)}>{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(styles.input, leftIcon && styles.withLeftIcon, rightIcon && styles.withRightIcon)}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              className={cn(styles.icon, styles.iconRight)}
              onClick={onRightIconClick}
              tabIndex={-1}
              aria-label={props.type === 'password' ? 'Toggle password' : undefined}
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {hint && !error && <p className={styles.hint}>{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
