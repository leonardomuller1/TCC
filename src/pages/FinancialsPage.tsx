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

const categories = {
  entrada: [
    'Vendas de Produtos',
    'Serviços Prestados',
    'Rendimentos de Investimentos',
    'Comissões Recebidas',
    'Aluguéis Recebidos',
    'Receitas de Consultoria',
    'Subvenções Governamentais',
    'Venda de Ativos',
  ],
  saida: [
    'Despesas Operacionais',
    'Folha de Pagamento',
    'Impostos',
    'Despesas com Fornecedores',
    'Manutenção de Equipamentos',
    'Marketing e Publicidade',
    'Aluguel de Espaço',
    'Despesas de Transporte',
    'Despesas com Tecnologia',
  ],
};


const FinancialsPage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [registrosFinanceiros, setRegistrosFinanceiros] = useState<
    RegistroFinanceiro[]
  >([]);
  const [openDialogNewRegistro, setOpenDialogNewRegistro] = useState(false);
  const [openDialogEditRegistro, setOpenDialogEditRegistro] = useState(false);
  const [newRegistro, setNewRegistro] = useState<Partial<RegistroFinanceiro>>(
    {},
  );
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroFinanceiro | null>(null);

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

    // Validação da data
    // Validação da data
    const dataAtual = new Date();
    const dataRegistro = new Date(newRegistro.data || '');
    const dataMinima = new Date(dataAtual);
    const dataMaxima = new Date(dataAtual);
    dataMinima.setFullYear(dataMinima.getFullYear() - 5); // 5 anos atrás
    dataMaxima.setFullYear(dataMaxima.getFullYear() + 5); // 5 anos à frente

    if (dataRegistro < dataMinima || dataRegistro > dataMaxima) {
      toast({
        description:
          'A data deve estar dentro do intervalo de 5 anos antes ou depois da data atual.',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

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
        description: 'Preencha todos os campos são obrigatórios!',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const handleSaveEditRegistro = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validação da data
    if (!selectedRegistro) return;
    const dataAtual = new Date();
    const dataRegistro = new Date(selectedRegistro.data || '');
    const dataLimite = new Date(
      dataAtual.setFullYear(dataAtual.getFullYear() - 5),
    );

    if (dataRegistro < dataLimite || dataRegistro > new Date()) {
      toast({
        description: 'A data deve estar dentro dos últimos 5 anos.',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

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

  // Formatar o valor para Real
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">
        Estrutura de custos e receita
      </h1>
      <DataTable
        headers={['Nome', 'Tipo', 'Categoria', 'Data', 'Valor']}
        rows={registrosFinanceiros.map((registro) => [
          registro.nome,
          registro.tipo === 'entrada' ? 'Entrada' : 'Saída',
          registro.categoria,
          new Date(registro.data).toLocaleDateString(),
          <span
            className={
              registro.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
            }
          >
            {formatarValor(registro.valor)}
          </span>,
        ])}
        onAddClick={handleAddRegistro}
        onOptionsClick={handleEditRegistro}
      />

      {/* Modal para adicionar registro */}
      <Dialog
        open={openDialogNewRegistro}
        onOpenChange={setOpenDialogNewRegistro}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Registro</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo registro financeiro.
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
                onValueChange={(value) => handleSelectChange('tipo', value)}
                required
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
              <Select
                value={newRegistro.categoria || ''}
                onValueChange={(value) =>
                  handleSelectChange('categoria', value)
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(newRegistro.tipo === 'entrada'
                      ? categories.entrada
                      : categories.saida
                    ).map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                variant="secondary"
                onClick={() => setOpenDialogNewRegistro(false)}
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
              Edite as informações do registro selecionado.
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
                onValueChange={(value) => handleSelectChange('tipo', value)}
                required
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
              <Select
                value={selectedRegistro?.categoria || ''}
                onValueChange={(value) =>
                  handleSelectChange('categoria', value)
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(selectedRegistro?.tipo === 'entrada'
                      ? categories.entrada
                      : categories.saida
                    ).map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                variant="destructive"
                onClick={handleDeleteRegistro}
              >
                Excluir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </CardPages>
  );
};

export default FinancialsPage;
