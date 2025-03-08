
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Users, Map, TreePine, MessageSquare, ArrowUpRight, CalendarDays } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dados simulados para o dashboard
  const stats = [
    { 
      title: "Usuários", 
      value: "245", 
      change: "+5.3%", 
      changeType: "increase", 
      icon: <Users className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: "Propriedades", 
      value: "12", 
      change: "+2.1%", 
      changeType: "increase", 
      icon: <TreePine className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: "Experiências", 
      value: "34", 
      change: "+12.4%", 
      changeType: "increase", 
      icon: <Map className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: "Reservas", 
      value: "89", 
      change: "+18.7%", 
      changeType: "increase", 
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: "Mensagens", 
      value: "24", 
      change: "-2.5%", 
      changeType: "decrease", 
      icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> 
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Bem-vindo, {user?.user_metadata?.full_name || 'Administrador'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs flex items-center ${
                stat.changeType === "increase" 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {stat.changeType === "increase" ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 mr-1 transform rotate-180" />
                )}
                {stat.change} desde o mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-nature-600 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Usuário #{Math.floor(Math.random() * 100)}</span> {" "}
                      {["fez uma reserva", "adicionou uma avaliação", "enviou uma mensagem", "atualizou o perfil", "registrou-se na plataforma"][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {["5 minutos", "2 horas", "1 dia", "3 dias", "1 semana"][i]} atrás
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Desempenho do Sistema</CardTitle>
            <CardDescription>
              Estatísticas operacionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Taxa de Conversão</span>
                  <span className="text-sm font-medium">4.3%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-nature-600 h-2 rounded-full" style={{ width: '43%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Tempo Médio na Página</span>
                  <span className="text-sm font-medium">3:42</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-nature-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Taxa de Rejeição</span>
                  <span className="text-sm font-medium">28.2%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-nature-600 h-2 rounded-full" style={{ width: '28.2%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Reservas Concluídas</span>
                  <span className="text-sm font-medium">72.8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-nature-600 h-2 rounded-full" style={{ width: '72.8%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
