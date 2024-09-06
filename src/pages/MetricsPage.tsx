
// Componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import Metrics from './MetricsSubPages/Metrics';
import Tasks from './MetricsSubPages/Tasks';

const MetricsPage = () => {
  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Métricas chaves</h1>
      <Metrics/>
      <h1 className="text-gray-900 font-bold text-2xl">Tarefas e andamento</h1>
      <Tasks/>
    </CardPages>
  );
};

export default MetricsPage;
