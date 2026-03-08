'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PageHeader,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  SearchBox,
  StatCard
} from '@/components/mosaic'
import FAQList from '@/components/help/faq-list'
import CategoryTabs from '@/components/help/category-tabs'
import { MessageSquare, BookOpen, Plus, CheckCircle, Clock } from 'lucide-react'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string | null
  displayOrder: number
  isActive: boolean
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [stats, setStats] = useState({
    totalFAQs: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faqResponse = await fetch('/api/help/faq')
        const faqResult = (await faqResponse.json()) as { success: boolean; data?: FAQ[] }

        if (faqResult.success && faqResult.data) {
          setStats(prev => ({ ...prev, totalFAQs: faqResult.data?.length || 0 }))

          const categoryMap = new Map<string, number>()
          faqResult.data.forEach(faq => {
            const cat = faq.category || 'Genel'
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
          })

          const categoryList = Array.from(categoryMap.entries()).map(([name, count]) => ({
            name,
            count,
          }))
          setCategories(categoryList)
        }

        const ticketsResponse = await fetch('/api/help/tickets')
        const ticketsResult = (await ticketsResponse.json()) as {
          success: boolean
          data?: Array<{ status: string }>
        }

        if (ticketsResult.success && ticketsResult.data) {
          const total = ticketsResult.data.length
          const resolved = ticketsResult.data.filter(t => t.status === 'resolved').length
          const pending = ticketsResult.data.filter(t => t.status === 'pending').length

          setStats(prev => ({
            ...prev,
            totalTickets: total,
            resolvedTickets: resolved,
            pendingTickets: pending,
          }))
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error)
      }
    }

    void fetchData()
  }, [])

  const filteredCategory = searchQuery ? null : selectedCategory

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Yardım Merkezi"
        description="Sorularınızın cevaplarını bulun veya bizimle iletişime geçin"
        actions={
          <div className="w-full sm:w-80">
            <SearchBox
              onSearch={setSearchQuery}
              placeholder="SSS'lerde ara..."
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam SSS"
          value={stats.totalFAQs}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Toplam Talep"
          value={stats.totalTickets}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          title="Çözülen"
          value={stats.resolvedTickets}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Bekleyen"
          value={stats.pendingTickets}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="#faq">
          <Card className="h-full hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Sıkça Sorulan Sorular</CardTitle>
                  <CardDescription className="mt-1">SSS&apos;leri keşfedin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/help/tickets">
          <Card className="h-full hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Destek Taleplerim</CardTitle>
                  <CardDescription className="mt-1">Taleplerinizi görüntüleyin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/help/tickets/new">
          <Card className="h-full hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Yeni Talep</CardTitle>
                  <CardDescription className="mt-1">Destek talebi oluşturun</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Oluştur
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div id="faq" className="space-y-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sıkça Sorulan Sorular</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Aradığınız cevabı bulamadınız mı?{' '}
              <Link href="/help/tickets/new" className="text-primary hover:underline font-medium">
                Destek talebi oluşturabilirsiniz
              </Link>
              .
            </p>
          </div>
        </div>

        {categories.length > 0 && !searchQuery && (
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}

        <FAQList category={filteredCategory || undefined} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
