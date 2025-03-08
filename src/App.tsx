
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            
            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
