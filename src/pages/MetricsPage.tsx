
// Componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import Metrics from './MetricsSubPages/Metrics';
import PublicoAlvo from './ClientsSubPages/PublicoAlvo';
import Canais from './ClientsSubPages/Canal';

const MetricsPage = () => {
  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Métricas chaves</h1>
      <Metrics/>
      <h1 className="text-gray-900 font-bold text-2xl">Público-Alvo</h1>
      <PublicoAlvo/>
      <h1 className="text-gray-900 font-bold text-2xl">Canal</h1>
      <Canais/>
    </CardPages>
  );
};

export default MetricsPage;
