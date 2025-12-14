import { PrismaClient } from '@prisma/client'
import { SystemParameterRepository } from '../../repositories/SystemParameterRepository'
import { SystemParameterMapper } from '../../mappers/SystemParameterMapper'
import { SystemParameterDTO, SystemParameterGroupDTO } from '../../dto/SystemParameterDTO'
import { NotFoundError } from '../../errors'

// Bu service sistem parametrelerinin iş mantığını yönetir
export class SystemParameterService {
  private repository: SystemParameterRepository

  constructor(prisma: PrismaClient) {
    this.repository = new SystemParameterRepository(prisma)
  }

  // Tüm parametreleri getir
  // Girdi: onlyActive (boolean)
  // Çıktı: SystemParameterDTO[]
  async getAll(onlyActive: boolean = true): Promise<SystemParameterDTO[]> {
    const parameters = await this.repository.findMany(onlyActive ? { isActive: true } : undefined)
    return SystemParameterMapper.toDTOArray(parameters)
  }

  // Belirli bir grup için parametreleri getir
  // Girdi: paramGroup (string), onlyActive (boolean)
  // Çıktı: SystemParameterDTO[]
  async getByGroup(paramGroup: string, onlyActive: boolean = true): Promise<SystemParameterDTO[]> {
    const parameters = await this.repository.findByGroup(paramGroup, onlyActive)
    return SystemParameterMapper.toDTOArray(parameters)
  }

  // Belirli bir parametreyi kod ile getir
  // Girdi: paramGroup (string), paramCode (string)
  // Çıktı: SystemParameterDTO
  // Hata: NotFoundError
  async getByCode(paramGroup: string, paramCode: string): Promise<SystemParameterDTO> {
    const parameter = await this.repository.findByCode(paramGroup, paramCode)

    if (!parameter) {
      throw new NotFoundError(`Parametre bulunamadı: ${paramGroup}.${paramCode}`)
    }

    return SystemParameterMapper.toDTO(parameter)
  }

  // Tüm grupları listele
  // Girdi: onlyActive (boolean)
  // Çıktı: string[]
  async getAllGroups(onlyActive: boolean = true): Promise<string[]> {
    return this.repository.findAllGroups(onlyActive)
  }

  // Gruplu parametreleri getir (her grup için ayrı liste)
  // Girdi: onlyActive (boolean)
  // Çıktı: SystemParameterGroupDTO[]
  async getGroupedParameters(onlyActive: boolean = true): Promise<SystemParameterGroupDTO[]> {
    const grouped = SystemParameterMapper.groupByParamGroup(
      await this.repository.findMany(onlyActive ? { isActive: true } : {})
    )

    const result: SystemParameterGroupDTO[] = []

    // Grup adları için mapping
    const groupNames: Record<string, string> = {
      BANK: 'Bankalar',
      ACCOUNT_TYPE: 'Hesap Türleri',
      TX_TYPE: 'İşlem Türleri',
      TX_CATEGORY: 'İşlem Kategorileri',
      PAYMENT_METHOD: 'Ödeme Yöntemleri',
      CURRENCY: 'Para Birimleri',
      GOLD_TYPE: 'Altın Türleri',
      GOLD_PURITY: 'Altın Ayarları',
      INVESTMENT_TYPE: 'Yatırım Türleri',
      SYSTEM_CONFIG: 'Sistem Ayarları',
    }

    grouped.forEach((parameters, group) => {
      result.push(
        new SystemParameterGroupDTO({
          group,
          groupName: groupNames[group] || group,
          parameters,
          count: parameters.length,
        })
      )
    })

    // Alfabetik sırala
    return result.sort((a, b) => a.groupName.localeCompare(b.groupName, 'tr'))
  }

  // Parametre değerini getir (sadece value)
  // Girdi: paramGroup (string), paramCode (string), defaultValue (string)
  // Çıktı: string
  async getValue(
    paramGroup: string,
    paramCode: string,
    defaultValue: string = ''
  ): Promise<string> {
    try {
      const parameter = await this.getByCode(paramGroup, paramCode)
      return parameter.paramValue
    } catch {
      return defaultValue
    }
  }

  // Parametre metadata'sını getir
  // Girdi: paramGroup (string), paramCode (string)
  // Çıktı: Record<string, any>
  async getMetadata(
    paramGroup: string,
    paramCode: string
  ): Promise<Record<string, any> | undefined> {
    try {
      const parameter = await this.getByCode(paramGroup, paramCode)
      return parameter.metadata
    } catch {
      return undefined
    }
  }

  // Parametre aktif mi kontrol et
  // Girdi: paramGroup (string), paramCode (string)
  // Çıktı: boolean
  async isActive(paramGroup: string, paramCode: string): Promise<boolean> {
    try {
      const parameter = await this.getByCode(paramGroup, paramCode)
      return parameter.isActive
    } catch {
      return false
    }
  }
}
