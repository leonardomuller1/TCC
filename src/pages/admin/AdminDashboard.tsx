import { supabase } from '@/supabaseClient';
import React, { useEffect, useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar as empresas no Supabase
    const fetchEmpresas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, userCreate'); // Ajustado para a estrutura revisada

      if (error) {
        console.error('Erro ao buscar empresas:', error);
      } else {
        setEmpresas(data || []);
      }
      setLoading(false);
    };

    fetchEmpresas();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Lista de Empresas</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>User Create</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa) => (
              <tr key={empresa.id}>
                <td>{empresa.id}</td>
                <td>{empresa.nome}</td>
                <td>{empresa.userCreate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
