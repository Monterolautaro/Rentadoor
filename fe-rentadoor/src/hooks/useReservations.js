import { useState, useCallback } from 'react';
import { reservationsService } from '@/services/reservationsService';

export function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsService.getAll();
      setReservations(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsService.getByUser(userId);
      setReservations(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByProperty = useCallback(async (propertyId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsService.getByProperty(propertyId);
      setReservations(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByOwner = useCallback(async (ownerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsService.getByOwner(ownerId);
      setReservations(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAsAdmin = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsService.adminApprove(id);
      setReservations((prev) => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAsOwner = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationsService.ownerApprove(id);
      setReservations((prev) => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchAll,
    fetchByUser,
    fetchByProperty,
    fetchByOwner,
    approveAsAdmin,
    approveAsOwner,
    setReservations,
  };
} 