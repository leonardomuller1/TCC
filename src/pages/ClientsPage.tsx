import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

// Componentes
import CardPages from '@/components/dashboard/CardPagesComponent';
import DataTable from '@/components/TableComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Auxiliares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';

// Tipos
type SegmentoClientes = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  area: string;
  tipo_cliente: string;
  vai_atender: boolean;
  justificativa: string;
  created_at: string;
  updated_at: string;
};

const ClientsPage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [segmentosClientes, setSegmentosClientes] = useState<SegmentoClientes[]>([]);
  const [openDialogNewSegmento, setOpenDialogNewSegmento] = useState(false);
  const [openDialogEditSegmento, setOpenDialogEditSegmento] = useState(false);
  const [newSegmento, setNewSegmento] = useState<Partial<SegmentoClientes>>({});
  const [selectedSegmento, setSelectedSegmento] = useState<SegmentoClientes | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.companyId) {
        toast({
          description: 'Usuário não autenticado ou companyId ausente',
          className: 'bg-red-300',
          duration: 4000,
        });
        return;
      }

      try {
        // Buscar dados de SegmentoClientes
        const { data: segmentoData, error: segmentoError } = await supabase
          .from('segmentoclientes')
          .select('*')
          .eq('empresa_id', user.companyId);

        if (segmentoError) throw new Error(segmentoError.message);
        setSegmentosClientes(segmentoData || []);

      } catch (error) {
        toast({
          description: (error as Error).message,
          className: 'bg-red-300',
          duration: 4000,
        });
      }
    };

    fetchData();
  }, [user, toast]);

  const handleAddSegmento = () => {
    setOpenDialogNewSegmento(true);
  };

  const handleEditSegmento = (rowIndex: number) => {
    const segmento = segmentosClientes[rowIndex];
    setSelectedSegmento(segmento);
    setOpenDialogEditSegmento(true);
  };

  const handleSaveNewSegmento = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('segmentoclientes').insert([
        {
          ...newSegmento,
          empresa_id: user?.companyId,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setSegmentosClientes([...segmentosClientes, ...data]);
      } else if (data) {
        setSegmentosClientes([...segmentosClientes, data]);
      }

      setOpenDialogNewSegmento(false);
      toast({
        description: 'Segmento de Clientes adicionado com sucesso!',
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

  const handleSaveEditSegmento = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSegmento) return;
    try {
      const { error } = await supabase
        .from('segmentoclientes')
        .update({ ...selectedSegmento })
        .eq('id', selectedSegmento.id);
      if (error) throw error;
      setSegmentosClientes(
        segmentosClientes.map((seg) =>
          seg.id === selectedSegmento.id ? selectedSegmento : seg
        )
      );
      setOpenDialogEditSegmento(false);
      toast({
        description: 'Segmento de Clientes atualizado com sucesso!',
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

  const handleDeleteSegmento = async () => {
    if (!selectedSegmento) return;
    try {
      const { error } = await supabase
        .from('segmentoclientes')
        .delete()
        .eq('id', selectedSegmento.id);
      if (error) throw error;
      setSegmentosClientes(segmentosClientes.filter((seg) => seg.id !== selectedSegmento.id));
      setOpenDialogEditSegmento(false);
      toast({
        description: 'Segmento de Clientes excluído com sucesso!',
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (openDialogNewSegmento) {
      setNewSegmento((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditSegmento && selectedSegmento) {
      setSelectedSegmento((prev) => prev && { ...prev, [name]: value });
    }
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Segmento de Clientes</h1>
      <DataTable
        headers={['Nome', 'Descrição']}
        rows={segmentosClientes.map((segmento) => [segmento.nome, segmento.descricao])}
        onAddClick={handleAddSegmento}
        onOptionsClick={handleEditSegmento}
      />
      <Toaster />

      {/* Modal para adicionar novo segmento */}
      <Dialog open={openDialogNewSegmento} onOpenChange={setOpenDialogNewSegmento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Segmento</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo segmento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewSegmento}>
            <div className="mb-4">
              <Label htmlFor="nome">Nome</Label>
              <Input
                type="text"
                id="nome"
                name="nome"
                value={newSegmento.nome || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                type="text"
                id="descricao"
                name="descricao"
                value={newSegmento.descricao || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="area">Área</Label>
              <Input
                type="text"
                id="area"
                name="area"
                value={newSegmento.area || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
              <select
                id="tipo_cliente"
                name="tipo_cliente"
                value={newSegmento.tipo_cliente || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md"
              >
                <option value="">Selecione o tipo de cliente</option>
                <option value="Individual">Individual</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
            <div className="mb-4">
              <Label htmlFor="vai_atender">Vai Atender</Label>
              <select
                id="vai_atender"
                name="vai_atender"
                value={newSegmento.vai_atender ? 'Sim' : 'Não'}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="mb-4">
              <Label htmlFor="justificativa">Justificativa</Label>
              <textarea
                id="justificativa"
                name="justificativa"
                value={newSegmento.justificativa || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar Segmento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar segmento existente */}
      <Dialog open={openDialogEditSegmento} onOpenChange={setOpenDialogEditSegmento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Segmento</DialogTitle>
            <DialogDescription>
              Edite as informações do segmento abaixo.
            </DialogDescription>
          </DialogHeader>
          {selectedSegmento && (
            <form onSubmit={handleSaveEditSegmento}>
              <div className="mb-4">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={selectedSegmento.nome}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={selectedSegmento.descricao}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="area">Área</Label>
                <Input
                  type="text"
                  id="area"
                  name="area"
                  value={selectedSegmento.area}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                <select
                  id="tipo_cliente"
                  name="tipo_cliente"
                  value={selectedSegmento.tipo_cliente}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md"
                >
                  <option value="Individual">Individual</option>
                  <option value="Empresa">Empresa</option>
                </select>
              </div>
              <div className="mb-4">
                <Label htmlFor="vai_atender">Vai Atender</Label>
                <select
                  id="vai_atender"
                  name="vai_atender"
                  value={selectedSegmento.vai_atender ? 'Sim' : 'Não'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
              <div className="mb-4">
                <Label htmlFor="justificativa">Justificativa</Label>
                <textarea
                  id="justificativa"
                  name="justificativa"
                  value={selectedSegmento.justificativa}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md"
                />
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleDeleteSegmento} className="bg-red-500 hover:bg-red-700">
                  Excluir Segmento
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </CardPages>
  );
};

export default ClientsPage;