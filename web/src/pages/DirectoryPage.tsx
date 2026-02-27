import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ArrowUpDown, ExternalLink, Plus, Search } from 'lucide-react'

type DirectoryLink = {
  title: string
  description: string
  url: string
  tag: 'Official' | 'Housing' | 'Student Life' | 'Tech' | 'Careers' | 'Community'
}

const LINKS: DirectoryLink[] = [
  {
    title: 'Everything UMass Leasing (Coming Soon)',
    description: 'Starter placeholder for housing and sublease discovery inside the UMass community.',
    url: 'https://everything-umass.tech',
    tag: 'Housing',
  },
  {
    title: 'UMass Amherst',
    description: 'Official university home: academics, campus life, and key student services.',
    url: 'https://www.umass.edu',
    tag: 'Official',
  },
  {
    title: 'SPIRE',
    description: 'Student portal for enrollment, records, billing, and advising tasks.',
    url: 'https://www.spire.umass.edu',
    tag: 'Official',
  },
  {
    title: 'UMass Residential Life',
    description: 'Housing application steps, move-in guidance, and room assignment resources.',
    url: 'https://www.umass.edu/living',
    tag: 'Housing',
  },
  {
    title: 'Off Campus Housing Services',
    description: 'University support for off-campus listings, leases, and tenant education.',
    url: 'https://offcampushousing.umass.edu',
    tag: 'Housing',
  },
  {
    title: 'UMass Dining',
    description: 'Menus, hours, and dining locations across campus.',
    url: 'https://umassdining.com',
    tag: 'Student Life',
  },
  {
    title: 'UMass Libraries',
    description: 'Library catalog, study spaces, research help, and equipment checkout.',
    url: 'https://www.library.umass.edu',
    tag: 'Student Life',
  },
  {
    title: 'Moodle',
    description: 'Course materials, assignments, announcements, and class discussions.',
    url: 'https://moodle.umass.edu',
    tag: 'Official',
  },
  {
    title: 'UMass Career Development',
    description: 'Career advising, internships, and recruitment events.',
    url: 'https://www.umass.edu/careers',
    tag: 'Careers',
  },
  {
    title: 'Manning CICS',
    description: 'Computer science department news, resources, and student opportunities.',
    url: 'https://www.cics.umass.edu',
    tag: 'Tech',
  },
  {
    title: 'UMass CS Discord',
    description: 'Community server for student collaboration, study groups, and project sharing.',
    url: 'https://discord.gg/umasscs',
    tag: 'Community',
  },
  {
    title: 'Everything UMass Discord',
    description: 'Share product feedback, ask for features, and coordinate student launch efforts.',
    url: 'https://discord.gg/Xb4W6FUh',
    tag: 'Community',
  },
]

const SUBMIT_LINK_URL =
  'https://github.com/shivraj-S-bhatti/umass-marketplace/issues/new?template=feature_request.md&title=%5BDIRECTORY%5D+Add+or+update+UMass+links'

const SORT_OPTIONS = [
  { value: 'az', label: 'A to Z' },
  { value: 'za', label: 'Z to A' },
] as const

type SortMode = (typeof SORT_OPTIONS)[number]['value']

export default function DirectoryPage() {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<'All' | DirectoryLink['tag']>('All')
  const [sortMode, setSortMode] = useState<SortMode>('az')

  const tags = useMemo(() => ['All', ...new Set(LINKS.map(link => link.tag))] as const, [])

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = LINKS.filter(link => {
      const matchesTag = selectedTag === 'All' || link.tag === selectedTag
      const matchesQuery =
        normalizedQuery.length === 0 ||
        link.title.toLowerCase().includes(normalizedQuery) ||
        link.description.toLowerCase().includes(normalizedQuery) ||
        link.tag.toLowerCase().includes(normalizedQuery)

      return matchesTag && matchesQuery
    })

    return filtered.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title)
      return sortMode === 'az' ? comparison : -comparison
    })
  }, [query, selectedTag, sortMode])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">UMass Useful Links Directory</h1>
          <p className="text-sm text-muted-foreground">
            A Yahoo-style directory for students. This is a playground app, so we keep this list fast to browse and easy to improve.
          </p>
        </div>

        <Card className="border border-border">
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search links, categories, or keywords..."
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                {SORT_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={sortMode === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortMode(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="h-full border border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-4 h-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-medium">
                        {link.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-0.5" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <Card className="border border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                No links found. Try a different category or search term.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="pt-2 flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={SUBMIT_LINK_URL} target="_blank" rel="noopener noreferrer">
              <Plus className="h-4 w-4 mr-2" />
              Submit a Link
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
