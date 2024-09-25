import { useEffect, useState } from 'react';

//componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import InputGroup from '@/components/InputGroupComponent';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

//auxiliares
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
  const [problema, setProblema] = useState<Problema | null>(null);

  //campos
  const [descricao, setDescricao] = useState('');
  const [resolvido, setResolvido] = useState('');
  const [impacto, setImpacto] = useState('');
  const [exemplos, setExemplos] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [segmento, setSegmento] = useState('');
  const [gravidade, setGravidade] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    const fetchProblemas = async () => {
      if (!user || !user.companyId) {
        toast({
          description: 'Usuário não autenticado ou companyId ausente',
          className: 'bg-red-300',
          duration: 4000,
        });
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
          // Se problemas existirem, use o primeiro
          const problemaExistente = data[0];
          setProblema(problemaExistente);
          setDescricao(problemaExistente.descricao);
          setResolvido(problemaExistente.como_resolvido);
          setImpacto(problemaExistente.impacto);
          setExemplos(problemaExistente.exemplos);
          setFrequencia(problemaExistente.frequencia);
          setSegmento(problemaExistente.segmento);
          setGravidade(problemaExistente.gravidade);
        } else {
          // Se não houver problemas, criar um novo
          const { data: novoProblema, error: insertError } = await supabase
            .from('problema')
            .insert([
              {
                empresa_id: user.companyId,
                descricao: '',
                como_resolvido: '',
                impacto: '',
                exemplos: '',
                frequencia: '',
                segmento: '',
                gravidade: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (insertError) {
            throw new Error(insertError.message);
          }

          setProblema(novoProblema);
          setDescricao(novoProblema.descricao);
          setResolvido(novoProblema.como_resolvido);
          setImpacto(novoProblema.impacto);
          setExemplos(novoProblema.exemplos);
          setFrequencia(novoProblema.frequencia);
          setSegmento(novoProblema.segmento);
          setGravidade(novoProblema.gravidade);
        }
      } catch (error) {
        toast({
          description: (error as Error).message,
          className: 'bg-red-300',
          duration: 4000,
        });
      }
    };

    fetchProblemas();
  }, [toast, user]); // Certifique-se de incluir 'user' como dependência

  const handleSave = async () => {
    if (!problema || !problema.id) return;

    try {
      const { error } = await supabase
        .from('problema')
        .update({
          descricao,
          como_resolvido: resolvido,
          impacto,
          exemplos,
          frequencia,
          segmento,
          gravidade,
          updated_at: new Date().toISOString(),
        })
        .eq('id', problema.id);

      if (error) {
        throw new Error(error.message);
      }

      // Atualiza o estado local com a nova descrição
      setProblema((prevProblema) =>
        prevProblema
          ? {
              ...prevProblema,
              descricao,
              como_resolvido: resolvido,
              impacto,
              exemplos,
              frequencia,
              segmento,
              gravidade,
            }
          : null,
      );
      toast({
        description:'Dados salvos com sucesso',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      toast({
        description: (error as Error).message,
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Problema</h1>
      {problema && (
        <>
          <InputGroup
            title="Descrição geral do problema"
            subtitle="Forneça uma visão geral clara e concisa do problema que sua startup está abordando."
            label="Qual é a descrição geral do problema que sua startup visa resolver?"
            value={descricao}
            rows={6}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Forneça uma visão geral do problema que sua startup visa resolver."
            divider
          />
          <InputGroup
            title="Como é resolvido atualmente"
            subtitle="Descreva as soluções existentes que abordam o problema identificado."
            label="Como o problema é resolvido atualmente?"
            value={resolvido}
            rows={6}
            onChange={(e) => setResolvido(e.target.value)}
            placeholder="Descreva as soluções existentes que abordam o problema."
            divider
          />
          <InputGroup
            title="Impacto do problema"
            subtitle="Detalhe os efeitos e as consequências do problema."
            label="Qual é o impacto do problema identificado?"
            value={impacto}
            rows={6}
            onChange={(e) => setImpacto(e.target.value)}
            placeholder="Explique os efeitos e consequências do problema."
            divider
          />
          <InputGroup
            title="Exemplos e casos de uso"
            subtitle="Forneça exemplos práticos e casos de uso que ilustram o problema em diferentes contextos."
            label="Quais são alguns exemplos e casos de uso do problema?"
            value={exemplos}
            rows={6}
            onChange={(e) => setExemplos(e.target.value)}
            placeholder="Forneça exemplos práticos e casos de uso que ilustram o problema."
            divider
          />
          <InputGroup
            title="Frequência e ocorrência do problema"
            subtitle="Explique com que frequência o problema ocorre."
            label="Qual é a frequência e ocorrência do problema?"
            value={frequencia}
            rows={6}
            onChange={(e) => setFrequencia(e.target.value)}
            placeholder="Explique com que frequência o problema ocorre."
            divider
          />
          <InputGroup
            title="Segmento de clientes afetados"
            subtitle="Identifique os diferentes segmentos de clientes que são impactados pelo problema."
            label="Quais segmentos de clientes são afetados pelo problema?"
            value={segmento}
            rows={6}
            onChange={(e) => setSegmento(e.target.value)}
            placeholder="Identifique os diferentes segmentos de clientes afetados pelo problema."
            divider
          />
          <InputGroup
            title="Gravidade do problema"
            subtitle="Avalie a gravidade do problema para os clientes afetados."
            label="Qual é a gravidade do problema para os clientes afetados?"
            value={gravidade}
            rows={6}
            onChange={(e) => setGravidade(e.target.value)}
            placeholder="Avalie a gravidade do problema para os clientes afetados."
            divider
          />
          <Button onClick={handleSave} className="max-w-2xl">
            Salvar
          </Button>
        </>
      )}
      <Toaster />
    </CardPages>
  );
};

export default ProblemsPage;
