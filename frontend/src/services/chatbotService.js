import api from './api';

export const chatbotSearch = (prompt) =>
  api.post('/chatbot/search', { prompt });
