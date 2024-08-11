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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const [segmentosClientes, setSegmentosClientes] = useState<
    SegmentoClientes[]
  >([]);
  const [openDialogNewSegmento, setOpenDialogNewSegmento] = useState(false);
  const [openDialogEditSegmento, setOpenDialogEditSegmento] = useState(false);
  const [newSegmento, setNewSegmento] = useState<Partial<SegmentoClientes>>({});
  const [selectedSegmento, setSelectedSegmento] =
    useState<SegmentoClientes | null>(null);

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
          seg.id === selectedSegmento.id ? selectedSegmento : seg,
        ),
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
      setSegmentosClientes(
        segmentosClientes.filter((seg) => seg.id !== selectedSegmento.id),
      );
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
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { name: string; value: string },
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    if (openDialogNewSegmento) {
      setNewSegmento((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditSegmento && selectedSegmento) {
      setSelectedSegmento((prev) => prev && { ...prev, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    handleChange({ name, value });
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Segmento de Clientes</h1>
      <DataTable
        headers={['Nome', 'Descrição']}
        rows={segmentosClientes.map((segmento) => [
          segmento.nome,
          segmento.descricao,
        ])}
        onAddClick={handleAddSegmento}
        onOptionsClick={handleEditSegmento}
      />
      <Toaster />

      {/* Modal para adicionar novo segmento */}
      <Dialog
        open={openDialogNewSegmento}
        onOpenChange={setOpenDialogNewSegmento}
      >
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
              <Select
                onValueChange={(value) =>
                  handleSelectChange('tipo_cliente', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="B2B">
                      B2B (Empresa para Empresa)
                    </SelectItem>
                    <SelectItem value="B2C">
                      B2C (Empresa para Consumidor)
                    </SelectItem>
                    <SelectItem value="B2G">
                      B2G (Empresa para Governo)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="vai_atender">Vai Atender</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange('vai_atender', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sim ou Não" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea
                id="justificativa"
                name="justificativa"
                value={newSegmento.justificativa || ''}
                onChange={handleChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar segmento existente */}
      <Dialog
        open={openDialogEditSegmento}
        onOpenChange={setOpenDialogEditSegmento}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Segmento</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar o segmento.
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
                  value={selectedSegmento.nome || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={selectedSegmento.descricao || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="area">Área</Label>
                <Input
                  type="text"
                  id="area"
                  name="area"
                  value={selectedSegmento.area || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange('tipo_cliente', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="B2B">
                        B2B (Empresa para Empresa)
                      </SelectItem>
                      <SelectItem value="B2C">
                        B2C (Empresa para Consumidor)
                      </SelectItem>
                      <SelectItem value="B2G">
                        B2G (Empresa para Governo)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label htmlFor="vai_atender">Vai Atender</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange('vai_atender', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sim ou Não" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea
                  id="justificativa"
                  name="justificativa"
                  value={selectedSegmento.justificativa || ''}
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Editar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteSegmento}
                >
                  Excluir
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </CardPages>
  );
};

export default ClientsPage;
