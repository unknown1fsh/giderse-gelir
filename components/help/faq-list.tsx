'use client'

import { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
}

export default function FAQList({ category }: FAQListProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const url = category
          ? `/api/help/faq?category=${encodeURIComponent(category)}`
          : '/api/help/faq'
        const response = await fetch(url)
        const result = await response.json() as { success: boolean; data?: FAQ[] }

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (faqs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Henüz SSS bulunmamaktadır.
        </CardContent>
      </Card>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {faqs.map(faq => (
        <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border rounded-lg px-4">
          <AccordionTrigger className="text-left font-semibold hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

