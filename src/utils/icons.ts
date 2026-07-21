import {
  Armchair,
  Award,
  Building2,
  Check,
  Clock,
  Compass,
  Hammer,
  Home,
  Lamp,
  Layers,
  Leaf,
  Lightbulb,
  PaintBucket,
  Palette,
  PenTool,
  Ruler,
  Shield,
  Sofa,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Curated set of icons admins can pick for a Services/Values list item.
// Keyed by name (stored as plain text in the database) rather than a
// component reference, so the value survives round-tripping through JSON.
export const ICON_MAP: Record<string, LucideIcon> = {
  Armchair,
  Award,
  Building2,
  Check,
  Clock,
  Compass,
  Hammer,
  Home,
  Lamp,
  Layers,
  Leaf,
  Lightbulb,
  PaintBucket,
  Palette,
  PenTool,
  Ruler,
  Shield,
  Sofa,
  Sparkles,
  Star,
  Users,
}

export const ICON_OPTIONS = Object.keys(ICON_MAP) as (keyof typeof ICON_MAP)[]

export function getIcon(name: string | null | undefined): LucideIcon {
  return (name && ICON_MAP[name]) || Sparkles
}
