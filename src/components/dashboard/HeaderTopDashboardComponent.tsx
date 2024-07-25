import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '../../supabaseClient';

type NamePageMap = {
  '/problema': string;
  '/clientes': string;
  '/solucao': string;
  '/concorrentes': string;
  '/receita': string;
  '/andamento': string;
};

const namePages: NamePageMap = {
  '/problema': 'Problema',
  '/clientes': 'Segmento de clientes e Público-alvo',
  '/solucao': 'Solução e proposta de valor',
  '/concorrentes': 'Análise de concorrentes',
  '/receita': 'Estrutura de custos e receita',
  '/andamento': 'Métricas chaves e andamento',
};

function HeaderTopDashboard() {
  const location = useLocation();
  const currentPath = location.pathname as keyof NamePageMap;
  const dynamicName = namePages[currentPath] || 'Página';
  const { userId, user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, nome, email, empresa')
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

        const userWithCompanyId = {
          id: userId,
          companyId: companyData.id,
          email: userData.email,
          name: userData.nome,
        };

        setUser(userWithCompanyId);
      }
    };

    fetchUserData();
  }, [userId, setUser]);

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-32">
      <div className="flex flex-row gap-4 justify-between items-center">
        <div className="flex flex-row gap-4">
          <p className="text-gray-400 font-normal text-sm hover:text-gray-900 hover:font-semibold">
            <a href="/">Dashboard</a>
          </p>
          <p className="text-gray-900 font-normal text-sm hover:font-semibold">
            {dynamicName}
          </p>
        </div>
        {user && (
          <div className="flex items-center">
            <p className="text-gray-900 font-normal text-sm">
              Bem-vindo, {user.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeaderTopDashboard;
