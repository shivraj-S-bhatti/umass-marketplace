import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StickerBadge } from '@/components/ui/sticker-badge'
import { LeafDecoration } from '@/components/ui/leaf-decoration'
import { Search, DollarSign, Calendar, Eye, Plus } from 'lucide-react'

// Design Playground Page - Isolated UI/UX testing environment
// Use this page to test design changes before applying them to the rest of the app
export default function DesignPlaygroundPage() {
  const [testPrice, setTestPrice] = useState('99.99')
  const [testTitle, setTestTitle] = useState('Sample Listing Title')
  const [testDescription, setTestDescription] = useState('This is a sample description to test how text looks in our design system.')

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Design Playground</h1>
          <p className="text-base text-muted-foreground">
            Test UI/UX changes here before applying them to the rest of the app 🎨
          </p>
        </div>

        {/* Color Palette Showcase */}
        <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Warm autumn colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <div className="h-20 rounded-comic bg-background border-2 border-foreground"></div>
              <p className="text-xs font-bold">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic bg-card border-2 border-foreground"></div>
              <p className="text-xs font-bold">Card</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic bg-primary border-2 border-foreground"></div>
              <p className="text-xs font-bold">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic bg-accent border-2 border-foreground"></div>
              <p className="text-xs font-bold">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic bg-secondary border-2 border-foreground"></div>
              <p className="text-xs font-bold">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic bg-muted border-2 border-foreground"></div>
              <p className="text-xs font-bold">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic border-2 border-foreground" style={{ backgroundColor: 'hsl(15, 85%, 20%)' }}></div>
              <p className="text-xs font-bold">Foreground</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-comic border-2 border-foreground" style={{ backgroundColor: 'hsl(15, 85%, 30%)' }}></div>
              <p className="text-xs font-bold">Border</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Font sizes and weights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">H1 Heading</h1>
            <p className="text-xs text-muted-foreground">text-4xl md:text-5xl font-bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">H2 Heading</h2>
            <p className="text-xs text-muted-foreground">text-3xl font-bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">H3 Heading</h3>
            <p className="text-xs text-muted-foreground">text-2xl font-bold</p>
          </div>
          <div>
            <p className="text-base mb-2">Body text - Regular paragraph text</p>
            <p className="text-xs text-muted-foreground">text-base</p>
          </div>
          <div>
            <p className="text-sm mb-2">Small text - For secondary information</p>
            <p className="text-xs text-muted-foreground">text-sm</p>
          </div>
          <div>
            <p className="text-xs mb-2">Extra small text - For metadata</p>
            <p className="text-xs text-muted-foreground">text-xs</p>
          </div>
        </CardContent>
      </Card>

      {/* Buttons Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-bold">Variants</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">With Icons</p>
            <div className="flex flex-wrap gap-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticker Badges Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Sticker Badges</CardTitle>
          <CardDescription>Playful price tags and status badges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-bold">Price Badge</p>
            <div className="flex items-center gap-4">
              <StickerBadge variant="price" className="text-2xl">$99.99</StickerBadge>
              <StickerBadge variant="price" className="text-lg">$49.50</StickerBadge>
              <StickerBadge variant="price" className="text-base">$12.99</StickerBadge>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">Status Badges</p>
            <div className="flex items-center gap-4">
              <StickerBadge variant="status">ACTIVE</StickerBadge>
              <StickerBadge variant="status">ON HOLD</StickerBadge>
              <StickerBadge variant="new">NEW</StickerBadge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-price">Test Price</Label>
            <Input
              id="test-price"
              value={testPrice}
              onChange={(e) => setTestPrice(e.target.value)}
              placeholder="Enter price"
            />
            <div className="mt-2">
              <StickerBadge variant="price">${testPrice}</StickerBadge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Card Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Card</CardTitle>
          <CardDescription>Complete listing card component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Sample Listing Card */}
            <Card className="hover:shadow-comic transition-all hover:scale-[1.01] relative overflow-hidden">
              <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-comic flex items-center justify-center">
                <Eye className="h-12 w-12 text-primary/40" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-bold line-clamp-2 flex-1">{testTitle}</CardTitle>
                  <StickerBadge variant="status" className="shrink-0 text-xs px-2 py-1">
                    ACTIVE
                  </StickerBadge>
                </div>
                <CardDescription className="line-clamp-2 mt-1 text-sm">
                  {testDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <StickerBadge variant="price" className="text-lg px-3 py-1">
                      ${testPrice}
                    </StickerBadge>
                  </div>
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Listed Nov 15, 2024
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center text-xs">
                    <span className="px-2 py-0.5 rounded-comic bg-secondary border border-foreground font-medium">
                      Electronics
                    </span>
                    <span className="px-2 py-0.5 rounded-comic bg-muted border border-foreground font-medium">
                      Like New
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-title">Test Title</Label>
            <Input
              id="test-title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="Enter listing title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-description">Test Description</Label>
            <textarea
              id="test-description"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-comic border-2 border-foreground bg-card px-3 py-2 text-sm font-medium"
              placeholder="Enter listing description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Elements Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Inputs, labels, and form layouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sample-input">Sample Input</Label>
            <Input id="sample-input" placeholder="Enter text here..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sample-textarea">Sample Textarea</Label>
            <textarea
              id="sample-textarea"
              className="flex min-h-[80px] w-full rounded-comic border-2 border-foreground bg-card px-3 py-2 text-sm font-medium"
              placeholder="Enter multi-line text..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sample-select">Sample Select</Label>
            <select
              id="sample-select"
              className="flex h-10 w-full rounded-comic border-2 border-foreground bg-card px-3 py-2 text-sm font-medium"
            >
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Leaf Decorations Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Leaf Decorations</CardTitle>
          <CardDescription>Hand-drawn leaf doodles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6 p-4 bg-muted rounded-comic">
            <LeafDecoration size="sm" color="red" />
            <LeafDecoration size="sm" color="orange" />
            <LeafDecoration size="sm" color="yellow" />
            <LeafDecoration size="md" color="red" />
            <LeafDecoration size="md" color="orange" />
            <LeafDecoration size="md" color="yellow" />
            <LeafDecoration size="lg" color="red" />
            <LeafDecoration size="lg" color="orange" />
            <LeafDecoration size="lg" color="yellow" />
          </div>
        </CardContent>
      </Card>

      {/* Spacing Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <CardDescription>Compact spacing guidelines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-bold">Gap-1.5 (6px)</p>
            <div className="flex gap-1.5">
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">Gap-2 (8px)</p>
            <div className="flex gap-2">
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">Gap-3 (12px)</p>
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold">Gap-4 (16px)</p>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
              <div className="w-12 h-12 bg-primary rounded-comic"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

