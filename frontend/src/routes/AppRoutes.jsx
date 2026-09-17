import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { Loading } from '@/components/common';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import AuthLayout from './AuthLayout';

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const SelectRole = lazy(() => import('@/pages/auth/SelectRole'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

const ConsumerDashboard = lazy(() => import('@/pages/consumer/Dashboard'));
const ConsumerSearchProducts = lazy(() => import('@/pages/consumer/SearchProducts'));
const ConsumerProductDetails = lazy(() => import('@/pages/consumer/ProductDetails'));
const ConsumerProductRequest = lazy(() => import('@/pages/consumer/ProductRequest'));
const ConsumerCart = lazy(() => import('@/pages/consumer/Cart'));
const ConsumerOrders = lazy(() => import('@/pages/consumer/Orders'));
const ConsumerOrderTracking = lazy(() => import('@/pages/consumer/OrderTracking'));

const DeliveryPartnerDashboard = lazy(() => import('@/pages/delivery-partner/Dashboard'));
const DeliveryPartnerDeliveryDetails = lazy(() => import('@/pages/delivery-partner/DeliveryDetails'));
const DeliveryPartnerActiveDelivery = lazy(() => import('@/pages/delivery-partner/ActiveDelivery'));

const FarmerDashboard = lazy(() => import('@/pages/producer/farmer/Dashboard'));
const FarmerProfile = lazy(() => import('@/pages/producer/farmer/Profile'));
const FarmerAddProduct = lazy(() => import('@/pages/producer/farmer/AddProduct'));
const FarmerMyProducts = lazy(() => import('@/pages/producer/farmer/MyProducts'));
const FarmerEditProduct = lazy(() => import('@/pages/producer/farmer/EditProduct'));
const FarmerIncomingOrders = lazy(() => import('@/pages/producer/farmer/IncomingOrders'));
const FarmerConfirmOrder = lazy(() => import('@/pages/producer/farmer/ConfirmOrder'));
const FarmerPayments = lazy(() => import('@/pages/producer/farmer/Payments'));

const FpoDashboard = lazy(() => import('@/pages/producer/fpo/Dashboard'));
const FpoProfile = lazy(() => import('@/pages/producer/fpo/Profile'));
const FpoAddProduct = lazy(() => import('@/pages/producer/fpo/AddProduct'));
const FpoManageProducts = lazy(() => import('@/pages/producer/fpo/ManageProducts'));
const FpoBuyProducts = lazy(() => import('@/pages/producer/fpo/BuyProducts'));
const FpoSellProducts = lazy(() => import('@/pages/producer/fpo/SellProducts'));
const FpoEditProduct = lazy(() => import('@/pages/producer/fpo/EditProduct'));
const FpoIncomingOrders = lazy(() => import('@/pages/producer/fpo/IncomingOrders'));
const FpoOutgoingOrders = lazy(() => import('@/pages/producer/fpo/OutgoingOrders'));
const FpoConfirmOrder = lazy(() => import('@/pages/producer/fpo/ConfirmOrder'));
const FpoPayments = lazy(() => import('@/pages/producer/fpo/Payments'));

const Marketplace = lazy(() => import('@/pages/marketplace/Marketplace'));
const MarketplaceProductDetails = lazy(() => import('@/pages/marketplace/ProductDetails'));

const PlaceOrder = lazy(() => import('@/pages/orders/PlaceOrder'));
const OrderDetails = lazy(() => import('@/pages/orders/OrderDetails'));
const OrderHistory = lazy(() => import('@/pages/orders/OrderHistory'));
const OrderTracking = lazy(() => import('@/pages/orders/OrderTracking'));

const PriceCalculation = lazy(() => import('@/pages/pricing/PriceCalculation'));
const PriceForecast = lazy(() => import('@/pages/pricing/PriceForecast'));
const DemandForecast = lazy(() => import('@/pages/demand/DemandForecast'));

const LogisticsDashboard = lazy(() => import('@/pages/logistics/LogisticsDashboard'));
const ShipmentDetails = lazy(() => import('@/pages/logistics/ShipmentDetails'));
const VehicleAssignment = lazy(() => import('@/pages/logistics/VehicleAssignment'));
const RouteMap = lazy(() => import('@/pages/logistics/RouteMap'));

const DeliveryStatus = lazy(() => import('@/pages/delivery/DeliveryStatus'));
const DeliveryConfirmation = lazy(() => import('@/pages/delivery/DeliveryConfirmation'));

const Payment = lazy(() => import('@/pages/payment/Payment'));
const PaymentConfirmation = lazy(() => import('@/pages/payment/PaymentConfirmation'));
const PaymentHistory = lazy(() => import('@/pages/payment/PaymentHistory'));

const Chatbot = lazy(() => import('@/pages/chatbot/Chatbot'));

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));

const Landing = lazy(() => import('@/pages/landing/Landing'));

const Unauthorized = lazy(() => import('@/pages/auth/Unauthorized'));
const Profile = lazy(() => import('@/pages/auth/Profile'));

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
    <Suspense fallback={<Loading label="Loading page…" />}>
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
    </Suspense>
  );
}