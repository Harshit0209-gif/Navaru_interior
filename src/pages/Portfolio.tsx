import { PageHeader } from '../components/PageHeader'
import { ProjectCard } from '../components/ProjectCard'

const PROJECTS = [
  { title: 'The Ardent Residence', category: 'Residential', photoId: '1616594039964-ae9021a400a0' },
  { title: 'Marlowe Rooftop Lounge', category: 'Hospitality', photoId: '1517248135467-4c7edcad34c4' },
  { title: 'Casa Ferro', category: 'Residential', photoId: '1600210492486-724fe5c67fb0' },
  { title: 'Thornbury Offices', category: 'Commercial', photoId: '1497366216548-37526070297c' },
  { title: 'The Linden Suite', category: 'Residential', photoId: '1616486338812-3dadae4b4ace' },
  { title: 'Almyra Boutique', category: 'Retail', photoId: '1441984904996-e0b6ba687e04' },
  { title: 'Solane Penthouse', category: 'Residential', photoId: '1560448204-e02f11c3d0e2' },
  { title: 'Birch & Co. Café', category: 'Hospitality', photoId: '1556911220-bff31c812dba' },
  { title: 'Vantage Studio', category: 'Commercial', photoId: '1600607687939-ce8a6c25118c' },
]

export default function Portfolio() {
  return (
    <>
      <PageHeader
        eyebrow="Selected Work"
        title="Every project, one continuous body of work."
        description="A growing archive of residential, hospitality, retail, and commercial interiors."
      />
      <section className="mx-auto max-w-content px-6 py-24 lg:px-12">
        <div className="grid auto-rows-[320px] gap-4 sm:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.title}
              index={i}
              title={project.title}
              category={project.category}
              image={`https://images.unsplash.com/photo-${project.photoId}?auto=format&fit=crop&w=1000&h=1250&q=80`}
            />
          ))}
        </div>
      </section>
    </>
  )
}
