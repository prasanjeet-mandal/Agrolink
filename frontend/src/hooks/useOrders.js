import * as React from 'react';
import { orderService } from '@/services/orderService';

export function useOrders({ role, userId, producerId } = {}) {
  const [orders, setOrders] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = producerId
          ? await orderService.getSellerOrders(producerId)
          : await orderService.getMine({ role, userId });
        setOrders(data);
      } catch (e) {
        setError(e.message);
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [role, userId, producerId]
  );

  React.useEffect(() => {
    load();
  }, [load]);

  const updateStatus = React.useCallback(
    async (orderId, status) => {
      const updated = await orderService.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    },
    []
  );

  return { orders, loading, error, refreshing, reload: load, updateStatus };
}