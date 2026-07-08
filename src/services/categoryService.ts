import { getSupabase } from '../lib/supabase'
import type { Category } from '../types/portfolio'

export async function fetchCategories(): Promise<Category[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data ?? []
}
