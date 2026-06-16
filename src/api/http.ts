import axios from 'axios';
import { toast } from 'sonner';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json;charset=UTF-8',
  },
});

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/api/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers['Authorization'] = `Bearer ${token}`;
            resolve(http(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await http.post<{ accessToken: string }>('/api/auth/refresh');
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return http(original);
      } catch {
        setAccessToken(null);
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('riskType');
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const syncHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json;charset=UTF-8',
  },
});

syncHttp.interceptors.request.use((config) => {
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  return config;
});

syncHttp.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/api/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers['Authorization'] = `Bearer ${token}`;
            resolve(syncHttp(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await http.post<{ accessToken: string }>('/api/auth/refresh');
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return syncHttp(original);
      } catch {
        setAccessToken(null);
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('riskType');
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
