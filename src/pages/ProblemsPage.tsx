import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import useAuthStore from '@/stores/useAuthStore';

interface Problema {
  empresa_id: string;
  id: number;
  descricao: string;
  como_resolvido: string;
  impacto: string;
  exemplos: string;
  frequencia: string;
  segmento: string;
  gravidade: string;
  created_at: string;
  updated_at: string;
}

const useProblema = () => {
  const [problema, setProblema] = useState<Problema | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProblema = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('problema')
          .select('*')
          .eq('empresa_id', user.companyId)
          .single();

        if (error) {
          console.error('Erro ao buscar o problema:', error);
        } else if (data) {
          console.log('Problema encontrado:', data);
          setProblema(data);
        }
      }
    };

    fetchProblema();
  }, [user]);

  const createProblema = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('problema')
        .insert({
          empresa_id: user.companyId,
          descricao: 'Descrição de teste',
          como_resolvido: 'Solução de teste',
          impacto: 'Impacto de teste',
          exemplos: 'Exemplo de teste',
          frequencia: 'Frequência de teste',
          segmento: 'Segmento de teste',
          gravidade: 'Gravidade de teste',
        })
        .single();

      if (error) {
        console.error('Erro ao criar o problema:', error);
      } else {
        console.log('Problema criado:', data);
        setProblema(data);
      }
    }
  };

  return { problema, createProblema };
};

const ProblemsPage = () => {
  const { problema, createProblema } = useProblema();

  useEffect(() => {
    if (!problema) {
      createProblema();
    }
  }, [problema, createProblema]);

  return (
    <div>
      <h1>Testando Problemas</h1>
      {problema ? (
        <pre>{JSON.stringify(problema, null, 2)}</pre>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default ProblemsPage;
