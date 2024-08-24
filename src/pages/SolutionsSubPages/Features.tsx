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
type Funcionalidade = {
  id: number;
  empresa_id: string;
  titulo: string;
  descricao: string;
  versao_app: string;
  prioridade: string;
  created_at: string;
  updated_at: string;
};

const Features = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([]);
  const [openDialogNewFuncionalidade, setOpenDialogNewFuncionalidade] =
    useState(false);
  const [openDialogEditFuncionalidade, setOpenDialogEditFuncionalidade] =
    useState(false);
  const [newFuncionalidade, setNewFuncionalidade] =
    useState<Partial<Funcionalidade>>({});
  const [selectedFuncionalidade, setSelectedFuncionalidade] =
    useState<Funcionalidade | null>(null);

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
      const { data: funcionalidadeData, error: funcionalidadeError } = await supabase
        .from('funcionalidades')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (funcionalidadeError) throw new Error(funcionalidadeError.message);
      setFuncionalidades(funcionalidadeData || []);
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

  const handleAddFuncionalidade = () => {
    setOpenDialogNewFuncionalidade(true);
  };

  const handleEditFuncionalidade = (rowIndex: number) => {
    const funcionalidade = funcionalidades[rowIndex];
    setSelectedFuncionalidade(funcionalidade);
    setOpenDialogEditFuncionalidade(true);
  };

  const handleSaveNewFuncionalidade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('funcionalidades').insert([
        {
          ...newFuncionalidade,
          empresa_id: user?.companyId,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setFuncionalidades([...funcionalidades, ...data]);
      } else if (data) {
        setFuncionalidades([...funcionalidades, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewFuncionalidade(false);
      toast({
        description: 'Funcionalidade adicionada com sucesso!',
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

  const handleSaveEditFuncionalidade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFuncionalidade) return;
    try {
      const { error } = await supabase
        .from('funcionalidades')
        .update({ ...selectedFuncionalidade })
        .eq('id', selectedFuncionalidade.id);
      if (error) throw error;
      setFuncionalidades(
        funcionalidades.map((funcionalidade) =>
          funcionalidade.id === selectedFuncionalidade.id
            ? selectedFuncionalidade
            : funcionalidade,
        ),
      );
      clearForm();
      setOpenDialogEditFuncionalidade(false);
      toast({
        description: 'Funcionalidade atualizada com sucesso!',
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

  const handleDeleteFuncionalidade = async () => {
    if (!selectedFuncionalidade) return;
    try {
      const { error } = await supabase
        .from('funcionalidades')
        .delete()
        .eq('id', selectedFuncionalidade.id);
      if (error) throw error;
      setFuncionalidades(
        funcionalidades.filter(
          (funcionalidade) => funcionalidade.id !== selectedFuncionalidade.id,
        ),
      );
      clearForm();
      setOpenDialogEditFuncionalidade(false);
      toast({
        description: 'Funcionalidade excluída com sucesso!',
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
    if (openDialogNewFuncionalidade) {
      setNewFuncionalidade((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditFuncionalidade && selectedFuncionalidade) {
      setSelectedFuncionalidade((prev) => prev && { ...prev, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    handleChange({ name, value });
  };

  const clearForm = () => {
    setNewFuncionalidade({});
    setSelectedFuncionalidade(null);
  };

  return (
    <div className="max-w-2xl">
      <h4 className="text-gray-900 text-lg font-semibold">Funcionalidades</h4>
      <h5 className="text-gray-500 text-sm font-normal mb-2">
        Descreva as funcionalidades mais importantes da sua solução. Inclua
        detalhes sobre como essas funcionalidades operam e contribuem para
        resolver os problemas dos usuários. Além disso, classifique-as por
        prioridade e versão do aplicativo.
      </h5>

      <DataTable
        headers={['Título da Funcionalidade']}
        rows={funcionalidades.map((funcionalidade) => [funcionalidade.titulo])}
        onAddClick={handleAddFuncionalidade}
        onOptionsClick={handleEditFuncionalidade}
      />
      <Toaster />

      {/* Modal para adicionar nova funcionalidade */}
      <Dialog
        open={openDialogNewFuncionalidade}
        onOpenChange={setOpenDialogNewFuncionalidade}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Funcionalidade</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar uma nova
              funcionalidade.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewFuncionalidade}>
            <div className="mb-4">
              <Label htmlFor="titulo">Título da Funcionalidade</Label>
              <Input
                type="text"
                id="titulo"
                name="titulo"
                value={newFuncionalidade.titulo || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="descricao">Descrição da Funcionalidade</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={newFuncionalidade.descricao || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange('prioridade', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="versao_app">Versão do App</Label>
              <Input
                type="text"
                id="versao_app"
                name="versao_app"
                value={newFuncionalidade.versao_app || ''}
                onChange={handleChange}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar funcionalidade existente */}
      <Dialog
        open={openDialogEditFuncionalidade}
        onOpenChange={setOpenDialogEditFuncionalidade}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Funcionalidade</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar a funcionalidade.
            </DialogDescription>
          </DialogHeader>
          {selectedFuncionalidade && (
            <form onSubmit={handleSaveEditFuncionalidade}>
              <div className="mb-4">
                <Label htmlFor="titulo">Título da Funcionalidade</Label>
                <Input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={selectedFuncionalidade.titulo || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição da Funcionalidade</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={selectedFuncionalidade.descricao || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange('prioridade', value)
                  }
                  value={selectedFuncionalidade.prioridade}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label htmlFor="versao_app">Versão do App</Label>
                <Input
                  type="text"
                  id="versao_app"
                  name="versao_app"
                  value={selectedFuncionalidade.versao_app || ''}
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteFuncionalidade}
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

export default Features;
