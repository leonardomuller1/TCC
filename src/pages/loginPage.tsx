import { useState } from 'react';
import { supabase } from '../supabaseClient';

//componentes
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CardAuthComponent from '@/components/auth/cardComponent';

//icones
import { ReloadIcon } from '@radix-ui/react-icons';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResetPassoword, setLoadingResetPassoword] = useState(false);
  const [openDialogResetPassWord, setOpenDialogResetPassWord] = useState(false);

  const { toast } = useToast();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);

    //login no supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        toast({
          description: 'Credenciais de login inválidas.',
          className: 'bg-red-300',
          duration: 4000,
        });
      } else if (error.message === 'Email not confirmed') {
        toast({
          description: 'Email não confirmado!',
          className: 'bg-red-300',
          duration: 4000,
        });
      } else {
        toast({
          description: error.message,
          className: 'bg-red-300',
          duration: 4000,
        });
      }
    } else {
      toast({
        description: 'Login realizado com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoadingResetPassoword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'https://localhost:5173/update-password',
    });

    if (error) {
      toast({
        description: error.message,
        className: 'bg-red-300',
        duration: 4000,
      });
    } else {
      toast({
        description: 'Link de redefinição de senha enviado!',
        className: 'bg-green-300',
        duration: 4000,
      });
      setOpenDialogResetPassWord(false); // Fecha o diálogo após o envio do email
      setLoadingResetPassoword(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-row">
      <CardAuthComponent />
      <div className="basis-1/2 flex justify-center items-center">
        <div className="w-1/2 flex flex-col gap-4">
          <div className="p-6 flex flex-col justify-center items-center gap-1">
            <h1 className="text-gray-900 text-2xl font-semibold">
              Entre em sua conta
            </h1>
            <h2 className="text-gray-500 text-base">
              Insira suas credenciais para acessar seu perfil
            </h2>
          </div>
          <form
            className="flex flex-col justify-center items-center gap-2"
            onSubmit={handleLogin}
          >
            <Input
              type="email"
              placeholder="Email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <div className="flex flex-row justify-between w-full">
              <Button variant="link" size="link">
                <a href="/register">Não tenho conta</a>
              </Button>

              {/* Esqueci a senha */}
              <Dialog
                open={openDialogResetPassWord}
                onOpenChange={setOpenDialogResetPassWord}
              >
                <DialogTrigger asChild>
                  <Button variant="link" size="link">
                    Esqueci a senha
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Esqueci a minha senha</DialogTitle>
                    <DialogDescription>
                      Digite seu e-mail para receber instruções de redefinição
                      de senha.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        id="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handlePasswordReset}
                    >
                      {loadingResetPassoword ? (
                        <>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Enviando o email...
                        </>
                      ) : (
                        'Redefinir a senha'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default LoginPage;
