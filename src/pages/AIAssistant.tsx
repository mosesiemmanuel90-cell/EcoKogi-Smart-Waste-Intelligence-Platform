import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, MessageSquare, Send, LoaderCircle, CornerDownLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

const NL = String.fromCharCode(10);

const mockResponses: Record<string, string> = {};

mockResponses['How do I report waste?'] = [
  'To report waste in Kogi State:',
  '',
  '1. **Use the EcoKogi Citizen App** - Download from the app store, sign up, and tap "Report Waste".',
  '2. **Call the Hotline** - Dial 0800-ECOKOGI (0800-326-5644) to speak with an operator.',
  '3. **Visit Your LGA Office** - Report in person at any Local Government Area waste management office.',
  '4. **SMS Report** - Text "WASTE" followed by your location to 4477.',
  '',
  'All reports are tracked and assigned to the nearest available collection officer.',
].join(NL);

mockResponses['Where is the nearest recycling hub in Lokoja?'] = [
  '**Recycling Hubs in Lokoja:**',
  '',
  '1. **Lokoja Central Recycling Hub** - Opposite the Old Market, along Abuja Road. Accepts plastics, metals, and paper.',
  '2. **Kogi State Recycling Center** - Adjacent to the Waste Management Authority office, Zone 8. Accepts all recyclable materials including e-waste.',
  '3. **Ganaja Junction Collection Point** - Near the Ganaja Roundabout. Accepts plastics and glass.',
  '',
  '**Operating Hours:** Mon-Sat, 7:00 AM - 6:00 PM.',
  '',
  'You can also check the EcoKogi Smart Map for real-time availability and directions.',
].join(NL);

mockResponses['How can I earn EcoScore points?'] = [
  '**Earning EcoScore Points:**',
  '',
  '1. **Report Waste** - +10 points per verified waste report with photo.',
  '2. **Recycle Properly** - +25 points per trip to a recycling hub (scan QR at hub).',
  '3. **Refer Friends** - +15 points for each friend who signs up and reports waste.',
  '4. **Community Clean-ups** - +50 points for participating in organized events.',
  '5. **Timely Reports** - +5 bonus points for reports filed before 10 AM.',
  '',
  '**Redeem points for:** AirTime, Grocery Vouchers, and EcoKogi Merchandise.',
  '',
  'Track your score in the Citizen App under "My EcoScore".',
].join(NL);

mockResponses['What are Kogi State waste collection schedules?'] = [
  '**Kogi State Waste Collection Schedules:**',
  '',
  '- **Monday** - Lokoja Central, Felele (Household Waste)',
  '- **Tuesday** - Kabba, Okene (Recyclables)',
  '- **Wednesday** - Ankpa, Idah (Household Waste)',
  '- **Thursday** - Lokoja East, Ganaja (Organic Waste)',
  '- **Friday** - All LGAs (E-Waste and Hazardous)',
  '- **Saturday** - Major Markets (Bulk Waste)',
  '',
  '**Collection Times:** 6:00 AM - 2:00 PM daily.',
  '',
  'For area-specific schedules, check the EcoKogi Smart Map or contact your LGA waste management office.',
].join(NL);

const defaultResponse = [
  'Thank you for your question about Kogi State waste management.',
  'I am an AI assistant designed to help with environmental inquiries.',
  'For specific details, please contact the EcoKogi Waste Management Authority directly at 0800-ECOKOGI or visit your nearest LGA office.',
  'Is there anything else I can help you with?',
].join(' ');

function getMockResponse(message: string): string {
  if (mockResponses[message]) return mockResponses[message];

  const lower = message.toLowerCase();
  if (lower.includes('report') && lower.includes('waste'))
    return mockResponses['How do I report waste?'];
  if (
    lower.includes('recycl') &&
    (lower.includes('hub') || lower.includes('center') || lower.includes('lokoja'))
  )
    return mockResponses['Where is the nearest recycling hub in Lokoja?'];
  if (lower.includes('ecoscore') || lower.includes('point') || lower.includes('earn'))
    return mockResponses['How can I earn EcoScore points?'];
  if (lower.includes('schedule') || lower.includes('collection') || lower.includes('pickup'))
    return mockResponses['What are Kogi State waste collection schedules?'];

  return defaultResponse;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickSuggestions = [
  'How do I report waste?',
  'Where is the nearest recycling hub in Lokoja?',
  'How can I earn EcoScore points?',
  'What are Kogi State waste collection schedules?',
];

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: [
        'Hello! I am the **EcoKogi AI Assistant**.',
        'I can help you with waste management questions, recycling information, EcoScore rewards, and Kogi State environmental guidelines.',
        'How can I assist you today?',
      ].join(' '),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

    const response = getMockResponse(messageText);
    const assistantMessage: Message = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 md:p-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(52,211,153,0.3) 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              EcoKogi AI Assistant
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                AI
              </span>
            </h1>
            <p className="text-emerald-200/70 mt-1 text-sm">
              Helping citizens and government make smarter environmental decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2">
        {quickSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSend(suggestion)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 active:scale-[0.97] shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {suggestion}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-800 text-emerald-400'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <span className="text-xs font-bold">U</span>
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <p
                      className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}
                    >
                      {msg.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <LoaderCircle className="w-4 h-4 text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-500">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about waste management, recycling, or EcoScore..."
                className="pr-10 py-5 text-sm bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                disabled={isTyping}
              />
              <CornerDownLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            EcoKogi AI Assistant provides general guidance. For urgent reports, please call
            0800-ECOKOGI.
          </p>
        </div>
      </Card>
    </div>
  );
};