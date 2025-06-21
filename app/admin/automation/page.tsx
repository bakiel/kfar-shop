'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Play, Pause, CheckCircle, XCircle, Clock, Activity } from 'lucide-react'

interface AutomationStatus {
  last_run: string | null
  last_status: string | null
  consecutive_failures: number
  total_runs: number
  successful_runs: number
  failed_runs: number
}

interface AutomationReport {
  summary: {
    total_products: number
    products_analyzed: number
    products_enhanced: number
    vision_api_calls: number
    average_quality_score: number
    processing_time_seconds: number
  }
  vendors: Record<string, {
    products_count: number
    enhanced_count: number
    average_quality: number
  }>
}

export default function AutomationDashboard() {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [report, setReport] = useState<AutomationReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    loadStatus()
    loadReport()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadStatus()
      loadReport()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/automation/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to load automation status:', error)
    }
  }

  const loadReport = async () => {
    try {
      const response = await fetch('/api/automation/report')
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Failed to load automation report:', error)
    }
  }

  const runAutomation = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/automation/run', {
        method: 'POST'
      })
      
      if (response.ok) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        while (reader) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value)
          const lines = text.split('\\n').filter(Boolean)
          setLogs(prev => [...prev, ...lines])
        }
      }
    } catch (error) {
      console.error('Failed to run automation:', error)
    } finally {
      setIsRunning(false)
      loadStatus()
      loadReport()
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Success</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Failed</Badge>
      case 'running':
        return <Badge className="bg-blue-500"><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Running</Badge>
      default:
        return <Badge variant="outline"><Clock className="w-4 h-4 mr-1" /> Never Run</Badge>
    }
  }

  const successRate = status && status.total_runs > 0
    ? (status.successful_runs / status.total_runs) * 100
    : 0

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Automation</h1>
          <p className="text-gray-600">Monitor and control product enhancement automation</p>
        </div>
        <Button
          onClick={runAutomation}
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Now
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Current automation status</CardDescription>
          </CardHeader>
          <CardContent>
            {status && (
              <div className="space-y-3">
                <div>{getStatusBadge(status.last_status)}</div>
                {status.last_run && (
                  <p className="text-sm text-gray-600">
                    Last run: {new Date(status.last_run).toLocaleString()}
                  </p>
                )}
                {status.consecutive_failures > 0 && (
                  <p className="text-sm text-red-600">
                    {status.consecutive_failures} consecutive failures
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
            <CardDescription>Overall automation performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={successRate} className="h-2" />
              <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
              {status && (
                <p className="text-sm text-gray-600">
                  {status.successful_runs} of {status.total_runs} runs
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products Enhanced</CardTitle>
            <CardDescription>Total products processed</CardDescription>
          </CardHeader>
          <CardContent>
            {report && (
              <div className="space-y-3">
                <p className="text-2xl font-bold">
                  {report.summary.products_enhanced} / {report.summary.total_products}
                </p>
                <Progress 
                  value={(report.summary.products_enhanced / report.summary.total_products) * 100} 
                  className="h-2" 
                />
                <p className="text-sm text-gray-600">
                  Avg Quality: {report.summary.average_quality_score.toFixed(1)}/10
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {report && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vendor Breakdown</CardTitle>
            <CardDescription>Product enhancement by vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(report.vendors).map(([vendor, data]) => (
                <div key={vendor} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vendor}</p>
                    <p className="text-sm text-gray-600">
                      {data.enhanced_count} of {data.products_count} products
                    </p>
                  </div>
                  <div className="text-right">
                    <Progress 
                      value={(data.enhanced_count / data.products_count) * 100} 
                      className="w-32 h-2 mb-1" 
                    />
                    <p className="text-sm text-gray-600">
                      Quality: {data.average_quality.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Live Logs</CardTitle>
            <CardDescription>Real-time automation output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}