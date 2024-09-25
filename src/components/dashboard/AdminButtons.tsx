import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function AdminButtons() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/admin')}>
        Painel Admin
      </Button>
      <Button variant="outline" onClick={() => navigate('/edit-access')}>
        Editar Acessos
      </Button>
      <Button variant="outline" onClick={() => navigate('/export-data')}>
        Exportar Dados
      </Button>
    </div>
  );
}

export default AdminButtons;
