import { useRef, useState } from 'react'
import { submitBookingRequest } from '../services/bookingService'
import type { BookingFormValues } from '../types/booking'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

export interface SubmitBookingArgs {
  projectId: string
  projectName: string
  values: BookingFormValues
  attachment?: File | null
}

// Minimum time (ms) a real person needs to fill the form. Bots that submit
// faster than this get silently rejected — a cheap, effective spam filter
// that needs no server-side component.
const MIN_FILL_TIME_MS = 2000

export function useSubmitBooking() {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const hasSubmittedRef = useRef(false)
  const mountedAtRef = useRef(Date.now())

  async function submit(args: SubmitBookingArgs): Promise<boolean> {
    if (hasSubmittedRef.current || isSubmitting) return false

    // Honeypot field: invisible to real users, bots tend to fill every input.
    if (args.values.website) {
      hasSubmittedRef.current = true
      showToast('success', "Consultation requested. We'll be in touch within one business day.")
      return true
    }

    if (Date.now() - mountedAtRef.current < MIN_FILL_TIME_MS) {
      showToast('error', 'Please take a moment to review the form before submitting.')
      return false
    }

    setIsSubmitting(true)
    setUploadProgress(0)
    try {
      await submitBookingRequest({
        projectId: args.projectId,
        projectName: args.projectName,
        values: args.values,
        attachment: args.attachment,
        onUploadProgress: setUploadProgress,
      })
      hasSubmittedRef.current = true
      showToast('success', "Consultation requested. We'll be in touch within one business day.")
      return true
    } catch (err) {
      showToast('error', getErrorMessage(err))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  function reset() {
    hasSubmittedRef.current = false
    mountedAtRef.current = Date.now()
    setUploadProgress(0)
  }

  return { submit, isSubmitting, uploadProgress, reset }
}
