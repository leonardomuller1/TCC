
// Componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import Segmentos from './ClientsPages/Segmentos';
import PublicoAlvo from './ClientsPages/PublicoAlvo';
import Canais from './ClientsPages/Canal';

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
