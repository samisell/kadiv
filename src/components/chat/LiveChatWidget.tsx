'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/lib/currency';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Welcome to KADIV Events! 👋 I'm your virtual event assistant. How can I help you today?",
    sender: 'bot',
    timestamp: new Date(),
  },
];

const QUICK_REPLIES = [
  'I want to book an event',
  'What services do you offer?',
  'How much does a wedding cost?',
  'I need a cost estimate',
];

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { format } = useCurrency();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponses: Record<string, string> = {
        'book': 'I\'d love to help you book an event! 🎉 You can use our booking page for a seamless experience, or I can guide you through the process right here. What type of event are you planning?',
        'services': 'We offer a full range of premium services: Event Venues, Decoration, Food & Catering, Pastry & Cakes, Media Coverage, Music & DJ, Photography & Videography, and Security. Would you like details on any specific service?',
        'cost': `The cost depends on the event type, number of guests, and selected services. Our wedding packages start at ${format(7_500_000)}, corporate events from ${format(4_500_000)}, and private parties from ${format(3_000_000)}. Try our Cost Calculator for a personalized estimate! 💰`,
        'estimate': 'Great choice! 📊 Head over to our Cost Calculator page where you can customize every aspect of your event and get an instant estimate. It\'s free and takes just a few minutes!',
        'hello': 'Hello! Welcome to KADIV Events! How can I assist you today? Feel free to ask about our services, pricing, or anything else! 😊',
        'hi': 'Hi there! 👋 Welcome to KADIV! How can I help you plan your perfect event?',
        'wedding': `Weddings are our specialty! 💍 We handle everything from venue selection to catering, decoration, and entertainment. Our packages start at ${format(7_500_000)}. Would you like to know more about our wedding services?`,
      };

      const lowerText = messageText.toLowerCase();
      let response = "Thank you for your interest in KADIV Events! 🌟 For detailed inquiries, I recommend visiting our Services page or using the Cost Calculator. You can also contact us directly at info@kadiv.com. Is there anything specific I can help with?";

      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-charcoal-dark shadow-lg shadow-gold/20 hover:bg-gold-light transition-colors flex items-center justify-center animate-pulse-gold"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] glass rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-cream">KADIV Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-cream/40">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-gold/20' : 'bg-charcoal-light'
                  }`}>
                    {msg.sender === 'user' ? (
                      <User className="w-3.5 h-3.5 text-gold" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-cream/60" />
                    )}
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gold/20 text-cream rounded-br-md'
                      : 'bg-charcoal-light text-cream/80 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-charcoal-light flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-cream/60" />
                  </div>
                  <div className="bg-charcoal-light px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-cream/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-cream/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-cream/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="px-3 py-1.5 text-xs rounded-full border border-gold/20 text-gold/70 hover:bg-gold/10 hover:text-gold transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gold/10">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-white/5 border-gold/15 text-cream text-sm placeholder:text-cream/25 h-10 focus:border-gold/40"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="bg-gold text-charcoal-dark hover:bg-gold-light h-10 w-10 shrink-0 disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
