'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import { ArrowLeft, Save, Building2, CheckCircle, Calculator, FileText } from 'lucide-react'
import { useToast } from '@/lib/use-toast'

interface InvestmentType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  riskLevel: string
  popularity: number
  features: string[]
  requirements: {
    minAmount: number
    currency: string
    tradingHours: string
  }
}

export default function NewInvestmentPage() {
  const router = useRouter()
  const { error: toastError } = useToast()
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const [formData, setFormData] = useState({
    type: '',
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    riskLevel: 'medium',
  })

  const [selectedType, setSelectedType] = useState<InvestmentType | null>(null)

  useEffect(() => {
    async function fetchInvestmentTypes() {
      try {
        const response = await fetch('/api/investments/types')
        if (response.ok) {
          const data = await response.json()
          setInvestmentTypes(data)
        }
      } catch (error) {
        console.error('Yatırım türleri alınamadı:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestmentTypes()
  }, [])

  useEffect(() => {
    if (formData.type) {
      const type = investmentTypes.find(t => t.id === formData.type)
      setSelectedType(type || null)
    }
  }, [formData.type, investmentTypes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/investments')
      } else {
        const error = await response.json()
        if (error.requiresPremium) {
          setShowPremiumModal(true)
        } else {
          toastError('Hata', error.error || 'Yatırım kaydedilirken bir hata oluştu')
        }
      }
    } catch (error) {
      console.error('Yatırım kaydedilemedi:', error)
      toastError('Hata', 'Yatırım kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const calculateTotalValue = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const currentPrice = parseFloat(formData.currentPrice) || 0
    return quantity * currentPrice
  }

  const calculateProfitLoss = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const purchasePrice = parseFloat(formData.purchasePrice) || 0
    const currentPrice = parseFloat(formData.currentPrice) || 0
    return quantity * (currentPrice - purchasePrice)
  }

  const calculateProfitLossPercentage = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0
    const currentPrice = parseFloat(formData.currentPrice) || 0
    if (purchasePrice === 0) {
      return 0
    }
    return ((currentPrice - purchasePrice) / purchasePrice) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Yatırım türleri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="hover:bg-white/80 w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 Yeni Yatırım Ekle
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Portföyünüze yeni bir yatırım aracı ekleyin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Investment Type Selection */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Yatırım Türü</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={formData.type}
                onValueChange={value => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Yatırım türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        <span>{type.name}</span>
                        <Badge
                          variant={
                            type.riskLevel === 'low'
                              ? 'default'
                              : type.riskLevel === 'medium'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className="text-xs"
                        >
                          {type.riskLevel === 'low'
                            ? 'Düşük'
                            : type.riskLevel === 'medium'
                              ? 'Orta'
                              : 'Yüksek'}{' '}
                          Risk
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedType && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-r ${selectedType.color} text-white`}
                  >
                    <h3 className="font-bold text-lg mb-2">{selectedType.name}</h3>
                    <p className="text-sm opacity-90">{selectedType.description}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Özellikler:</h4>
                    {selectedType.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min. Tutar:</span>
                      <span className="font-semibold">
                        ₺{selectedType.requirements.minAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Para Birimi:</span>
                      <span className="font-semibold">{selectedType.requirements.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İşlem Saatleri:</span>
                      <span className="font-semibold">
                        {selectedType.requirements.tradingHours}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investment Form */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Yatırım Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Yatırım Adı *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Örn: Apple Inc."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="symbol">Sembol *</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))
                      }
                      placeholder="Örn: AAPL"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Miktar *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.000001"
                      value={formData.quantity}
                      onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchasePrice">Alış Fiyatı *</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))
                      }
                      placeholder="150.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentPrice">Güncel Fiyat *</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, currentPrice: e.target.value }))
                      }
                      placeholder="175.50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchaseDate">Alış Tarihi *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Örn: Teknoloji"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Yatırım hakkında notlar..."
                    rows={3}
                  />
                </div>

                {/* Calculation Summary */}
                {formData.quantity && formData.purchasePrice && formData.currentPrice && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center">
                        <Calculator className="h-5 w-5 mr-2 text-green-600" />
                        Hesaplama Özeti
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-800">
                            ₺
                            {calculateTotalValue().toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-sm text-gray-600">Toplam Değer</div>
                        </div>

                        <div
                          className={`text-center p-4 bg-white/50 rounded-lg ${calculateProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          <div className="text-2xl font-bold">
                            ₺
                            {Math.abs(calculateProfitLoss()).toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-sm">Kar/Zarar</div>
                        </div>

                        <div
                          className={`text-center p-4 bg-white/50 rounded-lg ${calculateProfitLossPercentage() >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          <div className="text-2xl font-bold">
                            {calculateProfitLossPercentage() >= 0 ? '+' : ''}
                            {calculateProfitLossPercentage().toFixed(1)}%
                          </div>
                          <div className="text-sm">Getiri Oranı</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="px-6"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Yatırım Ekle
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Premium Upgrade Modal */}
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          featureName="Yatırım Yönetimi"
          limitInfo={{
            current: 0,
            limit: 5,
            type: 'analysis',
          }}
        />
      </div>
    </div>
  )
}
