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

// Tipos
type CustomerExperience = {
  id: number;
  empresa_id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  created_at: string;
  updated_at: string;
};

const CustomerExperience = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [experiences, setExperiences] = useState<CustomerExperience[]>([]);
  const [openDialogNewExperience, setOpenDialogNewExperience] = useState(false);
  const [openDialogEditExperience, setOpenDialogEditExperience] =
    useState(false);
  const [newExperience, setNewExperience] = useState<
    Partial<CustomerExperience>
  >({});
  const [selectedExperience, setSelectedExperience] =
    useState<CustomerExperience | null>(null);

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
      const { data, error } = await supabase
        .from('customer_experiences')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (error) throw error;
      setExperiences(data || []);
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
      const { data, error } = await supabase
        .from('customer_experiences')
        .insert([
          {
            ...newExperience,
            empresa_id: user.companyId,
          },
        ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setExperiences([...experiences, ...data]);
      } else if (data) {
        setExperiences([...experiences, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewExperience(false);
      toast({
        description: 'Experiência do cliente adicionada com sucesso!',
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
          experience.id === selectedExperience.id
            ? selectedExperience
            : experience,
        ),
      );
      clearForm();
      setOpenDialogEditExperience(false);
      toast({
        description: 'Experiência do cliente atualizada com sucesso!',
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

  const handleDeleteExperience = async () => {
    if (!selectedExperience) return;
    try {
      const { error } = await supabase
        .from('customer_experiences')
        .delete()
        .eq('id', selectedExperience.id);

      if (error) throw error;

      setExperiences(
        experiences.filter(
          (experience) => experience.id !== selectedExperience.id,
        ),
      );
      clearForm();
      setOpenDialogEditExperience(false);
      toast({
        description: 'Experiência do cliente excluída com sucesso!',
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
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: string },
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    if (openDialogNewExperience) {
      setNewExperience((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditExperience && selectedExperience) {
      setSelectedExperience((prev) => prev && { ...prev, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    handleChange({ name, value });
  };

  const clearForm = () => {
    setNewExperience({});
    setSelectedExperience(null);
  };

  return (
    <div className="max-w-2xl">
      <h4 className="text-gray-900 text-lg font-semibold">
        Experiência do Cliente
      </h4>
      <h5 className="text-gray-500 text-sm font-normal mb-4">
        Descreva as necessidades, medos e desejos mais importantes da sua
        solução para o seu cliente. Inclua detalhes sobre como essas
        experiências operam e contribuem para resolver os problemas dos
        usuários.
      </h5>

      <DataTable
        headers={['Título', 'Categoria']}
        rows={experiences.map((experience) => [
          experience.titulo,
          experience.categoria ? (
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
            </span>
          ) : null,
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
              Preencha as informações abaixo para adicionar uma nova experiência
              do cliente.
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
                onValueChange={(value) =>
                  handleSelectChange('categoria', value)
                }
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  onValueChange={(value) =>
                    handleSelectChange('categoria', value)
                  }
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
                >
                  Excluir
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerExperience;
