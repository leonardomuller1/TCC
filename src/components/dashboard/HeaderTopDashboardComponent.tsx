import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '../../supabaseClient';

type NamePageMap = {
  '/problema': string;
  '/clientes': string;
  '/solucao': string;
  '/concorrentes': string;
  '/financeiro': string;
  '/andamento': string;
  '/configuracao': string;
  '/admin': string;
};

const namePages: NamePageMap = {
  '/problema': 'Problema',
  '/clientes': 'Segmento de clientes e Público-alvo',
  '/solucao': 'Solução e proposta de valor',
  '/concorrentes': 'Análise de concorrentes',
  '/financeiro': 'Estrutura de custos e receita',
  '/andamento': 'Métricas chaves e andamento',
  '/configuracao': 'Configurações',
  '/admin': 'Painel Administrador',
};

function HeaderTopDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname as keyof NamePageMap;
  const dynamicName = namePages[currentPath] || '';
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState<string | null>(null); // Inicializando o estado como string ou null

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
    } else {
      setUser(null);
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchName = async () => {
      if (user?.companyId) {
        // Verifique se user e companyId estão disponíveis
        const { data, error } = await supabase
          .from('empresas')
          .select('nome')
          .eq('id', user.companyId)
          .single();

        if (error) {
          console.error('Erro ao buscar nome da empresa:', error.message);
        } else {
          setName(data.nome);
        }
      }
    };

    fetchName();
  }, [user]); // Adicionando user como dependência

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-4 sm:px-8 md:px-16 lg:px-32">
      <div className="flex flex-row gap-4 justify-between items-center">
        <div className="flex flex-row gap-4">
          {dynamicName && (
            <>
              <p className="text-gray-400 font-normal text-sm hover:text-gray-900 hover:font-semibold">
                <a href="/">Dashboard</a>
              </p>
              <p className="text-gray-900 font-normal text-sm hover:font-semibold hidden sm:block">
                {dynamicName}
              </p>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-2">
            {!user.is_master && (
              <p className="text-gray-900 font-normal text-sm hidden md:block">
                Bem-vindo, {user.name}
              </p>
            )}
            {user.is_master && (
              <p className="text-gray-900 font-normal text-sm hidden md:block">
                {name || user.companyId}{' '}
                {/* Exibindo o nome da empresa ou companyId como fallback */}
              </p>
            )}
            {user.is_master && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="mr-1"
              >
                Painel Admin
              </Button>
            )}
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
