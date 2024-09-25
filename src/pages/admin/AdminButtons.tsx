import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EditarAcessoDialog from './EditAcess';

function AdminButtons({ empresaId }: { empresaId: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-1">
      <Button variant="outline" onClick={() => navigate('/admin')} className='mr-1'>
        Painel Admin
      </Button>
      <EditarAcessoDialog empresaId={empresaId} />
      <Button variant="outline" onClick={() => navigate('/export-data')}>Exportar Dados
      </Button>
    </div>
  );
}

export default AdminButtons;