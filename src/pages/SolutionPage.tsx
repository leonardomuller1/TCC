import { useEffect, useState } from 'react';

//componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import InputGroup from '@/components/InputGroupComponent';
import Benefits from './SolutionsSubPages/Benefits';
import Features from './SolutionsSubPages/Features';
import CustomerExperience from './SolutionsSubPages/CustomerExperience';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

//auxiliares
import { supabase } from '@/supabaseClient';
import useAuthStore from '@/stores/useAuthStore';

type Solucao = {
  id: number;
  empresa_id: string;
  descricao: string;
  desafios: string;
  frase_curta: string;
  created_at: string;
  updated_at: string;
};

const SolutionPage = () => {
  const { user } = useAuthStore();
  const [solucao, setSolucao] = useState<Solucao | null>(null);

  //campos
  const [descricao, setDescricao] = useState('');
  const [desafios, setDesafios] = useState('');
  const [fraseCurta, setFraseCurta] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchSolucao();
  }, [user]);

  const fetchSolucao = async () => {
    if (!user || !user.companyId) {
      toast({
        description: 'Usuário não autenticado ou companyId ausente',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }
  
    try {
      // Buscar solução existente
      const { data, error } = await supabase
        .from('solucao')
        .select('*')
        .eq('empresa_id', user.companyId)
        .single();
  
      if (error) {
        // Se o erro não for de item não encontrado, trate-o
        if (error.code === 'PGRST116') {
          toast({
            description: 'Nenhuma solução existente foi encontrada.',
            className: 'bg-yellow-300',
            duration: 4000,
          });
        } else {
          throw new Error(error.message);
        }
      }
  
      // Atualiza os estados se a solução já existe
      if (data) {
        setSolucao(data);
        setDescricao(data.descricao);
        setDesafios(data.desafios);
        setFraseCurta(data.frase_curta);
      }
    } catch (error) {
      toast({
        description: (error as Error).message,
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };
  
  const handleSave = async () => {
    if (!solucao || !solucao.id) return;

    try {
      const { error } = await supabase
        .from('solucao')
        .update({
          descricao,
          desafios,
          frase_curta: fraseCurta,
          updated_at: new Date().toISOString(),
        })
        .eq('id', solucao.id);

      if (error) {
        throw new Error(error.message);
      }

      setSolucao((prevSolucao) =>
        prevSolucao
          ? {
              ...prevSolucao,
              descricao,
              desafios,
              frase_curta: fraseCurta,
            }
          : null,
      );
      toast({
        description: 'Dados salvos com sucesso',
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
      <h1 className="text-gray-900 font-bold text-2xl">
        Solução e Proposta de Valor
      </h1>
      {solucao && (
        <>
          <InputGroup
            title="Descrição geral da solução"
            subtitle="Forneça uma visão geral clara e concisa da solução que sua startup está propondo. Inclua detalhes sobre como a solução funciona, quais problemas ela resolve e os principais elementos envolvidos."
            label="Como a solução resolve os problemas existentes?"
            value={descricao}
            rows={6}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Explique como a solução proposta aborda e resolve os problemas existentes. Descreva os mecanismos e processos específicos da solução que contribuem para a resolução eficaz dos problemas."
            divider={false}
          />
          <InputGroup
            label="Quais são os possíveis desafios que podem surgir na implementação da solução e como serão mitigados?"
            value={desafios}
            rows={6}
            onChange={(e) => setDesafios(e.target.value)}
            placeholder="Descreva os desafios e estratégias de mitigação. Ex: 'A integração com sistemas legados pode apresentar desafios, mas será abordada com uma arquitetura modular.'"
            divider
          />

          <Benefits />

          <Features />

          <CustomerExperience />
          
          <InputGroup
            title="Proposta de Valor"
            subtitle={
              <>
                A metodologia 5W2H é uma excelente escolha para estruturar a proposta de valor, pois ajuda a garantir que todos os aspectos importantes sejam abordados de maneira clara e completa.
                <br />
                <br />
                <strong>Metodologia 5W2H</strong>
                <ul>
                  <li>• What (O que): O que é a proposta de valor?</li>
                  <li>• Why (Por que): Por que a proposta de valor é importante? Quais problemas ela resolve?</li>
                  <li>• Who (Quem): Quem se beneficiará com essa proposta de valor?</li>
                  <li>• Where (Onde): Onde essa proposta de valor será implementada ou utilizada?</li>
                  <li>• When (Quando): Quando a proposta de valor será implementada ou estará disponível?</li>
                  <li>• How (Como): Como a proposta de valor será implementada?</li>
                  <li>• How much (Quanto): Quanto custará implementar ou utilizar essa proposta de valor?</li>
                </ul>
              </>
            }
            label="Frase curta"
            value={fraseCurta}
            rows={3}
            onChange={(e) => setFraseCurta(e.target.value)}
            placeholder="Oferecemos uma plataforma de automação empresarial que integra sistemas legados, centraliza dados e utiliza IA para aumentar a eficiência em 20% e reduzir custos operacionais em 15%."
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

export default SolutionPage;
