import { supabase } from '@/supabaseClient';
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/TableComponent';
import CardPages from '@/components/dashboard/CardPagesComponent';
import useAuthStore from '@/stores/useAuthStore';

interface Empresa {
  id: string;
  nome: string;
  userCreate: string;
}

const AdminDashboard: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, userCreate');

      if (error) {
        console.error('Erro ao buscar empresas:', error);
      } else {
        setEmpresas(data || []);
      }
      setLoading(false);
    };

    fetchEmpresas();
  }, []);

  const handleAddClick = () => {
    // Lógica para adicionar nova empresa
  };

  const handleOptionsClick = (rowIndex: number) => {
    const empresaId = empresas[rowIndex].id;
    
    if (user) {
      setUser({
        ...user,
        companyId: empresaId
      });
    }

    alert(`Empresa selecionada: ${empresaId}`);
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">
      Painel Administrador</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <DataTable
          headers={['ID', 'Nome', 'User Create']}
          rows={empresas.map((empresa) => [
            empresa.id,
            empresa.nome,
            empresa.userCreate,
          ])}
          onAddClick={handleAddClick}
          onOptionsClick={handleOptionsClick}
          hidePlusIcon={true}
        />
      )}
    </CardPages>
  );
};

export default AdminDashboard;