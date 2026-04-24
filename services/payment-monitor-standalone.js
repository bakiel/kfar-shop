/**
 * Standalone Payment Monitor Service
 * Runs the payment monitoring service as a separate process
 */

require('dotenv').config();
const { paymentMonitor } = require('./payment-monitor');
const express = require('express');

const app = express();
const PORT = process.env.MONITOR_PORT || 9090;

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const stats = await paymentMonitor.getStats();
    res.json({
      status: 'healthy',
      ...stats,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Stats endpoint
app.get('/stats', async (req, res) => {
  try {
    const stats = await paymentMonitor.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual trigger endpoint (for testing)
app.post('/check-now', async (req, res) => {
  try {
    await paymentMonitor.checkPendingPayments();
    res.json({ message: 'Payment check triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  paymentMonitor.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  paymentMonitor.stop();
  process.exit(0);
});

// Start the monitoring service
console.log(`
🏦 KFAR Payment Monitoring Service
==================================
Environment: ${process.env.NODE_ENV || 'development'}
Check Interval: 60 seconds
Health Check: http://localhost:${PORT}/health
Statistics: http://localhost:${PORT}/stats
`);

// Start the payment monitor
paymentMonitor.start();

// Start the HTTP server for health checks
app.listen(PORT, () => {
  console.log(`✅ Health check server listening on port ${PORT}`);
});

// Log stats every 5 minutes
setInterval(async () => {
  try {
    const stats = await paymentMonitor.getStats();
    console.log('\n📊 Payment Monitor Statistics:');
    console.log(`   Pending Payments: ${stats.pendingPayments}`);
    console.log(`   Processing Orders: ${stats.processingOrders}`);
    console.log(`   Cancelled Orders: ${stats.cancelledOrders}`);
    console.log(`   Pending Payouts: ₪${stats.pendingPayouts.toFixed(2)}`);
    console.log(`   Uptime: ${Math.floor(process.uptime() / 60)} minutes\n`);
  } catch (error) {
    console.error('Error getting stats:', error);
  }
}, 5 * 60 * 1000); // Every 5 minutes