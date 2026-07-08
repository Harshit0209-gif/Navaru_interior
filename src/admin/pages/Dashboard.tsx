import { motion } from 'framer-motion'
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileEdit,
  FolderKanban,
  FolderPlus,
  Globe,
  HardDrive,
  Images,
  Inbox,
  LayoutGrid,
  Mail,
  Settings as SettingsIcon,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { DashboardCard } from '../components/DashboardCard'
import { MiniBarChart } from '../components/MiniBarChart'
import { RecentUploadsPanel } from '../components/RecentUploadsPanel'
import { Skeleton } from '../../components/Skeleton'
import { BookingStatusBadge } from '../components/BookingStatusBadge'
import { ContactStatusBadge } from '../components/ContactStatusBadge'
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics'
import { formatFileSize } from '../../utils/imageDimensions'
import { timeAgo } from '../../utils/timeAgo'

const QUICK_ACTIONS = [
  { label: 'Add Project', to: '/admin/portfolio', icon: FolderPlus },
  { label: 'View Portfolio', to: '/admin/portfolio', icon: LayoutGrid },
  { label: 'Upload Images', to: '/admin/media', icon: Images },
  { label: 'Settings', to: '/admin/settings', icon: SettingsIcon },
]

export default function AdminDashboard() {
  const {
    loading,
    projectStats,
    bookingStats,
    enquiryStats,
    storageStats,
    recentProjects,
    recentBookings,
    recentEnquiries,
    recentUploads,
    monthlyTrend,
  } = useDashboardAnalytics()

  const stats = [
    { id: 'total-projects', label: 'Total Projects', value: projectStats.total, icon: FolderKanban },
    { id: 'featured-projects', label: 'Featured Projects', value: projectStats.featured, icon: Star },
    { id: 'published-projects', label: 'Published Projects', value: projectStats.published, icon: Globe },
    { id: 'draft-projects', label: 'Draft Projects', value: projectStats.draft, icon: FileEdit },
    { id: 'total-bookings', label: 'Total Bookings', value: bookingStats.total, icon: CalendarCheck },
    { id: 'pending-bookings', label: 'Pending Bookings', value: bookingStats.pending, icon: Clock },
    { id: 'completed-bookings', label: 'Completed Bookings', value: bookingStats.completed, icon: CheckCircle2 },
    { id: 'total-enquiries', label: 'Contact Enquiries', value: enquiryStats.total, icon: Mail },
    { id: 'unread-enquiries', label: 'Unread Messages', value: enquiryStats.unread, icon: Inbox },
    {
      id: 'storage-usage',
      label: 'Storage Usage',
      value: storageStats.totalBytes,
      displayValue: formatFileSize(storageStats.totalBytes),
      icon: HardDrive,
    },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your portfolio, bookings, and enquiries."
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <DashboardCard
            key={stat.id}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            displayValue={stat.displayValue}
            index={i}
          />
        ))}
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
          Trends
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {loading ? (
            <>
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-52 w-full" />
            </>
          ) : (
            <>
              <MiniBarChart title="Monthly Projects" data={monthlyTrend.map((p) => ({ label: p.label, value: p.projects }))} />
              <MiniBarChart title="Monthly Bookings" data={monthlyTrend.map((p) => ({ label: p.label, value: p.bookings }))} />
              <MiniBarChart title="Monthly Enquiries" data={monthlyTrend.map((p) => ({ label: p.label, value: p.enquiries }))} />
            </>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
          Recent Activity
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <ActivityPanel title="Latest Projects" viewAllTo="/admin/portfolio">
            {loading ? (
              <li className="py-3 text-xs font-light text-ink-700/70">Loading…</li>
            ) : recentProjects.length === 0 ? (
              <li className="py-3 text-xs font-light text-ink-700/70">No projects yet.</li>
            ) : (
              recentProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-light text-ink-800">{project.title}</p>
                    <p className="text-xs font-light text-ink-700/50">{project.category ?? 'Uncategorized'}</p>
                  </div>
                  <span className="shrink-0 text-xs font-light text-ink-700/70">{timeAgo(project.updatedAt)}</span>
                </li>
              ))
            )}
          </ActivityPanel>

          <ActivityPanel title="Latest Bookings" viewAllTo="/admin/bookings">
            {loading ? (
              <li className="py-3 text-xs font-light text-ink-700/70">Loading…</li>
            ) : recentBookings.length === 0 ? (
              <li className="py-3 text-xs font-light text-ink-700/70">No booking requests yet.</li>
            ) : (
              recentBookings.map((booking) => (
                <li key={booking.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-light text-ink-800">{booking.customer_name}</p>
                    <p className="text-xs font-light text-ink-700/50">{booking.project_name}</p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </li>
              ))
            )}
          </ActivityPanel>

          <ActivityPanel title="Latest Contact" viewAllTo="/admin/contact">
            {loading ? (
              <li className="py-3 text-xs font-light text-ink-700/70">Loading…</li>
            ) : recentEnquiries.length === 0 ? (
              <li className="py-3 text-xs font-light text-ink-700/70">No contact enquiries yet.</li>
            ) : (
              recentEnquiries.map((enquiry) => (
                <li key={enquiry.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-light text-ink-800">{enquiry.name}</p>
                    <p className="text-xs font-light text-ink-700/50">{enquiry.subject || 'General enquiry'}</p>
                  </div>
                  <ContactStatusBadge status={enquiry.status} />
                </li>
              ))
            )}
          </ActivityPanel>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
          Uploads
        </h2>
        <RecentUploadsPanel uploads={loading ? null : recentUploads} />
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-widest2 text-ink-700/60">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, to, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={to}
                className="group flex flex-col items-center gap-3 border border-ink-900/10 bg-cream-50 px-4 py-6 text-center transition-colors duration-300 hover:border-brass-300"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass-50 text-brass-400 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="text-sm font-light text-ink-800">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}

function ActivityPanel({
  title,
  viewAllTo,
  children,
}: {
  title: string
  viewAllTo: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-ink-900/10 bg-cream-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-normal text-ink-900">{title}</h3>
        <Link
          to={viewAllTo}
          className="text-xs font-medium uppercase tracking-widest2 text-brass-400 transition-colors hover:text-brass-500"
        >
          View All
        </Link>
      </div>
      <ul className="mt-2 divide-y divide-ink-900/5">{children}</ul>
    </div>
  )
}
