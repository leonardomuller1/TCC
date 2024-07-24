import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

//componentes
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

//icones
import { ReloadIcon } from '@radix-ui/react-icons';

function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdatePassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        description: 'A senha deve ter no mínimo 6 caracteres.',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        description: 'As senhas não coincidem.',
        className: 'bg-red-300',
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    //atualização da senha no supabase
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        description: error.message,
        className: 'bg-red-300',
        duration: 4000,
      });
    } else {
      toast({
        description: 'Senha atualizada com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-row">
      <div className="bg-gray-900 p-12 basis-1/2 flex flex-col justify-between">
        <img alt="logo" src="../../public/logo.png" className="w-32" />
        <div className="flex flex-col gap-4">
          <h3 className="text-gray-50 text-lg font-semibold">
            "Em alguns anos vão existir dois tipos de empresas: as que fazem
            negócios pela internet e as que estão fora dos negócios."
          </h3>
          <h4 className="text-gray-50 text-sm">Bill Gates</h4>
        </div>
      </div>
      <div className="basis-1/2 flex justify-center items-center">
        <div className="w-1/2 flex flex-col gap-4">
          <div className="p-6 flex flex-col justify-center items-center gap-1">
            <h1 className="text-gray-900 text-2xl font-semibold">
              Atualizar Senha
            </h1>
            <h2 className="text-gray-500 text-base">
              Insira suas credenciais para acessar seu perfil
            </h2>
          </div>
          <form
            className="flex flex-col justify-center items-center gap-2"
            onSubmit={handleUpdatePassword}
          >
            <Input
              type="password"
              placeholder="Senha"
              id="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar Senha"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Atualizar Senha'
              )}
            </Button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default UpdatePasswordPage;
