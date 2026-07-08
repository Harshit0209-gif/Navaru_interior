import { getSupabase } from '../lib/supabase'
import type { ContactFormValues } from '../types/contact'
import { sanitizeFormValues } from '../utils/sanitize'
import { uploadAttachment } from './uploadService'

export interface SubmitContactParams {
  values: ContactFormValues
  attachment?: File | null
  onUploadProgress?: (percent: number) => void
}

export async function submitContactEnquiry({
  values,
  attachment,
  onUploadProgress,
}: SubmitContactParams): Promise<void> {
  const clean = sanitizeFormValues(values)

  let attachmentUrl: string | null = null
  if (attachment) {
    attachmentUrl = await uploadAttachment(attachment, 'contact', onUploadProgress)
  }

  const supabase = await getSupabase()
  const { error } = await supabase.from('contact_enquiries').insert({
    name: clean.name,
    phone: clean.phone || null,
    email: clean.email,
    subject: clean.subject || null,
    message: clean.message,
    attachment_url: attachmentUrl,
  })

  if (error) throw error
}
