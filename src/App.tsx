
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

// Pages
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Experiences from "./pages/Experiences";
import Map from "./pages/Map";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProperties from "./pages/admin/Properties";
import AdminExperiences from "./pages/admin/Experiences";
import AdminUsers from "./pages/admin/Users";
import AdminBookings from "./pages/admin/Bookings";
import AdminMessages from "./pages/admin/Messages";
import AdminSettings from "./pages/admin/Settings";
import AdminHeroSlides from "./pages/admin/HeroSlides";

// Adicionar animações
import { MotionConfig } from 'framer-motion';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/map" element={<Map />} />
              <Route path="/about" element={<About />} />
              
              {/* Rotas de autenticação */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
              {/* Rotas protegidas */}
              <Route path="/profile" element={<ProtectedRoute><div>Perfil do usuário</div></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><div>Favoritos</div></ProtectedRoute>} />
              <Route path="/my-trips" element={<ProtectedRoute><div>Minhas viagens</div></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><div>Configurações</div></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><div>Reservas</div></ProtectedRoute>} />
              <Route path="/shop" element={<ProtectedRoute><div>Loja</div></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><div>Chat</div></ProtectedRoute>} />
              
              {/* Rotas de administração */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/properties" element={<ProtectedRoute><AdminLayout><AdminProperties /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/experiences" element={<ProtectedRoute><AdminLayout><AdminExperiences /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute><AdminLayout><AdminBookings /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/hero-slides" element={<ProtectedRoute><AdminLayout><AdminHeroSlides /></AdminLayout></ProtectedRoute>} />
              
              {/* Rota de fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MotionConfig>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
