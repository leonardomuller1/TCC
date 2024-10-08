import {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useCallback,
} from 'react';

// Componentes
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
import { PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import FiltersSegmentos from './FiltersSegmentos';

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
  relations: string[]; // Nova coluna para relações
  created_at: string;
  updated_at: string;
};

const Segmentos = () => {
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
  const [relations, setRelations] = useState<string[]>([]);
  const [newRelation, setNewRelation] = useState<string>('');
  const [filterName, setFilterName] = useState<string>(''); // Estado para o filtro de nome
  const [filterVaiAtender, setFilterVaiAtender] = useState<string>('none'); // Estado para o filtro de "Vai Atender"
  const [filterTipoCliente, setFilterTipoCliente] = useState<string>('');

  const fetchData = useCallback(async () => {
    if (!user || !user.companyId) {
      toast({
        description: 'Usuário não autenticado ou companyId ausente',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    try {
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
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSegmento = () => {
    setOpenDialogNewSegmento(true);
  };

  const handleEditSegmento = (rowIndex: number) => {
    const segmento = segmentosClientes[rowIndex];
    setSelectedSegmento(segmento);
    setRelations(segmento.relations || []);
    setOpenDialogEditSegmento(true);
  };

  const handleSaveNewSegmento = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSegmento.nome || !newSegmento.tipo_cliente) {
      toast({
        description: 'Preencha todos os campos obrigatórios!',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }
    try {
      const { data, error } = await supabase.from('segmentoclientes').insert([
        {
          ...newSegmento,
          empresa_id: user?.companyId,
          relations,
          vai_atender:
            newSegmento.vai_atender !== undefined
              ? newSegmento.vai_atender
              : false, // Garantir que vai_atender seja enviado
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setSegmentosClientes([...segmentosClientes, ...data]);
      } else if (data) {
        setSegmentosClientes([...segmentosClientes, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewSegmento(false);
      toast({
        description: 'Segmento de Clientes adicionado com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      toast({
        description: 'Verifique os campos, e tente novamente!',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const handleSaveEditSegmento = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSegmento) return;
    if (!selectedSegmento.nome || !selectedSegmento.tipo_cliente) {
      toast({
        description: 'Preencha todos os campos obrigatórios!',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('segmentoclientes')
        .update({
          ...selectedSegmento,
          relations,
          vai_atender:
            selectedSegmento.vai_atender !== undefined
              ? selectedSegmento.vai_atender
              : false, // Garantir que vai_atender seja enviado
        })
        .eq('id', selectedSegmento.id);
      if (error) throw error;
      setSegmentosClientes(
        segmentosClientes.map((seg) =>
          seg.id === selectedSegmento.id ? selectedSegmento : seg,
        ),
      );
      clearForm();
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
    setRelations([]);
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
      clearForm();
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

  const clearForm = () => {
    setNewSegmento({});
    setSelectedSegmento(null);
    setRelations([]);
    setNewRelation('');
  };

  const addRelation = () => {
    if (newRelation.trim() !== '') {
      setRelations((prev) => {
        const updatedRelations = [...prev, newRelation];
        if (selectedSegmento) {
          // Atualiza as relações no segmento selecionado
          setSelectedSegmento((prevSegmento) => {
            if (prevSegmento) {
              return {
                ...prevSegmento,
                relations: updatedRelations,
              };
            }
            return prevSegmento; // Retorna o segmento anterior se for null
          });
        }
        return updatedRelations;
      });
      setNewRelation('');
    }
  };

  const removeRelation = (index: number) => {
    setRelations((prev) => {
      const updatedRelations = prev.filter((_, i) => i !== index);
      if (selectedSegmento) {
        // Atualiza as relações no segmento selecionado
        setSelectedSegmento((prevSegmento) => {
          if (prevSegmento) {
            return {
              ...prevSegmento,
              relations: updatedRelations,
            };
          }
          return prevSegmento; // Retorna o segmento anterior se for null
        });
      }
      return updatedRelations;
    });
  };

  // Filtrar os segmentos com base no nome
  const filteredSegmentos = segmentosClientes.filter((segmento) => {
    const nameMatch = (segmento.nome || '')
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const tipoMatch = (segmento.tipo_cliente || '')
      .toLowerCase()
      .includes(filterTipoCliente.toLowerCase());
    const atenderMatch =
      filterVaiAtender === 'none' ||
      segmento.vai_atender.toString() === filterVaiAtender;

    return nameMatch && tipoMatch && atenderMatch;
  });

  return (
    <>
      <FiltersSegmentos
        filterName={filterName}
        setFilterName={setFilterName}
        filterTipoCliente={filterTipoCliente}
        setFilterTipoCliente={setFilterTipoCliente}
        filterVaiAtender={filterVaiAtender}
        setFilterVaiAtender={setFilterVaiAtender}
        handleAddSegmento={handleAddSegmento}
      />
      <DataTable
        headers={['Nome', 'Área', 'Tipo de Cliente', 'Vai Atender', 'Relações']}
        rows={filteredSegmentos.map((segmento) => [
          segmento.nome,
          segmento.area,
          segmento.tipo_cliente,
          segmento.vai_atender ? 'Sim' : 'Não',
          segmento.relations ? segmento.relations.join(', ') : '', // Verificação adicionada
        ])}
        onAddClick={handleAddSegmento}
        onOptionsClick={handleEditSegmento}
        hidePlusIcon={true}
      />
      <Toaster />

      <Dialog
        open={openDialogNewSegmento}
        onOpenChange={setOpenDialogNewSegmento}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Segmento</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo segmento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewSegmento}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="mb-4">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    value={newSegmento.nome || ''}
                    onChange={handleChange}
                    required
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
              </div>
              <div>
                <div className="mb-4">
                  <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                  <Input
                    type="text"
                    id="tipo_cliente"
                    name="tipo_cliente"
                    value={newSegmento.tipo_cliente || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="vai_atender">Vai Atender</Label>
                  <Select
                    onValueChange={(value) =>
                      handleChange({ name: 'vai_atender', value })
                    }
                    value={newSegmento.vai_atender?.toString() || 'false'}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
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
              </div>
              <div>
                <div className="mb-4">
                  <Label htmlFor="relation">Adicionar Relação</Label>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      id="relation"
                      name="relation"
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                    />
                    <button type="button" onClick={addRelation}>
                      <PlusCircledIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="relationList">Lista de Relações</Label>
                  <ul>
                    {relations.map((relation, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center mb-2"
                      >
                        <span>{relation}</span>
                        <button onClick={() => removeRelation(index)}>
                          <TrashIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDialogEditSegmento}
        onOpenChange={setOpenDialogEditSegmento}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Segmento</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar o segmento.
            </DialogDescription>
          </DialogHeader>
          {selectedSegmento && (
            <form onSubmit={handleSaveEditSegmento}>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
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
                </div>
                <div>
                  <div className="mb-4">
                    <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                    <Input
                      type="text"
                      id="tipo_cliente"
                      name="tipo_cliente"
                      value={selectedSegmento.tipo_cliente || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="vai_atender">Vai Atender</Label>
                    <Select
                      onValueChange={(value) =>
                        handleChange({ name: 'vai_atender', value })
                      }
                      value={
                        selectedSegmento.vai_atender?.toString() || 'false'
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
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
                </div>
                <div>
                  <div className="mb-4">
                    <Label htmlFor="relation">Adicionar Relação</Label>
                    <div className="flex gap-4">
                      <Input
                        type="text"
                        id="relation"
                        name="relation"
                        value={newRelation}
                        onChange={(e) => setNewRelation(e.target.value)}
                      />
                      <button type="button" onClick={addRelation}>
                        <PlusCircledIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="relationList">Lista de Relações</Label>
                    <ul>
                      {relations.map((relation, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center mb-2"
                        >
                          <span>{relation}</span>
                          <button onClick={() => removeRelation(index)}>
                            <TrashIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
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
    </>
  );
};

export default Segmentos;
