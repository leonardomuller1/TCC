//componentes
import CardPost from '@/components/CardPostComponent';
import HeaderTopDashboard from '@/components/dashboard/HeaderTopDashboardComponent';

const DashboardPage: React.FC = () => {
  return (
    <>
      <HeaderTopDashboard />
      <div className="bg-white px-36 py-4 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          <CardPost
            title="Problema"
            link="/problema"
            alt="Problema"
            image="./Problema.png"
          />
          <CardPost
            title="Segmento de clientes e Público-alvo"
            link="/clientes"
            alt="Segmento de clientes e Público-alvo"
            image="./segmentodeclientes.png"
          />
          <CardPost
            title="Solução e proposta de valor"
            link="/solucao"
            alt="Solução e proposta de valor"
            image="./PropostadeValor.png"
          />
          <CardPost
            title="Análise de concorrentes"
            link="/concorrentes"
            alt="Análise de concorrentes"
            image="./Analisedeconcorrentes.png"
          />
          <CardPost
            title="Estrutura de custos e receita"
            link="/financeiro"
            alt="Estrutura de custos e receita"
            image="./EstruturaDeCustos.png"
          />
          <CardPost
            title="Métricas chaves e andamento"
            link="/andamento"
            alt="Métricas chaves e andamento"
            image="./MetricasChaves.png"
          />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
