'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FAQList from '@/components/help/faq-list'
import { MessageSquare, BookOpen, Plus } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Yardım Merkezi</h1>
        <p className="text-gray-600 mt-2">
          Sıkça sorulan sorulara göz atın veya bizimle iletişime geçin
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">SSS</CardTitle>
            </div>
            <CardDescription>Sıkça sorulan sorular ve cevapları</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="#faq">
              <Button variant="outline" className="w-full">
                SSS&apos;leri Görüntüle
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Destek Taleplerim</CardTitle>
            </div>
            <CardDescription>Oluşturduğunuz destek taleplerini görüntüleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/help/tickets">
              <Button variant="outline" className="w-full">
                Taleplerimi Görüntüle
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Yeni Talep</CardTitle>
            </div>
            <CardDescription>Yeni bir destek talebi oluşturun</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/help/tickets/new">
              <Button className="w-full">Yeni Talep Oluştur</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div id="faq" className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sıkça Sorulan Sorular</h2>
          <p className="text-gray-600 mt-1">
            Aradığınız cevabı bulamadınız mı? Destek talebi oluşturabilirsiniz.
          </p>
        </div>
        <FAQList />
      </div>
    </div>
  )
}

