import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const reportPath = path.join(process.cwd(), '..', 'marketplace-automation-report.json')
    
    try {
      const data = await fs.readFile(reportPath, 'utf-8')
      return NextResponse.json(JSON.parse(data))
    } catch (error) {
      // Return empty report if file doesn't exist
      return NextResponse.json({
        summary: {
          total_products: 0,
          products_analyzed: 0,
          products_enhanced: 0,
          vision_api_calls: 0,
          average_quality_score: 0,
          processing_time_seconds: 0
        },
        vendors: {}
      })
    }
  } catch (error) {
    console.error('Failed to load automation report:', error)
    return NextResponse.json(
      { error: 'Failed to load report' },
      { status: 500 }
    )
  }
}