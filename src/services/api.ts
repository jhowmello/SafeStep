import axios from 'axios';

// Substitua pelo IP da sua máquina ao rodar o JSON Server
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


