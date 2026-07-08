import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Page Not Found', "The page you're looking for doesn't exist or may have moved.")

  return (
    <>
      <PageHeader
        eyebrow="404"
        title="This page doesn't exist."
        description="The page you're looking for doesn't exist or may have moved."
      />
      <section className="mx-auto max-w-content px-6 py-24 text-center lg:px-12">
        <Button variant="primary" withArrow href="/">
          Back to Home
        </Button>
      </section>
    </>
  )
}
