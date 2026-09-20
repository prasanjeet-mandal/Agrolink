import axios from 'axios';

function sanitizeBaseUrl(value) {
  if (!value) return '';
  const v = String(value).trim();
  if (v.startsWith('//') || /^https?:\/\//i.test(v)) return v;
  return '';
}

const client = axios.create({
  baseURL: sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
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
    const data = error.response?.data;
    if (data && typeof data === 'object' && data.message) {
      error.message = data.message;
    } else if (error.response?.status) {
      const status = error.response.status;
      const labels = { 400: 'Invalid request', 401: 'Please sign in again', 403: 'You do not have permission', 404: 'Not found', 500: 'Server error' };
      error.message = labels[status] ?? `Request failed (${status})`;
    }
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