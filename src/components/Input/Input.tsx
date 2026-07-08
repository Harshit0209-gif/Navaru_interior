import { useId, useState } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type BaseProps = {
  label: string
  as?: 'input' | 'textarea'
}

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export function Input({ label, as = 'input', id, value, onFocus, onBlur, rows, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [focused, setFocused] = useState(false)
  // Native date/time inputs always render placeholder segments (dd-mm-yyyy),
  // so the label must stay floated up even when "empty" or it overlaps them.
  const alwaysFloats = rest.type === 'date' || rest.type === 'time' || rest.type === 'datetime-local'
  const hasValue = Boolean(value) || alwaysFloats
  const floating = focused || hasValue

  const fieldClasses =
    'peer w-full border-b border-ink-900/20 bg-transparent pb-3 pt-6 text-base font-light text-ink-900 outline-none transition-colors duration-300 focus:border-brass-400'

  return (
    <div className="relative">
      {as === 'textarea' ? (
        <textarea
          id={inputId}
          rows={rows ?? 4}
          value={value}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={cn(fieldClasses, 'resize-none')}
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          value={value}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={fieldClasses}
          {...rest}
        />
      )}
      <label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute left-0 font-light text-ink-700/60 transition-all duration-300 ease-luxury',
          floating ? 'top-0 text-[11px] uppercase tracking-widest2 text-brass-400' : 'top-6 text-base',
        )}
      >
        {label}
      </label>
    </div>
  )
}
