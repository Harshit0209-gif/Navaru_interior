import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '../Input'
import { Button } from '../Button'
import { FileUpload } from '../FileUpload'
import { useSubmitContact } from '../../hooks/useSubmitContact'
import { isValidEmail, isValidPhone } from '../../utils/validators'
import { EMPTY_CONTACT_FORM } from '../../types/contact'
import type { ContactFormErrors, ContactFormValues } from '../../types/contact'

function validate(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {}
  if (!values.name.trim()) errors.name = 'Please tell us your name.'
  if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (values.phone && !isValidPhone(values.phone)) errors.phone = 'Enter a valid phone number.'
  if (!values.message.trim()) errors.message = 'Tell us a little about the project.'
  return errors
}

export function ContactForm() {
  const { submit, isSubmitting, uploadProgress, reset } = useSubmitContact()
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [attachment, setAttachment] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof ContactFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const ok = await submit(values, attachment)
    if (ok) setSubmitted(true)
  }

  function handleReset() {
    setValues(EMPTY_CONTACT_FORM)
    setErrors({})
    setAttachment(null)
    setSubmitted(false)
    reset()
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
          onClick={handleReset}
          className="text-xs font-medium uppercase tracking-widest2 text-brass-400 underline underline-offset-4"
        >
          Send another message
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Honeypot — hidden from real users via CSS, catches naive bots */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <Input label="Full Name" value={values.name} onChange={(e) => update('name', e.target.value)} />
          <AnimatePresence>
            {errors.name && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-red-500">
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Input label="Email Address" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} />
          <AnimatePresence>
            {errors.email && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-red-500">
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Input label="Phone Number (Optional)" type="tel" value={values.phone} onChange={(e) => update('phone', e.target.value)} />
          <AnimatePresence>
            {errors.phone && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-red-500">
                {errors.phone}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <Input label="Subject" value={values.subject} onChange={(e) => update('subject', e.target.value)} />
      </div>

      <div>
        <Input
          as="textarea"
          label="Tell us about your project"
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
        />
        <AnimatePresence>
          {errors.message && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-red-500">
              {errors.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <FileUpload
        file={attachment}
        onChange={setAttachment}
        progress={isSubmitting ? uploadProgress : 0}
        disabled={isSubmitting}
        label="Attachment (Optional)"
      />

      <Button type="submit" variant="primary" withArrow disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send Enquiry'}
      </Button>
    </form>
  )
}
