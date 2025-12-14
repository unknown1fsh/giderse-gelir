'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FileUploadProps {
  ticketId: number
  onUploadSuccess?: () => void
}

interface UploadedFile {
  id: number
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

export default function FileUpload({ ticketId, onUploadSuccess }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]

      if (file.size > maxSize) {
        alert(`${file.name} dosyası çok büyük. Maksimum 10MB olabilir.`)
        return false
      }

      if (!allowedTypes.includes(file.type)) {
        alert(
          `${file.name} dosyası desteklenmiyor. İzin verilen formatlar: JPG, PNG, PDF, DOC, DOCX`
        )
        return false
      }

      return true
    })

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B'
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB'
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      return
    }

    setUploading(true)

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/help/tickets/${ticketId}/attachments`, {
          method: 'POST',
          body: formData,
        })

        const result = (await response.json()) as {
          success: boolean
          data?: { id: number; fileName: string; filePath: string }
          error?: string
        }

        if (result.success && result.data) {
          setUploadedFiles(prev => [...prev, result.data!])
        } else {
          alert(`${file.name} yüklenirken hata oluştu: ${result.error || 'Bilinmeyen hata'}`)
        }
      }

      setFiles([])
      onUploadSuccess?.()
    } catch (error) {
      console.error('Dosya yükleme hatası:', error)
      alert('Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dosya Ekle</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Dosyaları buraya sürükleyin veya tıklayarak seçin
                </p>
                <p className="text-xs text-gray-500">Maksimum 10MB • JPG, PNG, PDF, DOC, DOCX</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Seçilen Dosyalar:</p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    void handleUpload()
                  }}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    'Dosyaları Yükle'
                  )}
                </Button>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Yüklenen Dosyalar:</p>
                {uploadedFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                      </div>
                    </div>
                    <a
                      href={file.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Görüntüle
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
