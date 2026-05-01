import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatbotApi, type ChatMessage } from '../../api/chatbotApi'
import { Icon } from './Icon'
import styles from './ChatbotBubble.module.css'

export const ChatbotBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Xin chào! Tôi là trợ lý ảo Faken. Tôi có thể giúp gì cho bạn?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-5)
      const res = await chatbotApi.chat(input, history)
      if (res.data?.success) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: 'Lỗi kết nối. Vui lòng thử lại!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.bubbleContainer}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={styles.chatWindow}
          >
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.botAvatar}>
                  <Icon.MessageCircle size={18} />
                </div>
                <div>
                  <h3 className={styles.botName}>Faken AI Assistant</h3>
                  <span className={styles.botStatus}>Online</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <Icon.ChevronDown size={20} />
              </button>
            </div>
            
            <div className={styles.messages}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.botMessage}`}>
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className={styles.botMessage} style={{ opacity: 0.6 }}>
                  <span className={styles.typingDot}>.</span>
                  <span className={styles.typingDot}>.</span>
                  <span className={styles.typingDot}>.</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSend}>
              <input 
                className={styles.input} 
                placeholder="Type a message..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button className={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
                <Icon.Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnActive : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <Icon.ChevronDown size={24} /> : <Icon.MessageCircle size={28} />}
      </button>
    </div>
  )
}
