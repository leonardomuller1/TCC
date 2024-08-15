import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '../../supabaseClient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NamePageMap = {
  '/problema': string;
  '/clientes': string;
  '/solucao': string;
  '/concorrentes': string;
  '/financeiro': string;
  '/andamento': string;
  '/configuracao': string;
};

const namePages: NamePageMap = {
  '/problema': 'Problema',
  '/clientes': 'Segmento de clientes e Público-alvo',
  '/solucao': 'Solução e proposta de valor',
  '/concorrentes': 'Análise de concorrentes',
  '/financeiro': 'Estrutura de custos e receita',
  '/andamento': 'Métricas chaves e andamento',
  '/configuracao': 'Configurações',
};

type User = {
  id: string;
  name: string;
  foto: string;
  email: string;
  companyId: string;
};

function HeaderTopDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname as keyof NamePageMap;
  const dynamicName = namePages[currentPath] || '';
  const { userId, user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome, foto, email, empresa')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error(userError.message);
          return;
        }

        const { data: companyData, error: companyError } = await supabase
          .from('empresas')
          .select('id')
          .eq('id', userData.empresa)
          .single();

        if (companyError) {
          console.error(companyError.message);
          return;
        }

        const userWithCompanyId: User = {
          id: userId,
          name: userData.nome,
          foto: userData.foto,
          email: userData.email,
          companyId: companyData.id,
        };

        setUser(userWithCompanyId);
      }
    };

    fetchUserData();
  }, [userId, setUser]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
    } else {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-32">
      <div className="flex flex-row gap-4 justify-between items-center">
        <div className="flex flex-row gap-4">
          {dynamicName && (
            <>
              <p className="text-gray-400 font-normal text-sm hover:text-gray-900 hover:font-semibold">
                <a href="/">Dashboard</a>
              </p>
              <p className="text-gray-900 font-normal text-sm hover:font-semibold">
                {dynamicName}
              </p>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <p className="text-gray-900 font-normal text-sm">
              Bem-vindo, {user.name}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <img
                    src={user.foto}
                    alt={`${user.name}'s profile`}
                    className="w-8 h-8 rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <a href="/configuracao">Configurações</a>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeaderTopDashboard;
