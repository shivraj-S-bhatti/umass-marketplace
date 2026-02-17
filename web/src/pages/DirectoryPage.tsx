import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { ExternalLink, Plus } from 'lucide-react'

const LINKS = [
  {
    title: 'Discord Community',
    description: 'Chat with fellow UMass students, get announcements, and give feedback.',
    url: 'https://discord.gg/Xb4W6FUh',
    tag: 'Community',
  },
  {
    title: 'UMass Amherst',
    description: 'Official university homepage — admissions, academics, campus resources.',
    url: 'https://www.umass.edu',
    tag: 'Official',
  },
  {
    title: 'UMass Housing',
    description: 'Residential life, housing applications, and room assignments.',
    url: 'https://www.umass.edu/living',
    tag: 'Official',
  },
  {
    title: 'UMass Dining',
    description: 'Menus, hours, and dining locations on campus.',
    url: 'https://umassdining.com',
    tag: 'Official',
  },
]

const SUBMIT_LINK_URL =
  'https://github.com/shivraj-S-bhatti/umass-marketplace/issues/new?template=feature_request.md&title=[Directory]+New+link+suggestion'

export default function DirectoryPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">UMass Links Directory</h1>
          <p className="text-sm text-muted-foreground">
            Useful links for the UMass community. More coming soon — submit yours below!
          </p>
        </div>

        <div className="grid gap-3">
          {LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="border border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-medium">
                        {link.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <div className="pt-2">
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
