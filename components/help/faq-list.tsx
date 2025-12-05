'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { HelpCircle } from 'lucide-react'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string | null
  displayOrder: number
  isActive: boolean
}

interface FAQListProps {
  category?: string
  searchQuery?: string
}

export default function FAQList({ category, searchQuery = '' }: FAQListProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const url = category
          ? `/api/help/faq?category=${encodeURIComponent(category)}`
          : '/api/help/faq'
        const response = await fetch(url)
        const result = (await response.json()) as { success: boolean; data?: FAQ[] }

        if (result.success && result.data) {
          setFaqs(result.data)
        }
      } catch (error) {
        console.error('FAQ yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchFAQs()
  }, [category])

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqs
    }

    const query = searchQuery.toLowerCase()
    return faqs.filter(
      faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
    )
  }, [faqs, searchQuery])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-2">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredFAQs.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz SSS bulunmamaktadır'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Farklı anahtar kelimeler deneyebilir veya destek talebi oluşturabilirsiniz.'
              : 'Yakında SSS eklenmesi planlanmaktadır.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">{filteredFAQs.length}</span> sonuç bulundu
        </div>
      )}
      <Accordion type="single" collapsible className="w-full space-y-3">
        {filteredFAQs.map(faq => (
          <AccordionItem
            key={faq.id}
            value={`faq-${faq.id}`}
            className="border-2 rounded-xl px-6 py-2 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
          >
            <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
              <div className="flex items-start gap-3 w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900">{faq.question}</span>
                    {faq.category && (
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 whitespace-pre-wrap leading-relaxed pt-2 pb-4">
              <div className="pl-0 border-l-4 border-blue-500 pl-4 bg-blue-50/50 rounded-r-lg p-4">
                {faq.answer}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
