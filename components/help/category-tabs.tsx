'use client'

import { Button } from '@/components/mosaic'
import { Badge } from '@/components/mosaic'
import { cn } from '@/lib/utils'

interface Category {
  name: string
  count: number
}

interface CategoryTabsProps {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  showAll?: boolean
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
  showAll = true,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {showAll && (
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => onCategoryChange(null)}
          className={cn(
            'rounded-full transition-all duration-200',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'hover:bg-muted hover:scale-105'
          )}
        >
          Tümü
          <Badge variant="secondary" className="ml-2">
            {categories.reduce((sum, cat) => sum + cat.count, 0)}
          </Badge>
        </Button>
      )}
      {categories.map(category => (
        <Button
          key={category.name}
          variant={selectedCategory === category.name ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.name)}
          className={cn(
            'rounded-full transition-all duration-200',
            selectedCategory === category.name
              ? 'bg-primary text-primary-foreground text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'hover:bg-muted hover:scale-105'
          )}
        >
          {category.name}
          <Badge variant="secondary" className="ml-2">
            {category.count}
          </Badge>
        </Button>
      ))}
    </div>
  )
}
