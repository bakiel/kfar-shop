'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, MoreVertical, Send } from 'lucide-react';
import { MARKETPLACE_AGENTS, AGENT_RESPONSES, AGENT_QUICK_ACTIONS, AgentActionHandler } from '@/lib/agents/marketplace-agents';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
}

interface AgentChatProps {
  defaultAgent?: string;
  language?: 'en' | 'he';
  onClose?: () => void;
}

export default function AgentChat({ defaultAgent = 'customer-service', language = 'en', onClose }: AgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(defaultAgent);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentAgent = MARKETPLACE_AGENTS.find(a => a.id === selectedAgent);
  
  useEffect(() => {
    // Initial greeting when agent changes
    if (currentAgent) {
      const greeting = AGENT_RESPONSES[selectedAgent as keyof typeof AGENT_RESPONSES]?.greeting;
      if (greeting) {
        addAgentMessage(greeting[language]);
      }
    }
  }, [selectedAgent]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const addAgentMessage = (content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      type: 'agent',
      content,
      timestamp: new Date(),
      agentId: selectedAgent
    };
    setMessages(prev => [...prev, message]);
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Process message based on agent type
    setTimeout(async () => {
      let response = '';
      
      // Simple keyword-based responses
      const lowerMessage = inputValue.toLowerCase();
      
      if (selectedAgent === 'vendor-support') {
        if (lowerMessage.includes('invoice')) {
          response = "I can help you generate invoices! Click the 'Generate Invoice' button below or visit your POS system.";
        } else if (lowerMessage.includes('product')) {
          response = "To add or edit products, visit your vendor dashboard. Need help with specific product features?";
        } else if (lowerMessage.includes('order')) {
          response = "You can manage all orders from your vendor dashboard. New orders appear with WhatsApp notifications.";
        } else {
          response = "I'm here to help with your vendor needs. Try asking about invoices, products, or orders!";
        }
      } else if (selectedAgent === 'customer-service') {
        if (lowerMessage.includes('order')) {
          response = "Please provide your order number and I'll check the status for you. You can also scan your order QR code.";
        } else if (lowerMessage.includes('delivery')) {
          response = "Most orders are delivered within 1-2 days for local Dimona delivery. Pickup is available same day!";
        } else if (lowerMessage.includes('pay')) {
          response = "We accept Braysheet tokens, credit cards, and bank transfers. Having trouble with payment?";
        } else {
          response = "I'm here to help! You can ask about orders, delivery, payments, or products.";
        }
      } else if (selectedAgent === 'order-tracker') {
        if (lowerMessage.match(/kfar-\d+/i)) {
          response = `Tracking order ${inputValue.match(/kfar-\d+/i)?.[0]}... Your order is confirmed and being prepared by the vendor.`;
        } else {
          response = "Please enter your order number (format: KFAR-xxxxx) or scan your order QR code to track.";
        }
      } else if (selectedAgent === 'product-advisor') {
        if (lowerMessage.includes('vegan')) {
          response = "All our VOP certified products are vegan! Browse our selection of fresh produce, baked goods, and prepared meals.";
        } else if (lowerMessage.includes('kosher')) {
          response = "We have many kosher certified products. Look for the kosher symbol on product listings.";
        } else {
          response = "Tell me what you're looking for - dietary preferences, budget, or specific categories - and I'll help you find it!";
        }
      }
      
      addAgentMessage(response);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleQuickAction = async (action: string) => {
    let result: any;
    
    switch (selectedAgent) {
      case 'vendor-support':
        result = await AgentActionHandler.processVendorSupport(action, {});
        break;
      case 'customer-service':
        result = await AgentActionHandler.processCustomerService(action, {});
        break;
      default:
        result = { action: 'message', content: 'Processing your request...' };
    }
    
    if (result.action === 'redirect' && result.url) {
      window.location.href = result.url;
    } else if (result.action === 'message' && result.content) {
      addAgentMessage(typeof result.content === 'string' ? result.content : result.content[language]);
    }
  };
  
  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-leaf-green to-sun-gold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[1.5] text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 stroke-[1.5] text-white" />
        )}
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-leaf-green to-sun-gold p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {currentAgent && (
                  <>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <currentAgent.icon className="w-5 h-5 stroke-[1.5] text-leaf-green" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {language === 'he' ? currentAgent.nameHe : currentAgent.name}
                      </h3>
                      <p className="text-white/80 text-xs">Online</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="text-white hover:text-white/80"
              >
                <MoreVertical className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>
          
          {/* Agent Selector */}
          {showAgentSelector && (
            <div className="bg-gray-50 p-3 border-b max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-600 mb-2">Switch Agent:</p>
              <div className="grid grid-cols-2 gap-2">
                {MARKETPLACE_AGENTS.filter(a => a.isActive).map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent.id);
                      setShowAgentSelector(false);
                      setMessages([]);
                    }}
                    className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                      selectedAgent === agent.id 
                        ? 'bg-leaf-green text-white' 
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <agent.icon className="w-4 h-4 stroke-[1.5]" />
                    <span className="truncate">{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-leaf-green text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Actions */}
          {AGENT_QUICK_ACTIONS[selectedAgent as keyof typeof AGENT_QUICK_ACTIONS] && (
            <div className="p-3 border-t bg-gray-50">
              <div className="flex gap-2 overflow-x-auto">
                {AGENT_QUICK_ACTIONS[selectedAgent as keyof typeof AGENT_QUICK_ACTIONS].map(action => (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-100 whitespace-nowrap"
                  >
                    <action.icon className="w-4 h-4 stroke-[1.5] text-leaf-green" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={language === 'he' ? 'הקלד הודעה...' : 'Type a message...'}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-leaf-green"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-leaf-green text-white rounded-full hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
