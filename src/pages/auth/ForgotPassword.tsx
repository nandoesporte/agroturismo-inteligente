
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setSubmitted(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div>
            <Link to="/" className="flex items-center mb-8">
              <img src="/lovable-uploads/e519efc1-257a-49de-acaa-461d821b5ad9.png" alt="AgroRota Logo" className="h-12 w-auto" />
              <span className="ml-2 text-2xl font-bold playfair tracking-tight text-nature-800">
                Agro<span className="text-nature-600">Rota</span>
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Recuperar senha</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Lembrou da senha?{' '}
              <Link to="/auth/login" className="font-medium text-nature-600 hover:text-nature-500">
                Voltar para o login
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {submitted ? (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-nature-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Email enviado!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enviamos instruções para {email}. Verifique sua caixa de entrada
                  e siga as instruções para redefinir sua senha.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSubmitted(false)}
                  >
                    Tentar com outro email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-nature-600 hover:bg-nature-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </span>
                    ) : 'Recuperar senha'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block">
        <img
          className="absolute inset-0 object-cover w-full h-full"
          src="https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Paisagem rural"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
