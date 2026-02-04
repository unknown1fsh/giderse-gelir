import { BaseError } from './BaseError'

// Bu sınıf 400 Bad Request hatasını temsil eder.
export class BadRequestError extends BaseError {
  constructor(message = 'Geçersiz istek') {
    super(message, 400, 'BAD_REQUEST')
  }
}

// Bu sınıf 401 Unauthorized hatasını temsil eder.
export class UnauthorizedError extends BaseError {
  constructor(message = 'Yetkilendirme başarısız') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// Bu sınıf 403 Forbidden hatasını temsil eder.
export class ForbiddenError extends BaseError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 403, 'FORBIDDEN')
  }
}

// Bu sınıf 404 Not Found hatasını temsil eder.
export class NotFoundError extends BaseError {
  constructor(message = 'Kayıt bulunamadı') {
    super(message, 404, 'NOT_FOUND')
  }
}

// Bu sınıf 409 Conflict hatasını temsil eder.
export class ConflictError extends BaseError {
  constructor(message = 'Veri çakışması') {
    super(message, 409, 'CONFLICT')
  }
}

// Bu sınıf 422 Unprocessable Entity hatasını temsil eder.
export class ValidationError extends BaseError {
  constructor(
    message = 'Validasyon hatası',
    public details?: unknown
  ) {
    super(message, 422, 'VALIDATION_ERROR')
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      details: this.details,
    }
  }
}

// Bu sınıf 429 Too Many Requests hatasını temsil eder.
export class TooManyRequestsError extends BaseError {
  constructor(message = 'Çok fazla istek gönderildi. Lütfen bekleyip tekrar deneyin.') {
    super(message, 429, 'TOO_MANY_REQUESTS')
  }
}

// Bu sınıf 500 Internal Server Error hatasını temsil eder.
export class InternalServerError extends BaseError {
  constructor(message = 'Sunucu hatası') {
    super(message, 500, 'INTERNAL_SERVER_ERROR')
  }
}

// Bu sınıf 503 Service Unavailable hatasını temsil eder.
export class ServiceUnavailableError extends BaseError {
  constructor(message = 'Servis geçici olarak kullanılamıyor') {
    super(message, 503, 'SERVICE_UNAVAILABLE')
  }
}

/** AI rapor yoğunluk/timeout hatası - rapor hakkı korunmalı */
export class AIReportCapacityError extends ServiceUnavailableError {
  constructor(
    message = 'Yoğun ilginize teşekkürler. Şu anda yoğunluktan dolayı rapor oluşturulamıyor, lütfen daha sonra yeniden deneyiniz.'
  ) {
    super(message)
  }
}
