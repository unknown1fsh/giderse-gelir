'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

export default function AdminReports() {
  const { error: toastError } = useToast()

  const handleExportReport = (reportType: string) => {
    void (async () => {
      try {
        // Bu endpoint'leri oluşturabiliriz
        const response = await fetch(`/api/admin/reports/${reportType}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Rapor oluşturulamadı')
        }

        const blob = await response.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
      } catch (err) {
        console.error('Report export error:', err)
        toastError('Hata', 'Rapor oluşturulurken hata oluştu')
      }
    })()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Kullanıcı Büyüme Raporu
            </CardTitle>
            <CardDescription>Kullanıcı kayıt trendi ve büyüme analizi</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExportReport('user-growth')}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gelir/Gider Analizi
            </CardTitle>
            <CardDescription>İşlem bazlı gelir ve gider analizi</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExportReport('income-expense')}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kullanıcı Aktivite Raporu
            </CardTitle>
            <CardDescription>Kullanıcı aktivite ve kullanım istatistikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExportReport('user-activity')}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Raporu İndir
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
