import { useEffect, useState } from 'react';

//components
import CardPages from '@/components/dashboard/CardPagesComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

//auxilares
import useAuthStore from '@/stores/useAuthStore';
import { supabase } from '@/supabaseClient';

function ConfigurationPage() {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
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
        } else if (error) {
          toast({
            description: error.message,
            className: 'bg-red-300',
            duration: 4000,
          });
        }
      };
      fetchUserData();
    }
  }, [user, toast]);

  const handleUpdateProfile = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const updates: { [key: string]: unknown } = {};

    if (name) {
      updates.nome = name;
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
          passwordError.message ==
          'New password should be different from the old password.'
        ) {
          toast({
            description: 'A nova senha deve ser diferente da senha antiga.',
            className: 'bg-red-300',
            duration: 4000,
          });
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
      <Toaster />
    </CardPages>
  );
}

export default ConfigurationPage;
