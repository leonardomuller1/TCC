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

// Auxiliares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';
import { PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';

// Tipos
type Metrica = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  area: string;
  valores: { mes: string; valor: number }[];
  created_at: string;
  updated_at: string;
};

const Metrics = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [openDialogNewMetrica, setOpenDialogNewMetrica] = useState(false);
  const [openDialogEditMetrica, setOpenDialogEditMetrica] = useState(false);
  const [newMetrica, setNewMetrica] = useState<Partial<Metrica>>({});
  const [selectedMetrica, setSelectedMetrica] = useState<Metrica | null>(null);
  const [valores, setValores] = useState<{ mes: string; valor: number }[]>([]);
  const [newValor, setNewValor] = useState<{ mes: string; valor: number }>({
    mes: '',
    valor: 0,
  });
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
      const { data: metricaData, error: metricaError } = await supabase
        .from('metricas')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (metricaError) throw new Error(metricaError.message);
      setMetricas(metricaData || []);
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

  const handleAddMetrica = () => {
    clearForm(); // Limpa o formulário e os valores antes de abrir o modal

    setOpenDialogNewMetrica(true);
  };

  const handleEditMetrica = (rowIndex: number) => {
    const metrica = metricas[rowIndex];
    setSelectedMetrica(metrica);
    setValores(metrica.valores || []);
    setOpenDialogEditMetrica(true);
  };

  const handleSaveNewMetrica = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verificar se o campo "nome" está vazio
    if (!newMetrica.nome || newMetrica.nome.trim() === '') {
      toast({
        description: 'O campo nome é obrigatório',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('metricas').insert([
        {
          nome: newMetrica.nome || '', // Nome é obrigatório
          descricao: newMetrica.descricao || '', // Valor padrão vazio para campos opcionais
          area: newMetrica.area || '', // Valor padrão vazio para campos opcionais
          empresa_id: user?.companyId,
          valores,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setMetricas([...metricas, ...data]);
      } else if (data) {
        setMetricas([...metricas, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewMetrica(false);
      toast({
        description: 'Métrica adicionada com sucesso!',
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

  const handleSaveEditMetrica = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMetrica) return;
    try {
      const { error } = await supabase
        .from('metricas')
        .update({ ...selectedMetrica, valores })
        .eq('id', selectedMetrica.id);
      if (error) throw error;
      
      // Atualiza o estado local imediatamente
      setMetricas((prevMetricas) =>
        prevMetricas.map((met) =>
          met.id === selectedMetrica.id ? { ...selectedMetrica, valores } : met
        )
      );
      
      clearForm();
      setOpenDialogEditMetrica(false);
      toast({
        description: 'Métrica atualizada com sucesso!',
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

  const handleDeleteMetrica = async () => {
    if (!selectedMetrica) return;
    try {
      const { error } = await supabase
        .from('metricas')
        .delete()
        .eq('id', selectedMetrica.id);
      if (error) throw error;
      setMetricas(metricas.filter((met) => met.id !== selectedMetrica.id));
      clearForm();
      setOpenDialogEditMetrica(false);
      toast({
        description: 'Métrica excluída com sucesso!',
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
    if (openDialogNewMetrica) {
      setNewMetrica((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditMetrica && selectedMetrica) {
      setSelectedMetrica((prev) => prev && { ...prev, [name]: value });
    }
  };

  const clearForm = () => {
    setNewMetrica({});
    setSelectedMetrica(null);
    setValores([]);
    setNewValor({ mes: '', valor: 0 });
  };

  const addValor = () => {
    setValores((prev) => [...prev, newValor]);
    setNewValor({ mes: '', valor: 0 });
  };

  const removeValor = (index: number) => {
    setValores((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredMetrics = metricas.filter((metricas) => {
    const nameMatch = (metricas.nome || '')
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
        <Button onClick={handleAddMetrica} className="gap-2">
          <PlusCircledIcon className="text-primary-foreground" />
          Adicionar métrica
        </Button>
      </div>
      <DataTable
        headers={['Nome', 'Área', 'Valores']}
        rows={filteredMetrics.map((metrica) => [
          metrica.nome,
          metrica.area,
          metrica.valores
            ? metrica.valores
                .map((valor) => `${valor.mes} : ${valor.valor}`)
                .join(', ')
            : '',
        ])}
        onAddClick={handleAddMetrica}
        onOptionsClick={handleEditMetrica}
        hidePlusIcon={true}
      />
      <Toaster />

      {/* Modal para adicionar nova métrica */}
      <Dialog
        open={openDialogNewMetrica}
        onOpenChange={setOpenDialogNewMetrica}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Métrica</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar uma nova métrica.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewMetrica}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="mb-4">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    value={newMetrica.nome || ''}
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
                    value={newMetrica.descricao || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="area">Área</Label>
                  <Input
                    type="text"
                    id="area"
                    name="area"
                    value={newMetrica.area || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <Label htmlFor="valorList">Valores</Label>
                    <button
                      type="button"
                      onClick={addValor}
                      className="ml-2 flex items-center justify-center"
                    >
                      <PlusCircledIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                  <ul>
                    {valores.map((valor, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center mb-2"
                      >
                        <Input
                          type="text"
                          value={valor.mes}
                          onChange={(e) => {
                            const updatedValores = [...valores];
                            updatedValores[index].mes = e.target.value;
                            setValores(updatedValores);
                          }}
                          className="w-1/2"
                        />
                        <Input
                          type="number"
                          value={valor.valor}
                          onChange={(e) => {
                            const updatedValores = [...valores];
                            updatedValores[index].valor = Number(
                              e.target.value,
                            );
                            setValores(updatedValores);
                          }}
                          className="w-1/2 ml-2"
                        />
                        <button onClick={() => removeValor(index)}>
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

      {/* Modal para editar métrica existente */}
      <Dialog
        open={openDialogEditMetrica}
        onOpenChange={setOpenDialogEditMetrica}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Métrica</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar a métrica.
            </DialogDescription>
          </DialogHeader>
          {selectedMetrica && (
            <form onSubmit={handleSaveEditMetrica}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="mb-4">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      type="text"
                      id="nome"
                      name="nome"
                      value={selectedMetrica.nome || ''}
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
                      value={selectedMetrica.descricao || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="area">Área</Label>
                    <Input
                      type="text"
                      id="area"
                      name="area"
                      value={selectedMetrica.area || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center">
                      <Label htmlFor="valorList">Valores</Label>
                      <button
                        type="button"
                        onClick={addValor}
                        className="ml-2 flex items-center justify-center"
                      >
                        <PlusCircledIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <ul>
                      {valores.map((valor, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center mb-2"
                        >
                          <Input
                            type="text"
                            value={valor.mes}
                            onChange={(e) => {
                              const updatedValores = [...valores];
                              updatedValores[index].mes = e.target.value;
                              setValores(updatedValores);
                            }}
                            className="w-1/2"
                          />
                          <Input
                            type="number"
                            value={valor.valor}
                            onChange={(e) => {
                              const updatedValores = [...valores];
                              updatedValores[index].valor = Number(
                                e.target.value,
                              );
                              setValores(updatedValores);
                            }}
                            className="w-1/2 ml-2"
                          />
                          <button onClick={() => removeValor(index)}>
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
                  onClick={handleDeleteMetrica}
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

export default Metrics;