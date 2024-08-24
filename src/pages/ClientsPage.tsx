
// Componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import Segmentos from './ClientsSubPages/Segmentos';
import PublicoAlvo from './ClientsSubPages/PublicoAlvo';
import Canais from './ClientsSubPages/Canal';

const ClientsPage = () => {
  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Segmento de Clientes</h1>
      <Segmentos/>
      <h1 className="text-gray-900 font-bold text-2xl">Público-Alvo</h1>
    <PublicoAlvo/>
      <h1 className="text-gray-900 font-bold text-2xl">Canal</h1>
      <Canais/>
    </CardPages>
  );
};

export default ClientsPage;
