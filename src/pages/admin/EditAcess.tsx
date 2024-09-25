import { useEffect, useState, useRef } from 'react';

// componentes
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

// uteis
import { supabase } from '../../supabaseClient';

type Access = {
  problema: boolean;
  clientes: boolean;
  solucao: boolean;
  concorrentes: boolean;
  financeiro: boolean;
  andamento: boolean;
};

function EditarAcessoDialog({ empresaId }: { empresaId: string }) {
  const [access, setAccess] = useState<Access>({
    problema: false,
    clientes: false,
    solucao: false,
    concorrentes: false,
    financeiro: false,
    andamento: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null); // Ref para o diálogo

  useEffect(() => {
    const fetchAccess = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('acessos')
        .eq('id', empresaId)
        .single();

      if (error) {
        toast({
          description: `Erro ao buscar acessos: ${error.message}`,
          className: 'bg-red-300',
          duration: 4000,
        });
      } else if (data?.acessos) {
        setAccess(data.acessos);
      }
      setIsLoading(false);
    };

    fetchAccess();
  }, [empresaId, toast]);

  const handleChange = (key: keyof Access) => {
    setAccess((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('empresas')
      .update({ acessos: access })
      .eq('id', empresaId);

    if (error) {
      toast({
        description: `Erro ao salvar acessos: ${error.message}`,
        className: 'bg-red-300',
        duration: 4000,
      });
    } else {
      toast({
        description: `Acessos atualizados com sucesso!`,
        className: 'bg-green-300',
        duration: 4000,
      });
      dialogRef.current?.close(); // Fecha o diálogo após salvar
    }
    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Editar Acessos</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Editar Acessos</DialogTitle>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={access.problema}
              onCheckedChange={() => handleChange('problema')}
            />
            Problema
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={access.clientes}
              onCheckedChange={() => handleChange('clientes')}
            />
            Clientes
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={access.solucao}
              onCheckedChange={() => handleChange('solucao')}
            />
            Solução
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={access.concorrentes}
              onCheckedChange={() => handleChange('concorrentes')}
            />
            Concorrentes
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={access.financeiro}
              onCheckedChange={() => handleChange('financeiro')}
            />
            Financeiro
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={access.andamento}
              onCheckedChange={() => handleChange('andamento')}
            />
            Andamento
          </label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}

export default EditarAcessoDialog;
