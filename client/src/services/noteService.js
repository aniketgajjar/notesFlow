import { api } from './api.js';

export const noteService = {
  async list(params = {}) {
    const { data } = await api.get('/notes', { params });
    return data.data;
  },
  async get(id) {
    const { data } = await api.get(`/notes/${id}`);
    return data.data.note;
  },
  async create(values) {
    const { data } = await api.post('/notes', values);
    return data.data.note;
  },
  async update(id, values) {
    const { data } = await api.patch(`/notes/${id}`, values);
    return data.data.note;
  },
  async remove(id) {
    await api.delete(`/notes/${id}`);
  },
  async setPinned(id, value) {
    const { data } = await api.patch(`/notes/${id}/pin`, { value });
    return data.data.note;
  },
  async setArchived(id, value) {
    const { data } = await api.patch(`/notes/${id}/archive`, { value });
    return data.data.note;
  },
};
