import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ChatbotProvider } from '@/context/ChatbotContext';
import { ToastProviderComponent } from '@/components/ui/toast';
import ScrollToTop from '@/components/common/ScrollToTop';
import ChatFab from '@/components/common/ChatFab';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <ChatbotProvider>
            <ToastProviderComponent>
              <ScrollToTop />
              <AppRoutes />
              <ChatFab />
            </ToastProviderComponent>
          </ChatbotProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}