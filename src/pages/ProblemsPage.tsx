import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import useAuthStore from '@/stores/useAuthStore';

type Problema = {
  id: number;
  empresa_id: string;
  descricao: string;
  como_resolvido: string;
  impacto: string;
  exemplos: string;
  frequencia: string;
  segmento: string;
  gravidade: string;
  created_at: string;
  updated_at: string;
};

const ProblemsPage = () => {
  const { user } = useAuthStore();
  const [problemas, setProblemas] = useState<Problema[]>([]);

  useEffect(() => {
    const fetchProblemas = async () => {
      if (!user || !user.companyId) {
        console.error('Usuário não autenticado ou companyId ausente');
        return;
      }

      try {
        // Buscar problemas existentes
        const { data, error } = await supabase
          .from('problema')
          .select('*')
          .eq('empresa_id', user.companyId);

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          setProblemas(data);
        } else {
          // Se não houver problemas, criar um novo
          const { data: novoProblema, error: insertError } = await supabase
            .from('problema')
            .insert([
              {
                empresa_id: user.companyId,
                descricao: 'Descrição padrão',
                como_resolvido: 'Solução padrão',
                impacto: 'Impacto padrão',
                exemplos: 'Exemplos padrão',
                frequencia: 'Frequência padrão',
                segmento: 'Segmento padrão',
                gravidade: 'Gravidade padrão',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select();

          if (insertError) {
            throw new Error(insertError.message);
          }

          setProblemas(novoProblema || []);
        }
      } catch (error) {
        console.error('Erro ao buscar ou criar problemas:', (error as Error).message);
      }
    };

    fetchProblemas();
  }, [user]);

  return (
    <div>
      <h1>Lista de Problemas</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Empresa ID</th>
            <th>Descrição</th>
            <th>Como Resolvido</th>
            <th>Impacto</th>
            <th>Exemplos</th>
            <th>Frequência</th>
            <th>Segmento</th>
            <th>Gravidade</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
          </tr>
        </thead>
        <tbody>
          {problemas.map((problema) => (
            <tr key={problema.id}>
              <td>{problema.id}</td>
              <td>{problema.empresa_id}</td>
              <td>{problema.descricao}</td>
              <td>{problema.como_resolvido}</td>
              <td>{problema.impacto}</td>
              <td>{problema.exemplos}</td>
              <td>{problema.frequencia}</td>
              <td>{problema.segmento}</td>
              <td>{problema.gravidade}</td>
              <td>{new Date(problema.created_at).toLocaleString()}</td>
              <td>{new Date(problema.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemsPage;
