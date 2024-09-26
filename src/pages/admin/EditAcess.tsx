import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '../../supabaseClient';

type Access = {
  problema: boolean;
  clientes: boolean;
  solucao: boolean;
  concorrentes: boolean;
  financeiro: boolean;
  andamento: boolean;
};

interface EditarAcessoDialogProps {
  empresaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditarAcessoDialog({ empresaId, open, onOpenChange }: EditarAcessoDialogProps) {
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

  useEffect(() => {
    const fetchAccess = async () => {
      if (open) {
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
      }
    };

    fetchAccess();
  }, [empresaId, open, toast]);

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
      onOpenChange(false); // Close the dialog after saving
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Editar Acessos</DialogTitle>
        <div className="flex flex-col gap-2">
          {Object.entries(access).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2">
              <Checkbox
                checked={value}
                onCheckedChange={() => handleChange(key as keyof Access)}
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}

export default EditarAcessoDialog;