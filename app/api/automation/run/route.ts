import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      const scriptPath = path.join(process.cwd(), '..', 'run-complete-marketplace-automation.py')
      const pythonProcess = spawn('python3', [scriptPath])
      
      pythonProcess.stdout.on('data', (data) => {
        controller.enqueue(encoder.encode(data.toString()))
      })
      
      pythonProcess.stderr.on('data', (data) => {
        controller.enqueue(encoder.encode(`ERROR: ${data.toString()}`))
      })
      
      pythonProcess.on('close', (code) => {
        controller.enqueue(encoder.encode(`\nProcess exited with code ${code}`))
        controller.close()
      })
      
      pythonProcess.on('error', (error) => {
        controller.enqueue(encoder.encode(`\nProcess error: ${error.message}`))
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    }
  })
}