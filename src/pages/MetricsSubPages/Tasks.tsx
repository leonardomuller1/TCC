import {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';

//components
import DataTable from '@/components/TableComponent';
import KanbanBoard from './KanbanBoard';
import Calendar from './Calendar'; // Importe o componente Calendar

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Tab from '@/components/TabComponent';

//auxiliares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';

// Tipos
type Tarefa = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  status: string;
  prazo: string;
  responsavel: string;
  created_at: string;
  updated_at: string;
};

type Status = {
  id: string;
  nome: string;
};

const statusList: Status[] = [
  { id: '1', nome: 'A fazer' },
  { id: '2', nome: 'Fazendo' },
  { id: '3', nome: 'Aprovação' },
  { id: '4', nome: 'Feito' },
];

const Tasks = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [openDialogNewTarefa, setOpenDialogNewTarefa] = useState(false);
  const [openDialogEditTarefa, setOpenDialogEditTarefa] = useState(false);
  const [newTarefa, setNewTarefa] = useState<Partial<Tarefa>>({});
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null);

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
      const { data: tarefaData, error: tarefaError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('empresa_id', user.companyId);

      if (tarefaError) throw new Error(tarefaError.message);
      setTarefas(tarefaData || []);
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

  const handleAddTarefa = (status: string) => {
    clearForm();
    setNewTarefa({ status }); // Define o status da nova tarefa
    setOpenDialogNewTarefa(true);
  };

  const handleAddTarefaList = () => {
    clearForm();
    setNewTarefa({ status: 'A fazer' }); // Define um status padrão
    setOpenDialogNewTarefa(true);
  };

  const handleEditTarefa = (rowIndex: number) => {
    const tarefa = tarefas[rowIndex];
    setSelectedTarefa(tarefa);
    setOpenDialogEditTarefa(true);
  };

  const handleTaskClick = (tarefa: Tarefa) => {
    setSelectedTarefa(tarefa);
    setOpenDialogEditTarefa(true);
  };

  const handleSaveNewTarefa = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('tarefas').insert([
        {
          ...newTarefa,
          empresa_id: user?.companyId,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data)) {
        setTarefas([...tarefas, ...data]);
      } else if (data) {
        setTarefas([...tarefas, data]);
      }
      fetchData();
      clearForm();
      setOpenDialogNewTarefa(false);
      toast({
        description: 'Tarefa adicionada com sucesso!',
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

  const handleSaveEditTarefa = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTarefa) return;
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ ...selectedTarefa })
        .eq('id', selectedTarefa.id);
      if (error) throw error;
      setTarefas(
        tarefas.map((tarefa) =>
          tarefa.id === selectedTarefa.id ? selectedTarefa : tarefa,
        ),
      );
      clearForm();
      setOpenDialogEditTarefa(false);
      toast({
        description: 'Tarefa atualizada com sucesso!',
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

  const handleDeleteTarefa = async () => {
    if (!selectedTarefa) return;
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', selectedTarefa.id);
      if (error) throw error;
      setTarefas(tarefas.filter((tarefa) => tarefa.id !== selectedTarefa.id));
      clearForm();
      setOpenDialogEditTarefa(false);
      toast({
        description: 'Tarefa excluída com sucesso!',
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
    if (openDialogNewTarefa) {
      setNewTarefa((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditTarefa && selectedTarefa) {
      setSelectedTarefa((prev) => prev && { ...prev, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (openDialogNewTarefa) {
      setNewTarefa((prev) => ({ ...prev, [name]: value }));
    } else if (openDialogEditTarefa && selectedTarefa) {
      setSelectedTarefa((prev) => prev && { ...prev, [name]: value });
    }
  };

  const clearForm = () => {
    setNewTarefa({});
    setSelectedTarefa(null);
  };

  function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  const handleStatusChange = async (tarefaId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: newStatus })
        .eq('id', tarefaId);
      if (error) throw error;
      setTarefas((prevTarefas) =>
        prevTarefas.map((tarefa) =>
          tarefa.id === tarefaId ? { ...tarefa, status: newStatus } : tarefa,
        ),
      );
      toast({
        description: 'Status da tarefa atualizado com sucesso!',
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

  return (
    <>
      {/* so aparece no celular e tablet */}
      <DataTable
        className='md:hidden'
        headers={['Nome', 'Descrição', 'Status', 'Prazo', 'Responsável']}
        rows={tarefas.map((tarefa) => [
          tarefa.nome,
          tarefa.descricao,
          tarefa.status,
          formatDate(tarefa.prazo),
          tarefa.responsavel,
        ])}
        onAddClick={handleAddTarefaList}
        onOptionsClick={handleEditTarefa}
      />
      {/* so aparece no computador */}
        <Tab
          className='hidden md:block'
          tabs={[
            {
              label: 'Lista de Tarefas',
              content: (
                <div>
                  <DataTable
                    headers={[
                      'Nome',
                      'Descrição',
                      'Status',
                      'Prazo',
                      'Responsável',
                    ]}
                    rows={tarefas.map((tarefa) => [
                      tarefa.nome,
                      tarefa.descricao,
                      tarefa.status,
                      formatDate(tarefa.prazo),
                      tarefa.responsavel,
                    ])}
                    onAddClick={handleAddTarefaList}
                    onOptionsClick={handleEditTarefa}
                  />
                </div>
              ),
            },
            {
              label: 'Kanban',
              content: (
                <div>
                  <KanbanBoard
                    tarefas={tarefas}
                    statusList={statusList}
                    onStatusChange={handleStatusChange}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleAddTarefa} // Passando a função para adicionar tarefa
                  />
                </div>
              ),
            },
            {
              label: 'Calendario',
              content: (
                <div>
                  <Calendar tarefas={tarefas} onTaskClick={handleTaskClick} />
                </div>
              ),
            },
          ]}
        />


      <Toaster />

      {/* Modal para adicionar nova tarefa */}
      <Dialog
        open={openDialogNewTarefa}
        onOpenChange={(open) => {
          if (!open) {
            clearForm();
          }
          setOpenDialogNewTarefa(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar uma nova tarefa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewTarefa}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="mb-4">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    value={newTarefa.nome || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={newTarefa.descricao || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                    value={newTarefa.status || ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="A fazer">A fazer</SelectItem>
                        <SelectItem value="Fazendo">Fazendo</SelectItem>
                        <SelectItem value="Aprovação">Aprovação</SelectItem>
                        <SelectItem value="Feito">Feito</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <Label htmlFor="prazo">Prazo</Label>
                  <Input
                    type="date"
                    id="prazo"
                    name="prazo"
                    value={newTarefa.prazo || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    type="text"
                    id="responsavel"
                    name="responsavel"
                    value={newTarefa.responsavel || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Salvar Tarefa</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar tarefa */}
      <Dialog
        open={openDialogEditTarefa}
        onOpenChange={(open) => {
          if (!open) {
            clearForm();
          }
          setOpenDialogEditTarefa(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Altere as informações abaixo para editar a tarefa selecionada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEditTarefa}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="mb-4">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    value={selectedTarefa?.nome || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={selectedTarefa?.descricao || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                    value={selectedTarefa?.status || ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="A fazer">A fazer</SelectItem>
                        <SelectItem value="Fazendo">Fazendo</SelectItem>
                        <SelectItem value="Aprovação">Aprovação</SelectItem>
                        <SelectItem value="Feito">Feito</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <Label htmlFor="prazo">Prazo</Label>
                  <Input
                    type="date"
                    id="prazo"
                    name="prazo"
                    value={selectedTarefa?.prazo || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    type="text"
                    id="responsavel"
                    name="responsavel"
                    value={selectedTarefa?.responsavel || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Salvar Tarefa</Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteTarefa}
              >
                Excluir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Tasks;
