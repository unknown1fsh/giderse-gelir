import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { testFetch, logTestResult, logTestSuiteStart, logTestSuiteEnd } from '../helpers/test-utils'

const BASE_URL = 'http://localhost:3000/api'

describe('Health Check API Endpoint', () => {
  beforeAll(() => {
    logTestSuiteStart('Health Check API Endpoint')
  })

  afterAll(() => {
    logTestSuiteEnd('Health Check API Endpoint')
  })

  describe('GET /api/health', () => {
    it('sağlık kontrolü başarılı olmalı', async () => {
      const startTime = Date.now()
      const response = await testFetch(`${BASE_URL}/health`)
      const duration = Date.now() - startTime

      logTestResult(
        'sağlık kontrolü başarılı olmalı',
        '/health',
        'GET',
        response.status,
        duration,
        response.status === 200
      )
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('status')
    })
  })
})
