import { PageHeader } from '../components/PageHeader'

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About the Studio"
        title="Fourteen years of shaping rooms around real life."
        description="Navaru Interior Solution is a small studio taking on a deliberately limited number of projects each year, so every space gets the founders' direct attention from first sketch to final styling."
      />
      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <p className="max-w-2xl text-lg font-light leading-relaxed text-ink-700">
          Full studio story, team profiles, and process detail are coming soon.
        </p>
      </section>
    </>
  )
}
