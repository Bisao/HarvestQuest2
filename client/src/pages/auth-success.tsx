
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function AuthSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Pegar o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Salvar token no localStorage
      localStorage.setItem('auth_token', token);
      
      // Redirecionar para o menu principal
      setLocation('/', { replace: true });
    } else {
      // Se não há token, redirecionar para login
      setLocation('/', { replace: true });
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Finalizando login...</p>
      </div>
    </div>
  );
}
