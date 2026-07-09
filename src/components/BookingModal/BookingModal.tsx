import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck } from 'lucide-react'
import { Modal } from '../Modal'
import { Input } from '../Input'
import { Button } from '../Button'
import { FileUpload } from '../FileUpload'
import { useBookingModal } from '../../context/BookingModalContext'
import { useSubmitBooking } from '../../hooks/useSubmitBooking'
import { isValidEmail, isValidFutureDate, isValidPhone } from '../../utils/validators'
import { PROPERTY_TYPES, DESIGN_TYPES, EMPTY_BOOKING_FORM } from '../../types/booking'
import type { BookingFormErrors, BookingFormValues } from '../../types/booking'

const selectClasses =
  'peer w-full border-b border-ink-900/20 bg-ink-900/5 pb-3 pt-6 text-base font-light text-ink-900 outline-none transition-colors duration-300 focus:border-brass-400'

function validate(values: BookingFormValues): BookingFormErrors {
  const errors: BookingFormErrors = {}
  if (!values.customerName.trim()) errors.customerName = 'Please tell us your name.'
  if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (!isValidPhone(values.phone)) errors.phone = 'Enter a valid phone number.'
  if (!isValidFutureDate(values.preferredDate)) errors.preferredDate = 'Choose today or a future date.'
  if (!values.agreedToPrivacyPolicy) errors.agreedToPrivacyPolicy = 'Please accept the Privacy Policy to continue.'
  return errors
}

export function BookingModal() {
  const { isOpen, project, close } = useBookingModal()
  const { submit, isSubmitting, uploadProgress, reset } = useSubmitBooking()
  const [values, setValues] = useState<BookingFormValues>(EMPTY_BOOKING_FORM)
  const [errors, setErrors] = useState<BookingFormErrors>({})
  const [attachment, setAttachment] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const ok = await submit({
      projectId: project?.id ?? '',
      projectName: project?.name ?? 'General Consultation',
      values,
      attachment,
    })
    if (ok) setSubmitted(true)
  }

  function handleClose() {
    close()
    window.setTimeout(() => {
      setSubmitted(false)
      setValues(EMPTY_BOOKING_FORM)
      setErrors({})
      setAttachment(null)
      reset()
    }, 400)
  }

  return (
    <Modal open={isOpen} onClose={handleClose} maxWidthClassName="max-w-2xl">
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-4"
        >
          <CalendarCheck className="h-9 w-9 text-brass-400" strokeWidth={1.25} />
          <h3 className="text-2xl font-light tracking-tight text-ink-900">Consultation requested.</h3>
          <p className="max-w-sm text-sm font-light leading-relaxed text-ink-700">
            We&apos;ll call {values.phone} within one business day to confirm a time that works for you.
          </p>
          <Button variant="outline" onClick={handleClose}>
            Done
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest2 text-brass-400">Book a Consultation</p>
            <h3 className="mt-3 text-2xl font-light tracking-tight text-ink-900">
              {project ? project.name : "Let's find a time to talk."}
            </h3>
          </div>

          {/* Honeypot — hidden from real users via CSS, catches naive bots */}
          <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="booking-website">Website</label>
            <input
              id="booking-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <div>
              <Input label="Full Name" value={values.customerName} onChange={(e) => update('customerName', e.target.value)} />
              {errors.customerName && <p className="mt-2 text-xs text-red-500">{errors.customerName}</p>}
            </div>
            <div>
              <Input label="Email Address" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} />
              {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <Input label="Phone Number" type="tel" value={values.phone} onChange={(e) => update('phone', e.target.value)} />
              {errors.phone && <p className="mt-2 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <Input
                label="Preferred Consultation Date"
                type="date"
                value={values.preferredDate}
                onChange={(e) => update('preferredDate', e.target.value)}
              />
              {errors.preferredDate && <p className="mt-2 text-xs text-red-500">{errors.preferredDate}</p>}
            </div>

            <Input label="City" value={values.city} onChange={(e) => update('city', e.target.value)} />
            <Input label="State" value={values.state} onChange={(e) => update('state', e.target.value)} />
            <Input label="Country" value={values.country} onChange={(e) => update('country', e.target.value)} />
            <Input label="Estimated Budget" value={values.budget} onChange={(e) => update('budget', e.target.value)} />

            <div className="sm:col-span-2">
              <Input label="Project Address" value={values.address} onChange={(e) => update('address', e.target.value)} />
            </div>

            <div className="relative">
              <select
                value={values.propertyType}
                onChange={(e) => update('propertyType', e.target.value)}
                className={selectClasses}
                aria-label="Property Type"
              >
                <option value="">Select property type…</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label className="pointer-events-none absolute left-0 top-0 text-[11px] font-light uppercase tracking-widest2 text-brass-400">
                Property Type
              </label>
            </div>

            <div className="relative">
              <select
                value={values.designType}
                onChange={(e) => update('designType', e.target.value)}
                className={selectClasses}
                aria-label="Design Type"
              >
                <option value="">Select design type…</option>
                {DESIGN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label className="pointer-events-none absolute left-0 top-0 text-[11px] font-light uppercase tracking-widest2 text-brass-400">
                Design Type
              </label>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Message"
                as="textarea"
                rows={3}
                value={values.message}
                onChange={(e) => update('message', e.target.value)}
              />
            </div>
          </div>

          <FileUpload file={attachment} onChange={setAttachment} progress={isSubmitting ? uploadProgress : 0} disabled={isSubmitting} label="Reference Image / Document (Optional)" />

          <div>
            <label className="flex items-start gap-3 text-sm font-light text-ink-700">
              <input
                type="checkbox"
                checked={values.agreedToPrivacyPolicy}
                onChange={(e) => update('agreedToPrivacyPolicy', e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brass-400"
              />
              I agree to the Privacy Policy
            </label>
            {errors.agreedToPrivacyPolicy && <p className="mt-2 text-xs text-red-500">{errors.agreedToPrivacyPolicy}</p>}
          </div>

          <Button type="submit" variant="primary" withArrow className="w-full justify-center" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Request Consultation'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
