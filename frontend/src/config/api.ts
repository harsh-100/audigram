export const API_URL = 'https://audioshorts.fun';

// Create axios instance with default config
import axios from 'axios';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
}); 