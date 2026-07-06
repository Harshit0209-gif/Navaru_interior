import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '../Input'
import { Button } from '../Button'

type FormState = {
  name: string
  email: string
  budget: string
  message: string
}

const EMPTY_STATE: FormState = { name: '', email: '', budget: '', message: '' }

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ContactForm() {
  const [values, setValues] = useState<FormState>(EMPTY_STATE)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): boolean {
    const next: Partial<FormState> = {}
    if (!values.name.trim()) next.name = 'Please tell us your name.'
    if (!isValidEmail(values.email)) next.email = 'Enter a valid email address.'
    if (!values.message.trim()) next.message = 'Tell us a little about the project.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-start gap-4 border border-brass-300/40 bg-cream-50 p-10"
      >
        <CheckCircle2 className="h-9 w-9 text-brass-400" strokeWidth={1.25} />
        <h3 className="text-2xl font-light tracking-tight text-ink-900">
          Thank you, {values.name.split(' ')[0]}.
        </h3>
        <p className="max-w-sm text-sm font-light leading-relaxed text-ink-700">
          We've received your enquiry and will reply within one business day to
          schedule your consultation.
        </p>
        <button
          onClick={() => {
            setValues(EMPTY_STATE)
            setSubmitted(false)
          }}
          className="text-xs font-medium uppercase tracking-widest2 text-brass-400 underline underline-offset-4"
        >
          Send another message
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <Input
            label="Full Name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs text-red-500"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Input
            label="Email Address"
            type="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs text-red-500"
              >
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Input
        label="Approximate Budget"
        value={values.budget}
        onChange={(e) => update('budget', e.target.value)}
      />

      <div>
        <Input
          as="textarea"
          label="Tell us about your project"
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
        />
        <AnimatePresence>
          {errors.message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-red-500"
            >
              {errors.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Button type="submit" variant="primary" withArrow>
        Send Enquiry
      </Button>
    </form>
  )
}
