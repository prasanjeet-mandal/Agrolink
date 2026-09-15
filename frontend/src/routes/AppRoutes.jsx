import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import AuthLayout from './AuthLayout';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import SelectRole from '@/pages/auth/SelectRole';
import ForgotPassword from '@/pages/auth/ForgotPassword';

import ConsumerDashboard from '@/pages/consumer/Dashboard';
import ConsumerSearchProducts from '@/pages/consumer/SearchProducts';
import ConsumerProductDetails from '@/pages/consumer/ProductDetails';
import ConsumerProductRequest from '@/pages/consumer/ProductRequest';
import ConsumerCart from '@/pages/consumer/Cart';
import ConsumerOrders from '@/pages/consumer/Orders';
import ConsumerOrderTracking from '@/pages/consumer/OrderTracking';

import DeliveryPartnerDashboard from '@/pages/delivery-partner/Dashboard';
import DeliveryPartnerDeliveryDetails from '@/pages/delivery-partner/DeliveryDetails';
import DeliveryPartnerActiveDelivery from '@/pages/delivery-partner/ActiveDelivery';

import FarmerDashboard from '@/pages/producer/farmer/Dashboard';
import FarmerProfile from '@/pages/producer/farmer/Profile';
import FarmerAddProduct from '@/pages/producer/farmer/AddProduct';
import FarmerMyProducts from '@/pages/producer/farmer/MyProducts';
import FarmerEditProduct from '@/pages/producer/farmer/EditProduct';
import FarmerIncomingOrders from '@/pages/producer/farmer/IncomingOrders';
import FarmerConfirmOrder from '@/pages/producer/farmer/ConfirmOrder';
import FarmerPayments from '@/pages/producer/farmer/Payments';

import FpoDashboard from '@/pages/producer/fpo/Dashboard';
import FpoProfile from '@/pages/producer/fpo/Profile';
import FpoAddProduct from '@/pages/producer/fpo/AddProduct';
import FpoManageProducts from '@/pages/producer/fpo/ManageProducts';
import FpoBuyProducts from '@/pages/producer/fpo/BuyProducts';
import FpoSellProducts from '@/pages/producer/fpo/SellProducts';
import FpoEditProduct from '@/pages/producer/fpo/EditProduct';
import FpoIncomingOrders from '@/pages/producer/fpo/IncomingOrders';
import FpoOutgoingOrders from '@/pages/producer/fpo/OutgoingOrders';
import FpoConfirmOrder from '@/pages/producer/fpo/ConfirmOrder';
import FpoPayments from '@/pages/producer/fpo/Payments';

import Marketplace from '@/pages/marketplace/Marketplace';
import MarketplaceProductDetails from '@/pages/marketplace/ProductDetails';

import PlaceOrder from '@/pages/orders/PlaceOrder';
import OrderDetails from '@/pages/orders/OrderDetails';
import OrderHistory from '@/pages/orders/OrderHistory';
import OrderTracking from '@/pages/orders/OrderTracking';

import PriceCalculation from '@/pages/pricing/PriceCalculation';
import PriceForecast from '@/pages/pricing/PriceForecast';
import DemandForecast from '@/pages/demand/DemandForecast';

import LogisticsDashboard from '@/pages/logistics/LogisticsDashboard';
import ShipmentDetails from '@/pages/logistics/ShipmentDetails';
import VehicleAssignment from '@/pages/logistics/VehicleAssignment';
import RouteMap from '@/pages/logistics/RouteMap';

import DeliveryStatus from '@/pages/delivery/DeliveryStatus';
import DeliveryConfirmation from '@/pages/delivery/DeliveryConfirmation';

import Payment from '@/pages/payment/Payment';
import PaymentConfirmation from '@/pages/payment/PaymentConfirmation';
import PaymentHistory from '@/pages/payment/PaymentHistory';

import Chatbot from '@/pages/chatbot/Chatbot';

import AdminDashboard from '@/pages/admin/Dashboard';

import Landing from '@/pages/landing/Landing';

import Unauthorized from '@/pages/auth/Unauthorized';
import Profile from '@/pages/auth/Profile';

function Home() {
  const { user } = useAuth();
  if (user?.role === ROLES.FARMER) return <Navigate to="/producer/farmer" replace />;
  if (user?.role === ROLES.FPO) return <Navigate to="/producer/fpo" replace />;
  if (user?.role === ROLES.CONSUMER) return <Navigate to="/consumer" replace />;
  if (user?.role === ROLES.DELIVERY_PARTNER) return <Navigate to="/delivery-partner" replace />;
  if (user?.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  return <Landing />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[ROLES.CONSUMER, ROLES.FARMER, ROLES.FPO, ROLES.DELIVERY_PARTNER]}
          />
        }
      >
        <Route element={<AppLayout />}>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:productId" element={<MarketplaceProductDetails />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/orders/:orderId/place" element={<PlaceOrder />} />
          <Route path="/checkout" element={<PlaceOrder />} />
          <Route path="/orders/:orderId/track" element={<OrderTracking />} />
          <Route path="/pricing" element={<PriceForecast />} />
          <Route path="/pricing/calculate" element={<PriceCalculation />} />
          <Route path="/demand" element={<DemandForecast />} />
          <Route path="/logistics" element={<LogisticsDashboard />} />
          <Route path="/logistics/:shipmentId" element={<ShipmentDetails />} />
          <Route path="/logistics/vehicles" element={<VehicleAssignment />} />
          <Route path="/logistics/routes/:shipmentId" element={<RouteMap />} />
          <Route path="/delivery" element={<DeliveryStatus />} />
          <Route path="/delivery/:orderId/confirm" element={<DeliveryConfirmation />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/confirm" element={<PaymentConfirmation />} />
          <Route path="/payment/history" element={<PaymentHistory />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<ProtectedRoute allowedRoles={[ROLES.CONSUMER]} />}>
            <Route path="/consumer" element={<ConsumerDashboard />} />
            <Route path="/consumer/search" element={<ConsumerSearchProducts />} />
            <Route path="/consumer/products/:productId" element={<ConsumerProductDetails />} />
            <Route path="/consumer/products/:productId/request" element={<ConsumerProductRequest />} />
            <Route path="/consumer/cart" element={<ConsumerCart />} />
            <Route path="/consumer/orders" element={<ConsumerOrders />} />
            <Route path="/consumer/orders/:orderId" element={<ConsumerOrderTracking />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER]} />}>
            <Route path="/producer/farmer" element={<FarmerDashboard />} />
            <Route path="/producer/farmer/profile" element={<FarmerProfile />} />
            <Route path="/producer/farmer/products" element={<FarmerMyProducts />} />
            <Route path="/producer/farmer/products/add" element={<FarmerAddProduct />} />
            <Route path="/producer/farmer/products/:productId/edit" element={<FarmerEditProduct />} />
            <Route path="/producer/farmer/orders/incoming" element={<FarmerIncomingOrders />} />
            <Route path="/producer/farmer/orders/:orderId/confirm" element={<FarmerConfirmOrder />} />
            <Route path="/producer/farmer/payments" element={<FarmerPayments />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.FPO]} />}>
            <Route path="/producer/fpo" element={<FpoDashboard />} />
            <Route path="/producer/fpo/profile" element={<FpoProfile />} />
            <Route path="/producer/fpo/products/add" element={<FpoAddProduct />} />
            <Route path="/producer/fpo/products" element={<FpoManageProducts />} />
            <Route path="/producer/fpo/products/:productId/edit" element={<FpoEditProduct />} />
            <Route path="/producer/fpo/products/buy" element={<FpoBuyProducts />} />
            <Route path="/producer/fpo/products/sell" element={<FpoSellProducts />} />
            <Route path="/producer/fpo/orders/incoming" element={<FpoIncomingOrders />} />
            <Route path="/producer/fpo/orders/:orderId/confirm" element={<FpoConfirmOrder />} />
            <Route path="/producer/fpo/orders/outgoing" element={<FpoOutgoingOrders />} />
            <Route path="/producer/fpo/payments" element={<FpoPayments />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.DELIVERY_PARTNER]} />}>
            <Route path="/delivery-partner" element={<DeliveryPartnerDashboard />} />
            <Route path="/delivery-partner/deliveries" element={<DeliveryPartnerDashboard />} />
            <Route path="/delivery-partner/deliveries/:deliveryId" element={<DeliveryPartnerDeliveryDetails />} />
            <Route path="/delivery-partner/deliveries/:deliveryId/active" element={<DeliveryPartnerActiveDelivery />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}