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
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';
import FiltersFinancials from './FinancialsSubPage/FiltersFinancials';

// Tipos
type RegistroFinanceiro = {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  data: string;
  valor: number;
  pagamento_efetuado: boolean;
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
  const [newRegistro, setNewRegistro] = useState<Partial<RegistroFinanceiro>>({
    pagamento_efetuado: false,
  });
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroFinanceiro | null>(null);

  const [totalMovimentacoes, setTotalMovimentacoes] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);

  const [filterName, setFilterName] = useState('');
  const [filterTipo, setFilterTipo] = useState('none');
  const [filterDataInicial, setFilterDataInicial] = useState('');
  const [filterDataFinal, setFilterDataFinal] = useState('');

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

      // Calcular totais
      let entradas = 0;
      let saidas = 0;
      registrosData?.forEach((registro) => {
        if (registro.tipo === 'entrada') {
          entradas += registro.valor;
        } else {
          saidas += registro.valor;
        }
      });
      setTotalEntradas(entradas);
      setTotalSaidas(saidas);
      setTotalMovimentacoes(entradas + saidas);
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

  const filteredRegistros = registrosFinanceiros.filter((registro) => {
    const nameMatch = filterName === '' || (registro.nome || '').toLowerCase().includes(filterName.toLowerCase());
    const tipoMatch = filterTipo === 'none' || (registro.tipo || '').toLowerCase() === filterTipo.toLowerCase();
    const dataMatch = (!filterDataInicial || new Date(registro.data) >= new Date(filterDataInicial)) &&
                      (!filterDataFinal || new Date(registro.data) <= new Date(filterDataFinal));

    return nameMatch && tipoMatch && dataMatch;
  });

  useEffect(() => {
    // Recalcular totais com base nos registros filtrados
    let entradas = 0;
    let saidas = 0;
    filteredRegistros.forEach((registro) => {
      if (registro.tipo === 'entrada') {
        entradas += registro.valor;
      } else {
        saidas += registro.valor;
      }
    });
    setTotalEntradas(entradas);
    setTotalSaidas(saidas);
    setTotalMovimentacoes(entradas + saidas);
  }, [filteredRegistros]);

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
    const dataAtual = new Date();
    const dataRegistro = new Date(newRegistro.data || '');
    const dataMinima = new Date(
      dataAtual.getFullYear() - 5,
      dataAtual.getMonth(),
      dataAtual.getDate(),
    );
    const dataMaxima = new Date(
      dataAtual.getFullYear() + 5,
      dataAtual.getMonth(),
      dataAtual.getDate(),
    );

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

    // Verificar se selectedRegistro não é nulo
    if (!selectedRegistro) {
      toast({
        description: 'Nenhum registro foi selecionado.',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    const dataAtual = new Date();
    const dataRegistro = new Date(newRegistro.data || '');
    const dataMinima = new Date(
      dataAtual.getFullYear() - 5,
      dataAtual.getMonth(),
      dataAtual.getDate(),
    );
    const dataMaxima = new Date(
      dataAtual.getFullYear() + 5,
      dataAtual.getMonth(),
      dataAtual.getDate(),
    );

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

  const handleCheckboxChange = (name: string, checked: CheckedState) => {
    const value = checked === 'indeterminate' ? false : !!checked; // Garante que o valor seja booleano
    if (openDialogNewRegistro) {
      setNewRegistro((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditRegistro && selectedRegistro) {
      setSelectedRegistro((prev) => prev && { ...prev, [name]: value });
    }
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

  // Formatar a data para o formato YYYY-MM-DD
  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dataObj.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">
        Estrutura de custos e receita
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-base">Total Movimentações</h2>
          <p className="text-xl font-bold">
            {formatarValor(totalMovimentacoes)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <h2 className="text-base mb-2">Total Entradas</h2>
          <p className="text-xl font-bold text-green-600">
            {formatarValor(totalEntradas)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <h2 className="text-base">Total Saídas</h2>
          <p className="text-xl font-bold text-red-600">
            {formatarValor(totalSaidas)}
          </p>
        </div>
      </div>
      <FiltersFinancials
        filterName={filterName}
        setFilterName={setFilterName}
        filterTipo={filterTipo}
        setFilterTipo={setFilterTipo}
        filterDataInicial={filterDataInicial}
        setFilterDataInicial={setFilterDataInicial}
        filterDataFinal={filterDataFinal}
        setFilterDataFinal={setFilterDataFinal}
        handleAddRegistro={handleAddRegistro}
      />
      <DataTable
        headers={['Nome', 'Tipo', 'Categoria', 'Data', 'Valor', 'Status']}
        rows={filteredRegistros.map((registro) => [
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
          <span
            className={
              registro.pagamento_efetuado ? 'text-green-600' : 'text-red-600'
            }
          >
            {registro.pagamento_efetuado ? 'Concluído' : 'Pendente'}
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
            <div className="mb-4 flex items-center">
              <Checkbox
                id="pagamento_efetuado"
                name="pagamento_efetuado"
                checked={newRegistro.pagamento_efetuado || false}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('pagamento_efetuado', checked)
                }
              />
              <Label htmlFor="pagamento_efetuado" className="ml-2">
                Pagamento Efetuado
              </Label>
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
                value={
                  selectedRegistro ? formatarData(selectedRegistro.data) : ''
                }
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
            <div className="mb-4 flex items-center">
              <Checkbox
                id="pagamento_efetuado"
                name="pagamento_efetuado"
                checked={selectedRegistro?.pagamento_efetuado || false}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('pagamento_efetuado', checked)
                }
              />
              <Label htmlFor="pagamento_efetuado" className="ml-2">
                Pagamento Efetuado
              </Label>
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
