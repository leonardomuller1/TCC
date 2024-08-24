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

// Auxiliares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';

// Tipos
type Beneficio = {
  id: number;
  empresa_id: string;
  titulo: string;
  descricao: string;
  diferenciais_competitivos: string;
  created_at: string;
  updated_at: string;
};

const Benefits = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [openDialogNewBeneficio, setOpenDialogNewBeneficio] = useState(false);
  const [openDialogEditBeneficio, setOpenDialogEditBeneficio] = useState(false);
  const [newBeneficio, setNewBeneficio] = useState<Partial<Beneficio>>({});
  const [selectedBeneficio, setSelectedBeneficio] = useState<Beneficio | null>(
    null,
  );

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
      const { data: beneficioData, error: beneficioError } = await supabase
        .from('beneficios')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (beneficioError) throw new Error(beneficioError.message);
      setBeneficios(beneficioData || []);
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

  const handleAddBeneficio = () => {
    setOpenDialogNewBeneficio(true);
  };

  const handleEditBeneficio = (rowIndex: number) => {
    const beneficio = beneficios[rowIndex];
    setSelectedBeneficio(beneficio);
    setOpenDialogEditBeneficio(true);
  };

  const handleSaveNewBeneficio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('beneficios').insert([
        {
          ...newBeneficio,
          empresa_id: user?.companyId,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setBeneficios([...beneficios, ...data]);
      } else if (data) {
        setBeneficios([...beneficios, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewBeneficio(false);
      toast({
        description: 'Benefício adicionado com sucesso!',
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

  const handleSaveEditBeneficio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBeneficio) return;
    try {
      const { error } = await supabase
        .from('beneficios')
        .update({ ...selectedBeneficio })
        .eq('id', selectedBeneficio.id);
      if (error) throw error;
      setBeneficios(
        beneficios.map((beneficio) =>
          beneficio.id === selectedBeneficio.id ? selectedBeneficio : beneficio,
        ),
      );
      clearForm();
      setOpenDialogEditBeneficio(false);
      toast({
        description: 'Benefício atualizado com sucesso!',
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

  const handleDeleteBeneficio = async () => {
    if (!selectedBeneficio) return;
    try {
      const { error } = await supabase
        .from('beneficios')
        .delete()
        .eq('id', selectedBeneficio.id);
      if (error) throw error;
      setBeneficios(
        beneficios.filter((beneficio) => beneficio.id !== selectedBeneficio.id),
      );
      clearForm();
      setOpenDialogEditBeneficio(false);
      toast({
        description: 'Benefício excluído com sucesso!',
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
    if (openDialogNewBeneficio) {
      setNewBeneficio((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditBeneficio && selectedBeneficio) {
      setSelectedBeneficio((prev) => prev && { ...prev, [name]: value });
    }
  };

  const clearForm = () => {
    setNewBeneficio({});
    setSelectedBeneficio(null);
  };

  return (
    <div className="max-w-2xl">
      <h4 className="text-gray-900 text-lg font-semibold">
        Benefícios e Vantagens
      </h4>
      <h5 className="text-gray-500 text-sm font-normal mb-2">
        Descreva os principais benefícios e vantagens que sua solução oferece.
        Inclua detalhes sobre como esses benefícios agregam valor aos usuários e
        diferenciam sua solução da concorrência.
      </h5>

      <DataTable
        headers={['Título do Benefício']}
        rows={beneficios.map((beneficio) => [beneficio.titulo])}
        onAddClick={handleAddBeneficio}
        onOptionsClick={handleEditBeneficio}
      />
      <Toaster />

      {/* Modal para adicionar novo benefício */}
      <Dialog
        open={openDialogNewBeneficio}
        onOpenChange={setOpenDialogNewBeneficio}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Benefício</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo benefício.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewBeneficio}>
            <div className="mb-4">
              <Label htmlFor="titulo">Título do Benefício</Label>
              <Input
                type="text"
                id="titulo"
                name="titulo"
                value={newBeneficio.titulo || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="descricao">Descrição do Benefício</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={newBeneficio.descricao || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="diferenciais_competitivos">
                Diferenciais Competitivos
              </Label>
              <Textarea
                id="diferenciais_competitivos"
                name="diferenciais_competitivos"
                value={newBeneficio.diferenciais_competitivos || ''}
                onChange={handleChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar benefício existente */}
      <Dialog
        open={openDialogEditBeneficio}
        onOpenChange={setOpenDialogEditBeneficio}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Benefício</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar o benefício.
            </DialogDescription>
          </DialogHeader>
          {selectedBeneficio && (
            <form onSubmit={handleSaveEditBeneficio}>
              <div className="mb-4">
                <Label htmlFor="titulo">Título do Benefício</Label>
                <Input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={selectedBeneficio.titulo || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição do Benefício</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={selectedBeneficio.descricao || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="diferenciais_competitivos">
                  Diferenciais Competitivos
                </Label>
                <Textarea
                  id="diferenciais_competitivos"
                  name="diferenciais_competitivos"
                  value={selectedBeneficio.diferenciais_competitivos || ''}
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteBeneficio}
                >
                  Excluir
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <div className="h-px w-full bg-gray-200 mt-2"></div>
    </div>
  );
};

export default Benefits;
