import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

export const reservationsService = {
  async getAll() {
    const res = await axios.get(`${API_URL}/reservations`, { withCredentials: true });
    return res.data;
  },
  async getByUser(userId) {
    const res = await axios.get(`${API_URL}/reservations/user/${userId}`, { withCredentials: true });
    return res.data;
  },
  async getByProperty(propertyId) {
    const res = await axios.get(`${API_URL}/reservations/property/${propertyId}`, { withCredentials: true });
    return res.data;
  },
  async getById(id) {
    const res = await axios.get(`${API_URL}/reservations/${id}`, { withCredentials: true });
    return res.data;
  },
  async create(data) {
    const res = await axios.post(`${API_URL}/reservations`, data, { withCredentials: true });
    return res.data;
  },
  async update(id, data) {
    const res = await axios.patch(`${API_URL}/reservations/${id}`, data, { withCredentials: true });
    return res.data;
  },
  async remove(id) {
    const res = await axios.delete(`${API_URL}/reservations/${id}`, { withCredentials: true });
    return res.data;
  },
  async adminApprove(id) {
    const res = await axios.patch(`${API_URL}/reservations/${id}/admin-approve`, {}, { withCredentials: true });
    return res.data;
  },
  async ownerApprove(id) {
    const res = await axios.patch(`${API_URL}/reservations/${id}/owner-approve`, {}, { withCredentials: true });
    return res.data;
  },
  async getByOwner(ownerId) {
    const res = await axios.get(`${API_URL}/reservations/owner/${ownerId}`, { withCredentials: true });
    return res.data;
  },
  async addCoEarner(reservationId, data) {
    const res = await axios.post(`${API_URL}/reservations/${reservationId}/co-earners`, data, { withCredentials: true });
    return res.data;
  },
  async getCoEarners(reservationId) {
    const res = await axios.get(`${API_URL}/reservations/${reservationId}/co-earners`, { withCredentials: true });
    return res.data;
  },
}; 