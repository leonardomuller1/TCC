import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import useAuthStore from '@/stores/useAuthStore';

interface Problema {
  empresa_id: string; // Inclua o campo empresa_id aqui
  id: number;
  descricao: string;
  como_resolvido: string;
  impacto: string;
  exemplos: string;
  frequencia: string;
  segmento: string;
  gravidade: string;
}

interface NewProblema {
  empresa_id: string; // Inclua o campo empresa_id aqui
  descricao: string;
  como_resolvido: string;
  impacto: string;
  exemplos: string;
  frequencia: string;
  segmento: string;
  gravidade: string;
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

        if (error && error.code === 'PGRST116') {
          // Cria um novo problema caso nenhum seja encontrado
          const { data: newProblema, error: insertError } = await supabase
            .from('problema')
            .insert({
              empresa_id: user.companyId, // Adiciona empresa_id aqui
              descricao: '',
              como_resolvido: '',
              impacto: '',
              exemplos: '',
              frequencia: '',
              segmento: '',
              gravidade: ''
            })
            .single();

          if (insertError) {
            console.error('Error creating new problema:', insertError);
          } else {
            setProblema(newProblema);
          }
        } else if (data) {
          setProblema(data);
        } else {
          console.error('Error fetching problema:', error);
        }
      }
    };

    fetchProblema();
  }, [user]);

  const updateProblema = async (field: keyof Problema, value: string) => {
    if (problema && user) {
      const updatedProblema = { ...problema, [field]: value };
      setProblema(updatedProblema);

      const { error } = await supabase
        .from('problema')  
        .update({ [field]: value })
        .eq('id', problema.id);

      if (error) {
        console.error('Error updating problema:', error);
      }
    }
  };

  const createProblema = async (newProblema: NewProblema) => {
    if (user) {
      const { data, error } = await supabase
        .from('problema')
        .insert(newProblema) // Passa newProblema diretamente
        .single();

      if (error) {
        console.error('Error creating problema:', error);
      } else {
        setProblema(data);
      }
    }
  };

  return { problema, updateProblema, createProblema };
};

export default useProblema;