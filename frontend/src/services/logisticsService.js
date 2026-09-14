import { mockDb, MOCK_MODE } from '@/mocks/db';
import { httpGet } from '@/api/client';
import { API } from '@/constants/apiEndpoints';

export const logisticsService = {
  async getShipments() {
    if (!MOCK_MODE) return httpGet(API.LOGISTICS.SHIPMENTS);
    return mockDb.listShipments();
  },

  async getShipment(shipmentId) {
    if (!MOCK_MODE) return httpGet(`${API.LOGISTICS.SHIPMENTS}/${shipmentId}`);
    return mockDb.getShipment(shipmentId);
  },

  async getShipmentForOrder(orderId) {
    if (!MOCK_MODE) return httpGet(`${API.LOGISTICS.SHIPMENTS}/order/${orderId}`);
    return mockDb.shipmentForOrder(orderId);
  },

  async getVehicles() {
    if (!MOCK_MODE) return httpGet(API.LOGISTICS.VEHICLES);
    return mockDb.listVehicles();
  },
};