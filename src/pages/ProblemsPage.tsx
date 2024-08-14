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
          .eq('empresa_id', user.companyId)
          .single(); // We expect a single problem associated with the company

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setProblema(data);
          setDescricao(data.descricao);
          setResolvido(data.como_resolvido);
          setImpacto(data.impacto);
          setExemplos(data.exemplos);
          setFrequencia(data.frequencia);
          setSegmento(data.segmento);
          setGravidade(data.gravidade);
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
  });

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
            subtitle="Forneça uma visão geral clara e concisa do problema que sua startup está abordando. Inclua detalhes sobre a natureza do problema, quem é afetado por ele e por que é importante resolvê-lo."
            label="Qual é a descrição geral do problema que sua startup visa resolver?"
            value={descricao}
            rows={6}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Forneça uma visão geral do problema que sua startup visa resolver. Ex: 'A falta de moradia acessível em áreas urbanas.'"
            divider
          />
          <InputGroup
            title="Como é resolvido atualmente"
            subtitle="Descreva as soluções existentes que abordam o problema identificado. Isto pode incluir produtos, serviços, tecnologias ou métodos que estão sendo usados atualmente."
            label="Como o problema é resolvido atualmente?"
            value={resolvido}
            rows={6}
            onChange={(e) => setResolvido(e.target.value)}
            placeholder="Descreva as soluções existentes que abordam o problema. Ex: 'Atualmente, o problema é resolvido através de políticas governamentais e ONGs.’"
            divider
          />
          <InputGroup
            title="Impacto do problema"
            subtitle="Detalhe os efeitos e as consequências do problema. Explique como o problema afeta os indivíduos ou organizações envolvidas e quais são as métricas relevantes que podem ser usadas para medir este impacto."
            label="Qual é o impacto do problema identificado?"
            value={impacto}
            rows={6}
            onChange={(e) => setImpacto(e.target.value)}
            placeholder="Explique os efeitos e consequências do problema. Ex: 'A falta de moradia acessível leva a um aumento na população de rua.'"
            divider
          />
          <InputGroup
            title="Exemplos e casos de uso"
            subtitle="Forneça exemplos práticos e casos de uso que ilustram o problema em diferentes contextos. Isso ajuda a visualizar como o problema se manifesta na prática."
            label="Quais são alguns exemplos e casos de uso do problema?"
            value={exemplos}
            rows={6}
            onChange={(e) => setExemplos(e.target.value)}
            placeholder="Forneça exemplos práticos e casos de uso que ilustram o problema. Ex: 'Em São Francisco, muitos trabalhadores de tecnologia não conseguem encontrar moradia acessível perto de seus locais de trabalho.'"
            divider
          />
          <InputGroup
            title="Frequência e ocorrência do problema"
            subtitle="Explique com que frequência o problema ocorre e em quais circunstâncias. Inclua dados ou estatísticas, se disponíveis, para apoiar a frequência do problema."
            label="Qual é a frequência e ocorrência do problema?"
            value={frequencia}
            rows={6}
            onChange={(e) => setFrequencia(e.target.value)}
            placeholder="Explique com que frequência o problema ocorre e em quais circunstâncias. Ex: 'O problema ocorre frequentemente em grandes cidades com alto custo de vida.'"
            divider
          />
          <InputGroup
            title="Segmento de cliente afetados"
            subtitle="Identifique os diferentes segmentos de clientes que são impactados pelo problema. Descreva como cada segmento é afetado e quais são suas principais necessidades e desafios relacionados ao problema."
            label="Quais segmentos de clientes são afetados pelo problema?"
            value={segmento}
            rows={6}
            onChange={(e) => setSegmento(e.target.value)}
            placeholder="Identifique os diferentes segmentos de clientes afetados pelo problema. Ex: 'Trabalhadores de baixa renda, estudantes universitários, e trabalhadores de tecnologia.'"
            divider
          />
          <InputGroup
            title="Gravidade do problema"
            subtitle="Avalie a gravidade do problema para os clientes afetados. Discuta a importância de resolver o problema e quais são as possíveis consequências de não abordá-lo."
            label="Qual é a gravidade do problema para os clientes afetados?"
            value={gravidade}
            rows={6}
            onChange={(e) => setGravidade(e.target.value)}
            placeholder="Avalie a gravidade do problema para os clientes afetados. Ex: 'A falta de moradia acessível resulta em uma qualidade de vida reduzida e problemas de saúde mental.'"
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
