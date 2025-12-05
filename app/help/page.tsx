'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FAQList from '@/components/help/faq-list'
import SearchBar from '@/components/help/search-bar'
import CategoryTabs from '@/components/help/category-tabs'
import StatsCards from '@/components/help/stats-cards'
import { MessageSquare, BookOpen, Plus, HelpCircle, Sparkles } from 'lucide-react'

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
  const [, setFaqs] = useState<FAQ[]>([])
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
        // FAQ'leri getir
        const faqResponse = await fetch('/api/help/faq')
        const faqResult = (await faqResponse.json()) as { success: boolean; data?: FAQ[] }

        if (faqResult.success && faqResult.data) {
          setFaqs(faqResult.data)
          setStats(prev => ({ ...prev, totalFAQs: faqResult.data?.length || 0 }))

          // Kategorileri hesapla
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

        // Ticket istatistiklerini getir
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
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <HelpCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Yardım Merkezi</h1>
              <p className="text-lg md:text-xl text-white/90">
                Sorularınızın cevaplarını bulun veya bizimle iletişime geçin
              </p>
            </div>
          </div>
          <div className="mt-6 max-w-2xl">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="SSS'lerde ara... (örn: ödeme, hesap, abonelik)"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="#faq">
          <Card className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sıkça Sorulan Sorular</CardTitle>
                  <CardDescription className="mt-1">SSS&apos;leri keşfedin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Button
                variant="outline"
                className="w-full group-hover:bg-blue-50 group-hover:border-blue-500 transition-colors"
              >
                SSS&apos;leri Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/help/tickets">
          <Card className="group relative overflow-hidden border-2 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Destek Taleplerim</CardTitle>
                  <CardDescription className="mt-1">Taleplerinizi görüntüleyin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Button
                variant="outline"
                className="w-full group-hover:bg-green-50 group-hover:border-green-500 transition-colors"
              >
                Taleplerimi Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/help/tickets/new">
          <Card className="group relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Yeni Talep</CardTitle>
                  <CardDescription className="mt-1">Destek talebi oluşturun</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                Yeni Talep Oluştur
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalFAQs={stats.totalFAQs}
        totalTickets={stats.totalTickets}
        resolvedTickets={stats.resolvedTickets}
        pendingTickets={stats.pendingTickets}
      />

      {/* FAQ Section */}
      <div id="faq" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-gray-600 mt-2">
              Aradığınız cevabı bulamadınız mı?{' '}
              <Link href="/help/tickets/new" className="text-blue-600 hover:underline font-medium">
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
