
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = (location.state as any)?.email || '';

  React.useEffect(() => {
    if (user && user.email_confirmed_at) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Acesso não autorizado</h2>
          <p className="text-lg text-gray-600 mb-8">
            Você acessou esta página incorretamente. Por favor, retorne à página inicial.
          </p>
          <Button asChild className="bg-nature-600 hover:bg-nature-700">
            <Link to="/">Voltar para página inicial</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 px-4">
      <div className="max-w-md w-full text-center">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/lovable-uploads/e519efc1-257a-49de-acaa-461d821b5ad9.png" alt="AgroRota Logo" className="h-12 w-auto" />
          <span className="ml-2 text-2xl font-bold playfair tracking-tight text-nature-800">
            Agro<span className="text-nature-600">Rota</span>
          </span>
        </Link>
        
        <div className="bg-white p-8 shadow-sm rounded-lg">
          <svg
            className="mx-auto h-16 w-16 text-nature-500"
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
          
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Verifique seu email</h2>
          
          <p className="mt-2 text-sm text-gray-600">
            Enviamos um email para <span className="font-semibold">{email}</span> com um link para 
            verificar sua conta. Por favor, verifique sua caixa de entrada e clique 
            no link para concluir seu cadastro.
          </p>
          
          <div className="mt-6 space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/login">Voltar para o login</Link>
            </Button>
            
            <p className="text-xs text-gray-500">
              Não recebeu o email? Verifique sua pasta de spam ou{' '}
              <Button variant="link" className="p-0 h-auto text-xs text-nature-600 hover:text-nature-700">
                reenvie o email de verificação
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
