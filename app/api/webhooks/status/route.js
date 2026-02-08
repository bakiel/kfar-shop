// Add this to your DigitalOcean app routes
// File: /api/webhooks/status.js or add to your existing webhook handler

export default async function handler(req, res) {
  console.log('📊 WhatsApp Status Update Received');
  console.log('─'.repeat(50));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Log the status update
    const {
      MessageSid,
      MessageStatus,
      To,
      From,
      ErrorCode,
      ErrorMessage
    } = req.body;
    
    console.log('Message SID:', MessageSid);
    console.log('Status:', MessageStatus);
    console.log('To:', To);
    console.log('From:', From);
    
    // Status progression: queued -> sent -> delivered -> read
    // One tick = sent
    // Two ticks = delivered
    // Two blue ticks = read
    
    const statusEmoji = {
      'queued': '⏳',
      'sent': '✓',
      'delivered': '✓✓',
      'read': '✓✓ (blue)',
      'failed': '❌',
      'undelivered': '⚠️'
    };
    
    console.log('Status Icon:', statusEmoji[MessageStatus] || MessageStatus);
    
    if (ErrorCode) {
      console.log('Error Code:', ErrorCode);
      console.log('Error Message:', ErrorMessage);
    }
    
    // Here you could update your database with delivery status
    // For now, we just acknowledge receipt
    
    res.status(200).send('Status received');
    
  } catch (error) {
    console.error('Error processing status update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// If using Express.js instead of Next.js, use this format:
/*
app.post('/api/webhooks/status', (req, res) => {
  console.log('📊 WhatsApp Status Update Received');
  console.log('─'.repeat(50));
  
  const {
    MessageSid,
    MessageStatus,
    To,
    From,
    ErrorCode,
    ErrorMessage
  } = req.body;
  
  console.log('Message SID:', MessageSid);
  console.log('Status:', MessageStatus);
  console.log('To:', To);
  console.log('From:', From);
  
  if (ErrorCode) {
    console.log('Error Code:', ErrorCode);
    console.log('Error Message:', ErrorMessage);
  }
  
  res.status(200).send('Status received');
});
*/