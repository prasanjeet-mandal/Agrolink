import { httpGet, httpPut } from '@/api/client';
import { API } from '@/constants/apiEndpoints';
import { toLogistics } from '@/services/normalize';

export const logisticsService = {
  async getMine() {
    const res = await httpGet(API.LOGISTICS.MINE);
    return (Array.isArray(res) ? res : []).map(toLogistics);
  },

  async assign(logisticsId, deliveryPartnerId) {
    const res = await httpPut(`${API.LOGISTICS.BASE}/${logisticsId}/assign`, {
      deliveryPartnerId,
    });
    return toLogistics(res);
  },

  async updateStatus(logisticsId, status) {
    const res = await httpPut(`${API.LOGISTICS.BASE}/${logisticsId}/status`, { status });
    return toLogistics(res);
  },

  async updateLocation(logisticsId, location) {
    const res = await httpPut(`${API.LOGISTICS.BASE}/${logisticsId}/location`, {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    });
    return toLogistics(res);
  },

  async getShipments() {
    return httpGet(API.LOGISTICS.SHIPMENTS);
  },

  async getShipment(shipmentId) {
    return httpGet(`${API.LOGISTICS.SHIPMENTS}/${shipmentId}`);
  },

  async getShipmentForOrder(orderId) {
    return httpGet(`${API.LOGISTICS.SHIPMENTS}/order/${orderId}`);
  },

  async getVehicles() {
    return httpGet(API.LOGISTICS.VEHICLES);
  },
};