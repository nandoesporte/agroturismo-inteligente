
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, UserCheck, UserX, Shield, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  is_admin: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Combine auth users with roles
      const adminIds = new Set((userRoles || []).filter(ur => ur.role === 'admin').map(ur => ur.user_id));
      
      const mappedUsers = (authUsers?.users || []).map(user => ({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Usuário',
        avatar_url: user.user_metadata?.avatar_url || '',
        created_at: user.created_at,
        is_admin: adminIds.has(user.id)
      }));
      
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const toggleAdminRole = async (userId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
          
        if (error) throw error;
        
        toast({
          title: "Privilégios removidos",
          description: "Os privilégios de administrador foram removidos.",
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin'
          });
          
        if (error) throw error;
        
        toast({
          title: "Privilégios concedidos",
          description: "Os privilégios de administrador foram concedidos.",
        });
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !isAdmin } : user
      ));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, is_admin: !isAdmin });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar privilégios",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
      </div>

      <div className="bg-white rounded-md shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-nature-600 rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de Registro</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback className="bg-nature-100 text-nature-700">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-none">{user.full_name}</p>
                        {user.is_admin && (
                          <Badge variant="outline" className="mt-1 text-xs bg-amber-50 text-amber-700 border-amber-200">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewUser(user)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAdminRole(user.id, user.is_admin)}
                      className={user.is_admin ? "text-red-500" : "text-blue-500"}
                    >
                      {user.is_admin ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          Remover Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Tornar Admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {selectedUser && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col items-center justify-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedUser.avatar_url} alt={selectedUser.full_name} />
                  <AvatarFallback className="bg-nature-100 text-nature-700 text-2xl">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.is_admin && (
                    <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-200">
                      Administrador
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Data de Registro</span>
                  </div>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm">Status</span>
                  </div>
                  <p className="font-medium">Ativo</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant={selectedUser.is_admin ? "destructive" : "default"}
                onClick={() => toggleAdminRole(selectedUser.id, selectedUser.is_admin)}
              >
                {selectedUser.is_admin ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Remover Admin
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Tornar Admin
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminUsers;
