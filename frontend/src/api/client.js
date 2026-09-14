import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrolink_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agrolink_token');
      localStorage.removeItem('agrolink_user');
    }
    return Promise.reject(error);
  }
);

export function httpGet(url, params) {
  return client.get(url, { params }).then((res) => res.data);
}

export function httpPost(url, body) {
  return client.post(url, body).then((res) => res.data);
}

export function httpPut(url, body) {
  return client.put(url, body).then((res) => res.data);
}

export function httpDelete(url) {
  return client.delete(url).then((res) => res.data);
}

export default client;