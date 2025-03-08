
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Home, 
  Map, 
  PanelLeft,
  TreePine, 
  LogOut,
  Users,
  CalendarDays,
  MessageSquare,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-6">
        <h1 className="text-2xl font-semibold text-red-600">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar o painel administrativo.</p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    );
  }

  const sidebarItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { title: 'Propriedades', icon: <TreePine size={20} />, href: '/admin/properties' },
    { title: 'Experiências', icon: <Map size={20} />, href: '/admin/experiences' },
    { title: 'Usuários', icon: <Users size={20} />, href: '/admin/users' },
    { title: 'Reservas', icon: <CalendarDays size={20} />, href: '/admin/bookings' },
    { title: 'Mensagens', icon: <MessageSquare size={20} />, href: '/admin/messages' },
    { title: 'Configurações', icon: <Settings size={20} />, href: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-16 lg:w-64 bg-white border-r border-border shadow-sm">
        <div className="px-3 py-4 lg:py-6 flex flex-col h-full">
          <div className="mb-8 px-2">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/e519efc1-257a-49de-acaa-461d821b5ad9.png" 
                alt="AgroRota Logo" 
                className="h-10 w-auto" 
              />
              <span className="ml-2 text-xl font-bold playfair tracking-tight text-nature-800 hidden lg:block">
                Agro<span className="text-nature-600">Rota</span>
              </span>
            </Link>
          </div>

          <div className="space-y-1 flex-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              return (
                <TooltipProvider key={item.href} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center p-2 rounded-md hover:bg-muted group",
                          isActive && "bg-nature-50 text-nature-600"
                        )}
                      >
                        <span className={cn(
                          "mr-3 flex-shrink-0",
                          isActive && "text-nature-600"
                        )}>
                          {item.icon}
                        </span>
                        <span className="hidden lg:block">{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="lg:hidden">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          <div className="pt-2 mt-auto border-t border-border">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/"
                    className="flex items-center p-2 rounded-md hover:bg-muted group"
                  >
                    <Home size={20} className="mr-3 flex-shrink-0" />
                    <span className="hidden lg:block">Voltar ao Site</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  Voltar ao Site
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-2 rounded-md hover:bg-muted group text-left"
                  >
                    <LogOut size={20} className="mr-3 flex-shrink-0 text-red-500" />
                    <span className="hidden lg:block text-red-500">Sair</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  Sair
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 pl-16 w-full">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
