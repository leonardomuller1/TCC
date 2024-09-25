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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Auxiliares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';
import { PlusCircledIcon } from '@radix-ui/react-icons';

// Tipos
type PublicoAlvo = {
  id: number;
  empresa_id: string;
  segmento_cliente: string;
  segmento: string;
  faixa_etaria: string;
  escolaridade: string;
  localizacao: string;
  cargo: string;
  porte_da_empresa: string;
  setor_de_atuacao: string;
  habitos_de_consumo: string;
  papel_de_compra: string;
  tarefas_e_responsabilidades: string;
  created_at: string;
  updated_at: string;
};

const PublicoAlvo = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [publicosAlvo, setPublicosAlvo] = useState<PublicoAlvo[]>([]);
  const [openDialogNewPublico, setOpenDialogNewPublico] = useState(false);
  const [openDialogEditPublico, setOpenDialogEditPublico] = useState(false);
  const [newPublico, setNewPublico] = useState<Partial<PublicoAlvo>>({});
  const [selectedPublico, setSelectedPublico] = useState<PublicoAlvo | null>(
    null,
  );
  const [segmentosCliente, setSegmentosCliente] = useState<
    { id: number; nome: string }[]
  >([]);
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
      const { data: publicoAlvoData, error: publicoAlvoError } = await supabase
        .from('publicoalvo')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (publicoAlvoError) throw new Error(publicoAlvoError.message);
      setPublicosAlvo(publicoAlvoData || []);
    } catch (error) {
      toast({
        description: (error as Error).message,
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  }, [user, toast]);

  const fetchSegmentosCliente = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('segmentoclientes')
        .select('id, nome');
      if (error) throw new Error(error.message);
      setSegmentosCliente(data || []);
    } catch (error) {
      toast({
        description: (error as Error).message,
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    fetchSegmentosCliente();
  }, [fetchData, fetchSegmentosCliente]);

  // Função para criar um mapeamento de IDs para nomes
  const createSegmentoMap = (segmentos: { id: number; nome: string }[]) => {
    const map: { [key: number]: string } = {};
    segmentos.forEach((segmento) => {
      map[segmento.id] = segmento.nome;
    });
    return map;
  };

  // Crie o mapeamento após a obtenção dos dados
  const segmentoMap = createSegmentoMap(segmentosCliente);

  const handleAddPublico = () => {
    clearForm();
    fetchSegmentosCliente();
    setOpenDialogNewPublico(true);
  };

  const handleEditPublico = (rowIndex: number) => {
    const publico = publicosAlvo[rowIndex];
    fetchSegmentosCliente();
    setSelectedPublico(publico);
    setOpenDialogEditPublico(true);
  };

  const handleSaveNewPublico = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('publicoalvo').insert([
        {
          ...newPublico,
          empresa_id: user?.companyId,
          segmento_cliente: parseInt(newPublico.segmento_cliente || '', 10), // Certifica-se de que o valor é um número
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setPublicosAlvo([...publicosAlvo, ...data]);
      } else if (data) {
        setPublicosAlvo([...publicosAlvo, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewPublico(false);
      toast({
        description: 'Público-alvo adicionado com sucesso!',
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

  const handleSaveEditPublico = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPublico) return;
    try {
      const { error } = await supabase
        .from('publicoalvo')
        .update({
          ...selectedPublico,
          segmento_cliente: parseInt(
            selectedPublico.segmento_cliente || '',
            10,
          ), // Certifica-se de que o valor é um número
        })
        .eq('id', selectedPublico.id);
      if (error) throw error;
      setPublicosAlvo(
        publicosAlvo.map((publico) =>
          publico.id === selectedPublico.id ? selectedPublico : publico,
        ),
      );
      clearForm();
      setOpenDialogEditPublico(false);
      toast({
        description: 'Público-alvo atualizado com sucesso!',
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

  const handleDeletePublico = async () => {
    if (!selectedPublico) return;
    try {
      const { error } = await supabase
        .from('publicoalvo')
        .delete()
        .eq('id', selectedPublico.id);
      if (error) throw error;
      setPublicosAlvo(
        publicosAlvo.filter((publico) => publico.id !== selectedPublico.id),
      );
      clearForm();
      setOpenDialogEditPublico(false);
      toast({
        description: 'Público-alvo excluído com sucesso!',
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
    if (openDialogNewPublico) {
      setNewPublico((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditPublico && selectedPublico) {
      setSelectedPublico((prev) => prev && { ...prev, [name]: value });
    }
  };

  const clearForm = () => {
    setNewPublico({});
    setSelectedPublico(null);
  };

  const filteredPublicosAlvo = publicosAlvo.filter((publico) => {
    const segmentoNome = segmentoMap[parseInt(publico.segmento_cliente, 10)] || '';
    const nameMatch = segmentoNome.toLowerCase().includes(filterName.toLowerCase());
    return nameMatch;
  });

  return (
    <>
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Filtrar por segmento de cliente"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="h-10"
        />
        <Button onClick={handleAddPublico} className="gap-2">
          <PlusCircledIcon className="text-primary-foreground" />
          Adicionar canal
        </Button>
      </div>
      <DataTable
        headers={['Segmento Cliente', 'Faixa Etária', 'Localização', 'Cargo']}
        rows={filteredPublicosAlvo.map((publico) => [
          segmentoMap[parseInt(publico.segmento_cliente, 10)] || 'Desconhecido', // Usando o nome do segmento
          publico.faixa_etaria,
          publico.localizacao,
          publico.cargo,
        ])}
        onAddClick={handleAddPublico}
        onOptionsClick={handleEditPublico}
        hidePlusIcon={true}
      />

      <Toaster />

      {/* Modal para adicionar novo público-alvo */}
      <Dialog
        open={openDialogNewPublico}
        onOpenChange={setOpenDialogNewPublico}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Público-Alvo</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo
              público-alvo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewPublico}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="segmento_cliente">Segmento Cliente</Label>
                <Select
                  name="segmento_cliente"
                  value={newPublico.segmento_cliente || ''}
                  onValueChange={(value) =>
                    handleChange({ name: 'segmento_cliente', value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {segmentosCliente.map((segmento) => (
                        <SelectItem
                          key={segmento.id}
                          value={segmento.id.toString()} // Convertido para string
                        >
                          {segmento.nome}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="faixa_etaria">Faixa Etária</Label>
                <Input
                  type="text"
                  id="faixa_etaria"
                  name="faixa_etaria"
                  value={newPublico.faixa_etaria || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="escolaridade">Escolaridade</Label>
                <Input
                  type="text"
                  id="escolaridade"
                  name="escolaridade"
                  value={newPublico.escolaridade || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  type="text"
                  id="localizacao"
                  name="localizacao"
                  value={newPublico.localizacao || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={newPublico.cargo || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="porte_da_empresa">Porte da Empresa</Label>
                <Input
                  type="text"
                  id="porte_da_empresa"
                  name="porte_da_empresa"
                  value={newPublico.porte_da_empresa || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="setor_de_atuacao">Setor de Atuação</Label>
                <Input
                  type="text"
                  id="setor_de_atuacao"
                  name="setor_de_atuacao"
                  value={newPublico.setor_de_atuacao || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="habitos_de_consumo">Hábitos de Consumo</Label>
                <Input
                  type="text"
                  id="habitos_de_consumo"
                  name="habitos_de_consumo"
                  value={newPublico.habitos_de_consumo || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="papel_de_compra">Papel de Compra</Label>
                <Input
                  type="text"
                  id="papel_de_compra"
                  name="papel_de_compra"
                  value={newPublico.papel_de_compra || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="tarefas_e_responsabilidades">
                  Tarefas e Responsabilidades
                </Label>
                <Textarea
                  id="tarefas_e_responsabilidades"
                  name="tarefas_e_responsabilidades"
                  value={newPublico.tarefas_e_responsabilidades || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar público-alvo existente */}
      <Dialog
        open={openDialogEditPublico}
        onOpenChange={setOpenDialogEditPublico}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Público-Alvo</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar o público-alvo.
            </DialogDescription>
          </DialogHeader>
          {selectedPublico && (
            <form onSubmit={handleSaveEditPublico}>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="segmento_cliente">Segmento Cliente</Label>
                  <Select
                    name="segmento_cliente"
                    value={selectedPublico.segmento_cliente || ''} // Assegura que o valor é uma string
                    onValueChange={(value) =>
                      handleChange({ name: 'segmento_cliente', value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {segmentosCliente.map((segmento) => (
                          <SelectItem
                            key={segmento.id}
                            value={segmento.id.toString()} // Convertido para string
                          >
                            {segmento.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="faixa_etaria">Faixa Etária</Label>
                  <Input
                    type="text"
                    id="faixa_etaria"
                    name="faixa_etaria"
                    value={selectedPublico.faixa_etaria || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="escolaridade">Escolaridade</Label>
                  <Input
                    type="text"
                    id="escolaridade"
                    name="escolaridade"
                    value={selectedPublico.escolaridade || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    type="text"
                    id="localizacao"
                    name="localizacao"
                    value={selectedPublico.localizacao || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={selectedPublico.cargo || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="porte_da_empresa">Porte da Empresa</Label>
                  <Input
                    type="text"
                    id="porte_da_empresa"
                    name="porte_da_empresa"
                    value={selectedPublico.porte_da_empresa || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="setor_de_atuacao">Setor de Atuação</Label>
                  <Input
                    type="text"
                    id="setor_de_atuacao"
                    name="setor_de_atuacao"
                    value={selectedPublico.setor_de_atuacao || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="habitos_de_consumo">Hábitos de Consumo</Label>
                  <Input
                    type="text"
                    id="habitos_de_consumo"
                    name="habitos_de_consumo"
                    value={selectedPublico.habitos_de_consumo || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="papel_de_compra">Papel de Compra</Label>
                  <Input
                    type="text"
                    id="papel_de_compra"
                    name="papel_de_compra"
                    value={selectedPublico.papel_de_compra || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="tarefas_e_responsabilidades">
                    Tarefas e Responsabilidades
                  </Label>
                  <Textarea
                    id="tarefas_e_responsabilidades"
                    name="tarefas_e_responsabilidades"
                    value={selectedPublico.tarefas_e_responsabilidades || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Editar</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeletePublico}
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

export default PublicoAlvo;
