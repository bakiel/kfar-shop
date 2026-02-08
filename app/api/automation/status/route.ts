import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const statusPath = path.join(process.cwd(), '..', 'automation-status.json')
    
    try {
      const data = await fs.readFile(statusPath, 'utf-8')
      return NextResponse.json(JSON.parse(data))
    } catch (error) {
      // Return default status if file doesn't exist
      return NextResponse.json({
        last_run: null,
        last_status: null,
        consecutive_failures: 0,
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0
      })
    }
  } catch (error) {
    console.error('Failed to load automation status:', error)
    return NextResponse.json(
      { error: 'Failed to load status' },
      { status: 500 }
    )
  }
}