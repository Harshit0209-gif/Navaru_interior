import { getSupabase } from '../lib/supabase'
import type { BookingFormValues } from '../types/booking'
import { sanitizeFormValues } from '../utils/sanitize'
import { uploadAttachment } from './uploadService'

export interface SubmitBookingParams {
  projectId: string
  projectName: string
  values: BookingFormValues
  attachment?: File | null
  onUploadProgress?: (percent: number) => void
}

export async function submitBookingRequest({
  projectId,
  projectName,
  values,
  attachment,
  onUploadProgress,
}: SubmitBookingParams): Promise<void> {
  const clean = sanitizeFormValues(values)

  let attachmentUrl: string | null = null
  if (attachment) {
    attachmentUrl = await uploadAttachment(attachment, 'bookings', onUploadProgress)
  }

  const supabase = await getSupabase()
  const { error } = await supabase.from('book_design_requests').insert({
    project_id: projectId || null,
    project_name: projectName,
    customer_name: clean.customerName,
    phone: clean.phone,
    email: clean.email,
    city: clean.city || null,
    state: clean.state || null,
    country: clean.country || null,
    address: clean.address || null,
    property_type: clean.propertyType || null,
    design_type: clean.designType || null,
    budget: clean.budget || null,
    preferred_date: clean.preferredDate || null,
    message: clean.message || null,
    attachment_url: attachmentUrl,
  })

  if (error) throw error
}
