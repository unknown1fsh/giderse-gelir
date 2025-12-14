import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemParameterService } from '@/server/services/impl/SystemParameterService'
import { ExceptionMapper } from '@/server/errors'

// Bu endpoint belirli bir parametreyi getirir
// GET /api/parameters/BANK/ZIRAAT -> Ziraat Bankası parametresini getirir
export const GET = ExceptionMapper.asyncHandler(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ group: string; code: string }> }
  ) => {
    const { group, code } = await params
    const parameterService = new SystemParameterService(prisma)
    const parameter = await parameterService.getByCode(group, code)

    return NextResponse.json({
      success: true,
      data: parameter,
    })
  }
)
