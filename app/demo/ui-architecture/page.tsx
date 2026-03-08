'use client'

import * as React from 'react'
import {
    PageHeader,
    FilterBar,
    SearchBox,
    SectionWrapper,
    DataTable,
    StatCard,
    Button,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/mosaic'
import { Plus, Download, Users, DollarSign, Activity, FileText } from 'lucide-react'

// Demo data list
const demoUsers = [
    { id: 1, name: 'Ahmet Yılmaz', role: 'Admin', status: 'active', lastLogin: '2024-03-01' },
    { id: 2, name: 'Ayşe Demir', role: 'Editor', status: 'inactive', lastLogin: '2024-02-15' },
    { id: 3, name: 'Mehmet Kaya', role: 'User', status: 'active', lastLogin: '2024-03-05' },
    { id: 4, name: 'Fatma Şahin', role: 'User', status: 'warning', lastLogin: '2024-01-20' },
]

export default function UIArchitectureDemoPage() {
    const [searchTerm, setSearchTerm] = React.useState('')

    // Define table columns
    const columns = [
        {
            header: 'Kullanıcı Adı',
            accessorKey: 'name' as keyof typeof demoUsers[0],
            className: 'font-medium',
        },
        {
            header: 'Rol',
            accessorKey: 'role' as keyof typeof demoUsers[0],
        },
        {
            header: 'Durum',
            cell: (user: typeof demoUsers[0]) => {
                const variantMap: Record<string, "success" | "destructive" | "warning"> = {
                    active: 'success',
                    inactive: 'destructive',
                    warning: 'warning'
                }
                const labelMap: Record<string, string> = {
                    active: 'Aktif',
                    inactive: 'Pasif',
                    warning: 'İnceleniyor'
                }
                return <Badge variant={variantMap[user.status]}>{labelMap[user.status]}</Badge>
            },
        },
        {
            header: 'Son Giriş',
            accessorKey: 'lastLogin' as keyof typeof demoUsers[0],
            className: 'text-right',
        },
    ]

    const filteredData = demoUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 max-w-[1400px] mx-auto">

            {/* 1. Page Header */}
            <PageHeader
                title="Merkezi UI Mimarisi Önizlemesi"
                description="design-system kurallarına ve kanonik components/mosaic kütüphanesine göre hazırlanmış demo sayfası."
                actions={
                    <>
                        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Dışa Aktar</Button>
                        <Button variant="premium"><Plus className="w-4 h-4 mr-2" /> Yeni Kayıt</Button>
                    </>
                }
            />

            {/* 2. Stat Cards Section */}
            <SectionWrapper>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Toplam Gelir"
                        value="₺124,500"
                        icon={<DollarSign className="h-4 w-4" />}
                        trend={{ value: 12, label: 'geçen aya göre', isPositive: true }}
                        variant="glass"
                    />
                    <StatCard
                        title="Aktif Aboneler"
                        value="+2350"
                        icon={<Users className="h-4 w-4" />}
                        trend={{ value: 4, label: 'geçen aya göre', isPositive: true }}
                        variant="glass"
                    />
                    <StatCard
                        title="Bekleyen Faturalar"
                        value="14"
                        icon={<FileText className="h-4 w-4 text-amber-500" />}
                        trend={{ value: 2, label: 'geçen haftaya göre', isPositive: false }}
                        variant="glass"
                    />
                    <StatCard
                        title="Sistem Durumu"
                        value="%99.9"
                        icon={<Activity className="h-4 w-4 text-green-500" />}
                        description="Tüm servisler aktif"
                        variant="glass"
                    />
                </div>
            </SectionWrapper>

            {/* 3. Tabs Navigation */}
            <SectionWrapper>
                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="users">Kullanıcı Yönetimi</TabsTrigger>
                        <TabsTrigger value="settings">Gelişmiş Ayarlar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        {/* 4. Filter Bar */}
                        <FilterBar>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
                                <SearchBox
                                    placeholder="Kullanıcı ara..."
                                    onSearch={setSearchTerm}
                                />
                                <div className="w-full sm:w-[200px]">
                                    <Select defaultValue="all">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Rol Seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tüm Roller</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </FilterBar>

                        {/* 5. Data Table */}
                        <SectionWrapper>
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                keyExtractor={(item) => item.id}
                                emptyMessage="Sonuç bulunamadı"
                                emptyDescription="Arama kriterlerinize uygun kayıt eşleşmedi."
                            />
                        </SectionWrapper>
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl border-border">
                            Diğer tab içeriği buraya gelecek...
                        </div>
                    </TabsContent>
                </Tabs>
            </SectionWrapper>

        </div>
    )
}
