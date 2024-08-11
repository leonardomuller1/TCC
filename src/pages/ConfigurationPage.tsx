import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

//components
import CardPages from '@/components/dashboard/CardPagesComponent';
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

//icones
import { ReloadIcon } from '@radix-ui/react-icons';

//auxiliares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';

function ConfigurationPage() {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [loadingNewUser, setLoadingNewUser] = useState(false);
  const [openDialogNewUser, setOpenDialogNewUser] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<
    { id: string; nome: string }[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    nome: string;
    email: string;
  } | null>(null);
  const [openDialogUserDetails, setOpenDialogUserDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('usuarios')
          .select('email,nome,foto')
          .eq('id', user.id)
          .single();
        if (data) {
          setEmail(data.email);
          setName(data.nome);
          setProfileImage(data.foto);
        } else if (error) {
          toast({
            description: error.message,
            className: 'bg-red-300',
            duration: 4000,
          });
        }
      };
      fetchUserData();
      fetchMembers();
    }
  }, [user, toast]);

  const fetchMembers = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('empresa_usuarios')
        .select('usuario_id')
        .eq('empresa_id', user.companyId);

      if (data) {
        const userIds = data.map((item) => item.usuario_id);
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select('id, nome')
          .in('id', userIds);

        if (usersData) {
          setTeamMembers(usersData);
        } else if (usersError) {
          toast({
            description: usersError.message,
            className: 'bg-red-300',
            duration: 4000,
          });
        }
      } else if (error) {
        toast({
          description: error.message,
          className: 'bg-red-300',
          duration: 4000,
        });
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updates: { nome?: string; foto?: string } = {};

    if (name) {
      updates.nome = name;
    }

    if (imageFile) {
      const { error: uploadError } = await supabase.storage
        .from('imageUser')
        .upload(`public/${user?.id}/${imageFile.name}`, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        toast({
          description: uploadError.message,
          className: 'bg-red-300',
          duration: 4000,
        });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('imageUser')
        .getPublicUrl(`public/${user?.id}/${imageFile.name}`);

      if (publicUrlData?.publicUrl) {
        updates.foto = publicUrlData.publicUrl;
      }
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', user?.id);

    if (updateError) {
      toast({
        description: updateError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    if (password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });

      if (passwordError) {
        if (
          passwordError.message ===
            'New password should be different from the old password.' ||
          passwordError.message === 'Auth session missing!'
        ) {
          return;
        }
        toast({
          description: passwordError.message,
          className: 'bg-red-300',
          duration: 4000,
        });
        return;
      }
    }

    toast({
      description: 'Perfil atualizado com sucesso!',
      className: 'bg-green-300',
      duration: 4000,
    });
  };

  const handleInviteUser = async () => {
    setLoadingNewUser(true);

    // Verifica se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', newUserEmail)
      .single();

    if (existingUser) {
      toast({
        description: 'Este email já está registrado.',
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoadingNewUser(false);
      setOpenDialogNewUser(false);
      return;
    }

    if (checkError && checkError.code !== 'PGRST116') {
      toast({
        description: checkError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoadingNewUser(false);
      return;
    }

    // Cria a conta no supabase
    const { data: registerData, error: registerError } =
      await supabase.auth.admin.inviteUserByEmail(newUserEmail);

    if (registerError) {
      toast({
        description: registerError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoadingNewUser(false);

      return;
    }

    const userId = registerData.user?.id;

    if (!userId) {
      toast({
        description: 'Erro ao obter ID do usuário.',
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoadingNewUser(false);
      return;
    }

    // Cria o usuario com ID da empresa
    const { error: userError } = await supabase.from('usuarios').insert([
      {
        id: userId,
        nome: newUserName,
        email: newUserEmail,
        empresa: user?.companyId,
      },
    ]);

    if (userError) {
      toast({
        description: userError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoadingNewUser(false);
      return;
    }

    // Adiciona o usuario a empresa
    const { error: associacaoError } = await supabase
      .from('empresa_usuarios')
      .insert([{ empresa_id: user?.companyId, usuario_id: userId }]);

    if (associacaoError) {
      toast({
        description: associacaoError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoadingNewUser(false);
      return;
    }

    toast({
      description: 'Convite enviado com sucesso!',
      className: 'bg-green-300',
      duration: 4000,
    });
    setOpenDialogNewUser(false);
    setLoadingNewUser(false);
    fetchMembers();
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Verifica se o usuário é o criador da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('empresas')
        .select('userCreate')
        .eq('userCreate', userId);
  
      if (companyError) {
        toast({
          description: companyError.message,
          className: 'bg-red-300',
          duration: 4000,
        });
        return;
      }
  
      if (companyData && companyData.length > 0) {
        toast({
          description: 'O criador da empresa não pode ser excluído.',
          className: 'bg-red-300',
          duration: 4000,
        });
        return;
      }
  
      // Remove o usuário da tabela 'empresa_usuarios'
      const { error: empresaUsuariosError } = await supabase
        .from('empresa_usuarios')
        .delete()
        .eq('usuario_id', userId);
  
      if (empresaUsuariosError) {
        throw empresaUsuariosError;
      }
  
      // Remove o usuário da tabela 'usuarios'
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);
  
      if (usuariosError) {
        throw usuariosError;
      }
  
      // Remove o usuário da autenticação do Supabase
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
      if (authError) {
        throw authError;
      }
  
      // Atualiza a lista de membros da equipe
      fetchMembers();
  
      toast({
        description: 'Usuário excluído com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error: any) {
      toast({
        description: error.message,
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };
  
  
  const handleViewUserDetails = (rowIndex: number) => {
    const userId = teamMembers[rowIndex].id;
    const userNome = teamMembers[rowIndex].nome;
    const fetchUserEmail = async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('email')
        .eq('id', userId)
        .single();
      if (data) {
        setSelectedUser({
          id: userId,
          nome: userNome,
          email: data.email,
        });
        setOpenDialogUserDetails(true);
      } else if (error) {
        toast({
          description: error.message,
          className: 'bg-red-300',
          duration: 4000,
        });
      }
    };
    fetchUserEmail();
  };

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Configurações</h1>
      <form
        className="gap-4 flex flex-col w-1/3"
        onSubmit={handleUpdateProfile}
      >
        <div className="gap-2 flex flex-col">
          <Label>Nome</Label>
          <Input
            type="text"
            value={name}
            id="name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="gap-2 flex flex-col">
          <Label>E-mail</Label>
          <Input type="email" value={email} id="email" readOnly />
        </div>
        <div className="gap-2 flex flex-col">
          <Label>Foto</Label>
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile"
              className="h-20 w-20 rounded-full"
            />
          )}
          <Input type="file" id="profileImage" onChange={handleImageChange} />
        </div>
        <div className="gap-2 flex flex-col">
          <Label>Senha nova</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit">Alterar dados</Button>
      </form>
      <div className="pt-4 flex flex-col gap-2">
        <h2 className="text-lg text-gray-900 font-semibold">
          Membros da equipe
        </h2>
        <DataTable
          headers={['Nome']}
          rows={teamMembers.map((member) => [member.nome])}
          onAddClick={() => setOpenDialogNewUser(true)}
          onOptionsClick={(rowIndex) => handleViewUserDetails(rowIndex)}
        />
      </div>
      <Toaster />

      <Dialog open={openDialogNewUser} onOpenChange={setOpenDialogNewUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo usuário.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInviteUser();
            }}
          >
            <div className="mb-4">
              <Label htmlFor="newUserName">Nome</Label>
              <Input
                type="text"
                id="newUserName"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="newUserEmail">Email</Label>
              <Input
                type="email"
                id="newUserEmail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loadingNewUser}>
                {loadingNewUser ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Enviando o email...
                  </>
                ) : (
                  'Adicionar membro'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialogUserDetails}
        onOpenChange={setOpenDialogUserDetails}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Visualize os detalhes do usuário abaixo.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <>
              <div className="mb-4">
                <Label>Nome</Label>
                <Input type="text" value={selectedUser.nome} readOnly />
              </div>
              <div className="mb-4">
                <Label>Email</Label>
                <Input type="email" value={selectedUser.email} readOnly />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant='destructive'
                  onClick={() => {
                    handleDeleteUser(selectedUser.id);
                    setOpenDialogUserDetails(false);
                  }}
                >
                  Deletar membro
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </CardPages>
  );
}

export default ConfigurationPage;
