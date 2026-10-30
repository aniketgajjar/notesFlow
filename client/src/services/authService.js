import { api } from './api.js';

export const authService = {
  async register(values) {
    const { data } = await api.post('/auth/register', { name: values.name, email: values.email, password: values.password });
    return data.data.user;
  },
  async login(values) {
    const { data } = await api.post('/auth/login', values);
    return data.data.user;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },
  async logout() {
    await api.post('/auth/logout');
  },
};
