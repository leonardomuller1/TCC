import { supabase } from '@/supabaseClient';
import React, { useEffect, useState } from 'react';
import DataTable from '@/components/TableComponent';
import CardPages from '@/components/dashboard/CardPagesComponent';
import useAuthStore from '@/stores/useAuthStore';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import EditarAcessoDialog from './EditAcess';

interface Empresa {
  id: string;
  nome: string;
  userCreate: string;
}

const AdminDashboard: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editarAcessoOpen, setEditarAcessoOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, userCreate');
      if (error) {
        console.error('Erro ao buscar empresas:', error);
      } else {
        setEmpresas(data || []);
      }
      setLoading(false);
    };
    fetchEmpresas();
  }, []);

  const handleAddClick = () => {
    // Lógica para adicionar nova empresa
  };

  const handleOptionsClick = (rowIndex: number) => {
    const empresa = empresas[rowIndex];
    setSelectedEmpresa(empresa);
    setDialogOpen(true);
  };

  const handleDialogOption = (option: number) => {
    if (selectedEmpresa) {
      switch (option) {
        case 1:
          console.log(`Opção 1 selecionada para empresa: ${selectedEmpresa.nome}`);
          toast({
            description: `Acessos atualizados com sucesso!`,
            className: 'bg-green-300',
            duration: 4000,
          });
          break;
        case 2:
          setEditarAcessoOpen(true);
          return;
        case 3:
          if (user) {
            setUser({
              ...user,
              companyId: selectedEmpresa.id
            });
          }
          console.log(`Empresa selecionada: ${selectedEmpresa.id}`);
          toast({
            description: `Empresa ${selectedEmpresa.nome} selecionada com sucesso!`,
            className: 'bg-green-300',
            duration: 4000,
          });
          break;
      }
    }
    setDialogOpen(false);
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">
        Painel Administrador
      </h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <DataTable
          headers={['ID', 'Nome', 'User Create']}
          rows={empresas.map((empresa) => [
            empresa.id,
            empresa.nome,
            empresa.userCreate,
          ])}
          onAddClick={handleAddClick}
          onOptionsClick={handleOptionsClick}
          hidePlusIcon={true}
        />
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Opções para {selectedEmpresa?.nome}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" onClick={() => handleDialogOption(1)}>Opção 1</Button>
            <Button variant="outline" onClick={() => handleDialogOption(2)}>Editar Acesso</Button>
            <Button variant="outline" onClick={() => handleDialogOption(3)}>Selecionar Empresa</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedEmpresa && (
        <EditarAcessoDialog 
          empresaId={selectedEmpresa.id} 
          open={editarAcessoOpen}
          onOpenChange={setEditarAcessoOpen}
        />
      )}
      <Toaster />
    </CardPages>
  );
};

export default AdminDashboard;