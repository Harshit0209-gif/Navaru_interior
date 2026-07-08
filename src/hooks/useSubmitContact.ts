import { useRef, useState } from 'react'
import { submitContactEnquiry } from '../services/contactService'
import type { ContactFormValues } from '../types/contact'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/errors'

const MIN_FILL_TIME_MS = 2000

export function useSubmitContact() {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const hasSubmittedRef = useRef(false)
  const mountedAtRef = useRef(Date.now())

  async function submit(values: ContactFormValues, attachment?: File | null): Promise<boolean> {
    if (hasSubmittedRef.current || isSubmitting) return false

    if (values.website) {
      hasSubmittedRef.current = true
      showToast('success', "Message sent. We'll get back to you shortly.")
      return true
    }

    if (Date.now() - mountedAtRef.current < MIN_FILL_TIME_MS) {
      showToast('error', 'Please take a moment to review the form before submitting.')
      return false
    }

    setIsSubmitting(true)
    setUploadProgress(0)
    try {
      await submitContactEnquiry({ values, attachment, onUploadProgress: setUploadProgress })
      hasSubmittedRef.current = true
      showToast('success', "Message sent. We'll get back to you shortly.")
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
