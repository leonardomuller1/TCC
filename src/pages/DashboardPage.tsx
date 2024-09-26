import React, { useState, useEffect } from 'react';
import CardPost from '@/components/CardPostComponent';
import HeaderTopDashboard from '@/components/dashboard/HeaderTopDashboardComponent';
import { supabase } from '@/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import useAuthStore from '@/stores/useAuthStore';

interface Access {
  problema: boolean;
  clientes: boolean;
  solucao: boolean;
  concorrentes: boolean;
  financeiro: boolean;
  andamento: boolean;
}

const DashboardPage: React.FC = () => {
  const [access, setAccess] = useState<Access | null>(null);
  const user = useAuthStore(state => state.user);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccess = async () => {
      if (!user || !user.companyId) {
        console.error('No user or company ID available');
        return;
      }

      if (user.is_master) {
        // Se o usuário é master, definimos todos os acessos como true
        setAccess({
          problema: true,
          clientes: true,
          solucao: true,
          concorrentes: true,
          financeiro: true,
          andamento: true,
        });
      } else {
        // Se não é master, buscamos as permissões normalmente
        const { data, error } = await supabase
          .from('empresas')
          .select('acessos')
          .eq('id', user.companyId)
          .single();

        if (error) {
          toast({
            description: `Erro ao buscar acessos: ${error.message}`,
            className: 'bg-red-300',
            duration: 4000,
          });
        } else if (data?.acessos) {
          setAccess(data.acessos);
        }
      }
    };

    fetchAccess();
  }, [user, toast]);

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  if (!access) {
    return <div>Loading...</div>;
  }

  const cards = [
    {
      title: "Problema",
      link: "/problema",
      alt: "Problema",
      image: "./Problema.png",
      accessKey: 'problema' as keyof Access,
    },
    {
      title: "Solução e proposta de valor",
      link: "/solucao",
      alt: "Solução e proposta de valor",
      image: "./PropostadeValor.png",
      accessKey: 'solucao' as keyof Access,
    },
    {
      title: "Segmento de clientes e Público-alvo",
      link: "/clientes",
      alt: "Segmento de clientes e Público-alvo",
      image: "./segmentodeclientes.png",
      accessKey: 'clientes' as keyof Access,
    },
    {
      title: "Análise de concorrentes",
      link: "/concorrentes",
      alt: "Análise de concorrentes",
      image: "./Analisedeconcorrentes.png",
      accessKey: 'concorrentes' as keyof Access,
    },
    {
      title: "Estrutura de custos e receita",
      link: "/financeiro",
      alt: "Estrutura de custos e receita",
      image: "./EstruturaDeCustos.png",
      accessKey: 'financeiro' as keyof Access,
    },
    {
      title: "Métricas chaves e andamento",
      link: "/andamento",
      alt: "Métricas chaves e andamento",
      image: "./MetricasChaves.png",
      accessKey: 'andamento' as keyof Access,
    },
  ];

  return (
    <>
      <HeaderTopDashboard />
      <div className="bg-white px-4 py-4 flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          {cards.map((card, index) => (
            <CardPost
              key={index}
              title={card.title}
              link={card.link}
              alt={card.alt}
              image={card.image}
              hasAccess={access[card.accessKey]}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;