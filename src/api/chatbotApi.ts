import axiosInstance from './axiosClient'

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export const chatbotApi = {
  chat: (message: string, history: ChatMessage[] = []) => {
    return axiosInstance.post('/ai/chat', { message, history })
  }
}
