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
import { PlusCircledIcon } from '@radix-ui/react-icons';

// Tipos
type Canal = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  tipo_de_canal: string;
  objetivo: string;
  created_at: string;
  updated_at: string;
};

const Canais = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [canais, setCanais] = useState<Canal[]>([]);
  const [openDialogNewCanal, setOpenDialogNewCanal] = useState(false);
  const [openDialogEditCanal, setOpenDialogEditCanal] = useState(false);
  const [newCanal, setNewCanal] = useState<Partial<Canal>>({});
  const [selectedCanal, setSelectedCanal] = useState<Canal | null>(null);
  const [filterName, setFilterName] = useState<string>('');

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
      const { data: canalData, error: canalError } = await supabase
        .from('canal')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (canalError) throw new Error(canalError.message);
      setCanais(canalData || []);
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

  const handleAddCanal = () => {
    setOpenDialogNewCanal(true);
  };

  const handleEditCanal = (rowIndex: number) => {
    const canal = canais[rowIndex];
    setSelectedCanal(canal);
    setOpenDialogEditCanal(true);
  };

  const handleSaveNewCanal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('canal').insert([
        {
          ...newCanal,
          empresa_id: user?.companyId,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setCanais([...canais, ...data]);
      } else if (data) {
        setCanais([...canais, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewCanal(false);
      toast({
        description: 'Canal adicionado com sucesso!',
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

  const handleSaveEditCanal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCanal) return;
    try {
      const { error } = await supabase
        .from('canal')
        .update({ ...selectedCanal })
        .eq('id', selectedCanal.id);
      if (error) throw error;
      setCanais(
        canais.map((canal) =>
          canal.id === selectedCanal.id ? selectedCanal : canal,
        ),
      );
      clearForm();
      setOpenDialogEditCanal(false);
      toast({
        description: 'Canal atualizado com sucesso!',
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

  const handleDeleteCanal = async () => {
    if (!selectedCanal) return;
    try {
      const { error } = await supabase
        .from('canal')
        .delete()
        .eq('id', selectedCanal.id);
      if (error) throw error;
      setCanais(canais.filter((canal) => canal.id !== selectedCanal.id));
      clearForm();
      setOpenDialogEditCanal(false);
      toast({
        description: 'Canal excluído com sucesso!',
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
    if (openDialogNewCanal) {
      setNewCanal((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditCanal && selectedCanal) {
      setSelectedCanal((prev) => prev && { ...prev, [name]: value });
    }
  };

  const clearForm = () => {
    setNewCanal({});
    setSelectedCanal(null);
  };

  const filteredCanais = canais.filter((canais) => {
    const nameMatch = (canais.nome || '')
      .toLowerCase()
      .includes(filterName.toLowerCase());
    return nameMatch;
  });

  return (
    <>
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Filtrar por nome"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="h-10"
        />
        <Button onClick={handleAddCanal} className="gap-2">
          <PlusCircledIcon className="text-primary-foreground" />
          Adicionar canal
        </Button>
      </div>
      <DataTable
        headers={['Nome', 'Tipo de Canal', 'Objetivo']}
        rows={filteredCanais.map((canal) => [
          canal.nome,
          canal.tipo_de_canal,
          canal.objetivo,
        ])}
        onAddClick={handleAddCanal}
        onOptionsClick={handleEditCanal}
        hidePlusIcon={true}
      />
      <Toaster />

      {/* Modal para adicionar novo canal */}
      <Dialog open={openDialogNewCanal} onOpenChange={setOpenDialogNewCanal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Canal</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo canal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewCanal}>
            <div className="mb-4">
              <Label htmlFor="nome">Nome</Label>
              <Input
                type="text"
                id="nome"
                name="nome"
                value={newCanal.nome || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={newCanal.descricao || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="tipo_de_canal">Tipo de Canal</Label>
              <Input
                type="text"
                id="tipo_de_canal"
                name="tipo_de_canal"
                value={newCanal.tipo_de_canal || ''}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="objetivo">Objetivo</Label>
              <Input
                type="text"
                id="objetivo"
                name="objetivo"
                value={newCanal.objetivo || ''}
                onChange={handleChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar canal existente */}
      <Dialog open={openDialogEditCanal} onOpenChange={setOpenDialogEditCanal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Canal</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar o canal.
            </DialogDescription>
          </DialogHeader>
          {selectedCanal && (
            <form onSubmit={handleSaveEditCanal}>
              <div className="mb-4">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={selectedCanal.nome || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={selectedCanal.descricao || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="tipo_de_canal">Tipo de Canal</Label>
                <Input
                  type="text"
                  id="tipo_de_canal"
                  name="tipo_de_canal"
                  value={selectedCanal.tipo_de_canal || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="objetivo">Objetivo</Label>
                <Input
                  type="text"
                  id="objetivo"
                  name="objetivo"
                  value={selectedCanal.objetivo || ''}
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Editar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteCanal}
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

export default Canais;
