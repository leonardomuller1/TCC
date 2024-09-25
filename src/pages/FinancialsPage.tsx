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
import CardPages from '@/components/dashboard/CardPagesComponent';

// Tipos
type RegistroFinanceiro = {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  data: string;
  valor: number;
  created_at: string;
  updated_at: string;
};

const FinancialsPage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [registrosFinanceiros, setRegistrosFinanceiros] = useState<RegistroFinanceiro[]>([]);
  const [openDialogNewRegistro, setOpenDialogNewRegistro] = useState(false);
  const [openDialogEditRegistro, setOpenDialogEditRegistro] = useState(false);
  const [newRegistro, setNewRegistro] = useState<Partial<RegistroFinanceiro>>({});
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroFinanceiro | null>(null);

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
      const { data: registrosData, error: registrosError } = await supabase
        .from('financeiros')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (registrosError) throw new Error(registrosError.message);
      setRegistrosFinanceiros(registrosData || []);
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

  const handleAddRegistro = () => {
    setOpenDialogNewRegistro(true);
  };

  const handleEditRegistro = (rowIndex: number) => {
    const registro = registrosFinanceiros[rowIndex];
    setSelectedRegistro(registro);
    setOpenDialogEditRegistro(true);
  };

  const handleSaveNewRegistro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('financeiros').insert([
        {
          ...newRegistro,
          empresa_id: user?.companyId,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setRegistrosFinanceiros([...registrosFinanceiros, ...data]);
      } else if (data) {
        setRegistrosFinanceiros([...registrosFinanceiros, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewRegistro(false);
      toast({
        description: 'Registro financeiro adicionado com sucesso!',
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

  const handleSaveEditRegistro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRegistro) return;
    try {
      const { error } = await supabase
        .from('financeiros')
        .update({ ...selectedRegistro })
        .eq('id', selectedRegistro.id);
      if (error) throw error;
      setRegistrosFinanceiros(
        registrosFinanceiros.map((reg) =>
          reg.id === selectedRegistro.id ? selectedRegistro : reg,
        ),
      );
      clearForm();
      setOpenDialogEditRegistro(false);
      toast({
        description: 'Registro financeiro atualizado com sucesso!',
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

  const handleDeleteRegistro = async () => {
    if (!selectedRegistro) return;
    try {
      const { error } = await supabase
        .from('financeiros')
        .delete()
        .eq('id', selectedRegistro.id);
      if (error) throw error;
      setRegistrosFinanceiros(
        registrosFinanceiros.filter((reg) => reg.id !== selectedRegistro.id),
      );
      clearForm();
      setOpenDialogEditRegistro(false);
      toast({
        description: 'Registro financeiro excluído com sucesso!',
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
    if (openDialogNewRegistro) {
      setNewRegistro((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditRegistro && selectedRegistro) {
      setSelectedRegistro((prev) => prev && { ...prev, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    handleChange({ name, value });
  };

  const clearForm = () => {
    setNewRegistro({});
    setSelectedRegistro(null);
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Estrutura de custos e receita</h1>
      <DataTable
        headers={['Nome', 'Tipo', 'Categoria', 'Data', 'Valor']}
        rows={registrosFinanceiros.map((registro) => [
          registro.nome,
          registro.tipo === 'entrada' ? 'Entrada' : 'Saída',
          registro.categoria,
          new Date(registro.data).toLocaleDateString(),
          registro.valor.toFixed(2),
        ])}
        onAddClick={handleAddRegistro}
        onOptionsClick={handleEditRegistro}
      />
      <Toaster />

      {/* Modal para adicionar novo registro */}
      <Dialog
        open={openDialogNewRegistro}
        onOpenChange={setOpenDialogNewRegistro}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Registro</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo registro financeiro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewRegistro}>
            <div className="mb-4">
              <Label htmlFor="nome">Nome</Label>
              <Input
                type="text"
                id="nome"
                name="nome"
                value={newRegistro.nome || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={newRegistro.tipo || ''}
                onValueChange={(value) =>
                  handleSelectChange('tipo', value)
                }
                required={true}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                type="text"
                id="categoria"
                name="categoria"
                value={newRegistro.categoria || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="data">Data</Label>
              <Input
                type="date"
                id="data"
                name="data"
                value={newRegistro.data || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="valor">Valor</Label>
              <Input
                type="number"
                step="0.01"
                id="valor"
                name="valor"
                value={newRegistro.valor || ''}
                onChange={handleChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearForm();
                  setOpenDialogNewRegistro(false);
                }}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar registro */}
      <Dialog
        open={openDialogEditRegistro}
        onOpenChange={setOpenDialogEditRegistro}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Atualize as informações abaixo para editar o registro financeiro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEditRegistro}>
            <div className="mb-4">
              <Label htmlFor="nome">Nome</Label>
              <Input
                type="text"
                id="nome"
                name="nome"
                value={selectedRegistro?.nome || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={selectedRegistro?.tipo || ''}
                onValueChange={(value) =>
                  handleSelectChange('tipo', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                type="text"
                id="categoria"
                name="categoria"
                value={selectedRegistro?.categoria || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="data">Data</Label>
              <Input
                type="date"
                id="data"
                name="data"
                value={selectedRegistro?.data || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="valor">Valor</Label>
              <Input
                type="number"
                step="0.01"
                id="valor"
                name="valor"
                value={selectedRegistro?.valor || ''}
                onChange={handleChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearForm();
                  setOpenDialogEditRegistro(false);
                }}
              >
                Cancelar
              </Button>
              {selectedRegistro && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteRegistro}
                >
                  Excluir
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </CardPages>
  );
};

export default FinancialsPage;
