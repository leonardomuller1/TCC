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
<<<<<<< HEAD

// Tipos
type CustomerExperience = {
  id: number;
  empresa_id: string;
  titulo: string;
  descricao: string;
  categoria: string;
=======
import { PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';

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
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
  created_at: string;
  updated_at: string;
};

<<<<<<< HEAD
const CustomerExperience = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [experiences, setExperiences] = useState<CustomerExperience[]>([]);
  const [openDialogNewExperience, setOpenDialogNewExperience] = useState(false);
  const [openDialogEditExperience, setOpenDialogEditExperience] = useState(false);
  const [newExperience, setNewExperience] = useState<Partial<CustomerExperience>>({});
  const [selectedExperience, setSelectedExperience] = useState<CustomerExperience | null>(null);
=======
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
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd

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
<<<<<<< HEAD
      const { data, error } = await supabase
        .from('customer_experiences')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (error) throw error;
      setExperiences(data || []);
=======
      const { data: segmentoData, error: segmentoError } = await supabase
        .from('segmentoclientes')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (segmentoError) throw new Error(segmentoError.message);
      setSegmentosClientes(segmentoData || []);
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
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

<<<<<<< HEAD
  const handleAddExperience = () => {
    setOpenDialogNewExperience(true);
  };

  const handleEditExperience = (rowIndex: number) => {
    const experience = experiences[rowIndex];
    setSelectedExperience(experience);
    setOpenDialogEditExperience(true);
  };

  const handleSaveNewExperience = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.companyId) {
      toast({
        description: 'Usuário não autenticado ou companyId ausente',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('customer_experiences').insert([
        {
          ...newExperience,
          empresa_id: user.companyId,
=======
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
    try {
      const { data, error } = await supabase.from('segmentoclientes').insert([
        {
          ...newSegmento,
          empresa_id: user?.companyId,
          relations,
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
<<<<<<< HEAD
        setExperiences([...experiences, ...data]);
      } else if (data) {
        setExperiences([...experiences, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewExperience(false);
      toast({
        description: 'Experiência do cliente adicionada com sucesso!',
=======
        setSegmentosClientes([...segmentosClientes, ...data]);
      } else if (data) {
        setSegmentosClientes([...segmentosClientes, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewSegmento(false);
      toast({
        description: 'Segmento de Clientes adicionado com sucesso!',
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
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

<<<<<<< HEAD
  const handleSaveEditExperience = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedExperience) return;

    try {
      const { error } = await supabase
        .from('customer_experiences')
        .update({ 
          titulo: selectedExperience.titulo,
          descricao: selectedExperience.descricao,
          categoria: selectedExperience.categoria,
        })
        .eq('id', selectedExperience.id);

      if (error) throw error;

      setExperiences(
        experiences.map((experience) =>
          experience.id === selectedExperience.id ? selectedExperience : experience
        )
      );
      clearForm();
      setOpenDialogEditExperience(false);
      toast({
        description: 'Experiência do cliente atualizada com sucesso!',
=======
  const handleSaveEditSegmento = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSegmento) return;
    try {
      const { error } = await supabase
        .from('segmentoclientes')
        .update({ ...selectedSegmento, relations })
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
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
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

<<<<<<< HEAD
  const handleDeleteExperience = async () => {
    if (!selectedExperience) return;
    try {
      const { error } = await supabase
        .from('customer_experiences')
        .delete()
        .eq('id', selectedExperience.id);

      if (error) throw error;

      setExperiences(
        experiences.filter((experience) => experience.id !== selectedExperience.id)
      );
      clearForm();
      setOpenDialogEditExperience(false);
      toast({
        description: 'Experiência do cliente excluída com sucesso!',
=======
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
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
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
<<<<<<< HEAD
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    if (openDialogNewExperience) {
      setNewExperience((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditExperience && selectedExperience) {
      setSelectedExperience((prev) => prev && { ...prev, [name]: value });
=======
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { name: string; value: string },
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    if (openDialogNewSegmento) {
      setNewSegmento((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditSegmento && selectedSegmento) {
      setSelectedSegmento((prev) => prev && { ...prev, [name]: value });
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    handleChange({ name, value });
  };

  const clearForm = () => {
<<<<<<< HEAD
    setNewExperience({});
    setSelectedExperience(null);
  };

  return (
    <div className="max-w-2xl">
      <h4 className="text-gray-900 text-lg font-semibold">Experiência do Cliente</h4>
      <h5 className="text-gray-500 text-sm font-normal mb-4">
        Descreva as necessidades, medos e desejos mais importantes da sua solução para o seu cliente. 
        Inclua detalhes sobre como essas experiências operam e contribuem para resolver os problemas dos usuários.
      </h5>

      <DataTable
        headers={['Título', 'Categoria']}
        rows={experiences.map((experience) => [
          experience.titulo,
          <span
            key={experience.id}
            className={`px-2 py-1 rounded ${
              experience.categoria === 'Necessidade'
                ? 'bg-blue-200 text-blue-800'
                : experience.categoria === 'Medo'
                ? 'bg-red-200 text-red-800'
                : 'bg-green-200 text-green-800'
            }`}
          >
            {experience.categoria}
          </span>,
        ])}
        onAddClick={handleAddExperience}
        onOptionsClick={handleEditExperience}
      />

      <Toaster />

      {/* Modal para adicionar nova experiência */}
      <Dialog
        open={openDialogNewExperience}
        onOpenChange={setOpenDialogNewExperience}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Experiência do Cliente</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar uma nova experiência do cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewExperience}>
            <div className="mb-4">
              <Label htmlFor="titulo">Título</Label>
              <Input
                type="text"
                id="titulo"
                name="titulo"
                value={newExperience.titulo || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={newExperience.descricao || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                onValueChange={(value) => handleSelectChange('categoria', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Necessidade">Necessidade</SelectItem>
                    <SelectItem value="Medo">Medo</SelectItem>
                    <SelectItem value="Desejo">Desejo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
=======
    setNewSegmento({});
    setSelectedSegmento(null);
    setRelations([]);
    setNewRelation('');
  };

  const addRelation = () => {
    if (newRelation.trim() !== '') {
      setRelations((prev) => [...prev, newRelation]);
      setNewRelation('');
    }
  };

  const removeRelation = (index: number) => {
    setRelations((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <DataTable
        headers={['Nome', 'Área', 'Tipo de Cliente', 'Vai Atender', 'Relações']}
        rows={segmentosClientes.map((segmento) => [
          segmento.nome,
          segmento.area,
          segmento.tipo_cliente,
          segmento.vai_atender ? 'Sim' : 'Não',
          segmento.relations ? segmento.relations.join(', ') : '', // Verificação adicionada
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Segmento</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo segmento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewSegmento}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
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
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

<<<<<<< HEAD
      {/* Modal para editar experiência existente */}
      <Dialog
        open={openDialogEditExperience}
        onOpenChange={setOpenDialogEditExperience}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Experiência do Cliente</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar a experiência do cliente.
            </DialogDescription>
          </DialogHeader>
          {selectedExperience && (
            <form onSubmit={handleSaveEditExperience}>
              <div className="mb-4">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={selectedExperience.titulo || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={selectedExperience.descricao || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('categoria', value)}
                  value={selectedExperience.categoria}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Necessidade">Necessidade</SelectItem>
                      <SelectItem value="Medo">Medo</SelectItem>
                      <SelectItem value="Desejo">Desejo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteExperience}
=======
      {/* Modal para editar segmento existente */}
      <Dialog
        open={openDialogEditSegmento}
        onOpenChange={setOpenDialogEditSegmento}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Segmento</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar o segmento.
            </DialogDescription>
          </DialogHeader>
          {selectedSegmento && (
            <form onSubmit={handleSaveEditSegmento}>
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                <Button type="submit">Editar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteSegmento}
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
                >
                  Excluir
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
<<<<<<< HEAD
    </div>
  );
};

export default CustomerExperience;
=======
    </>
  );
};

export default Segmentos;
>>>>>>> 9748eebe13dd5e3d3d50e154420433972de9a4dd
