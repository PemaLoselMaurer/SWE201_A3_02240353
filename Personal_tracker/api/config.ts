import axios from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token for every request
apiClient.interceptors.request.use((config) => {
  // Token injection happens here if needed
  return config;
});

export default apiClient;
