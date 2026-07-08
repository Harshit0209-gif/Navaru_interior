import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PortfolioForm } from '../components/PortfolioForm'

export default function AdminPortfolioNew() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Add Project"
        breadcrumbs={[{ label: 'Portfolio', to: '/admin/portfolio' }, { label: 'New Project' }]}
      />
      <PortfolioForm
        mode="create"
        onSuccess={() => navigate('/admin/portfolio')}
        onCancel={() => navigate('/admin/portfolio')}
      />
    </>
  )
}
