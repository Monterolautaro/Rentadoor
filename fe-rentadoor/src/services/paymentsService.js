import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

export const paymentsService = {
  async uploadPayment({ file, reservationId, userId, type }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reservationId', reservationId);
    formData.append('userId', userId);
    formData.append('type', type);
    const res = await axios.post(`${API_URL}/payments/upload`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async getPaymentsByReservation(reservationId) {
    const res = await axios.get(`${API_URL}/payments/by-reservation/${reservationId}`, { withCredentials: true });
    return res.data;
  },
  async approvePayment(reservationId) {
    const res = await axios.post(`${API_URL}/payments/approve`, { reservationId }, { withCredentials: true });
    return res.data;
  },
  async rejectPayment(reservationId, motivo) {
    const res = await axios.post(`${API_URL}/payments/reject`, { reservationId, motivo }, { withCredentials: true });
    return res.data;
  },
  async deletePayment(paymentId) {
    const res = await axios.delete(`${API_URL}/payments/${paymentId}`, { withCredentials: true });
    return res.data;
  },
}; 