import { useState } from 'react';
import { supabase } from '../supabaseClient';

//componentes
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

//icones
import { ReloadIcon } from '@radix-ui/react-icons';

function RegisterPage() {
  const [company, setCompnay] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);

    //Verificacao se ja tem conta neste email
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      toast({
        description: 'Este email já está registrado.',
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    if (checkError && checkError.code !== 'PGRST116') {
      toast({
        description: checkError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    // Cria a conta no supabase
    const { data: registerData, error: registerError } =
      await supabase.auth.signUp({ email, password });

    if (registerError) {
      toast({
        description: registerError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    const userId = registerData.user?.id;

    //Cria a empresa
    const { data: companyData, error: companyError } = await supabase
      .from('empresas')
      .insert([{ nome: company }])
      .select()
      .single();

    if (companyError) {
      toast({
        description: companyError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    //Cria o usuario com ID da empresas
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([{ id: userId, nome: name, email, empresa: companyData.id }])
      .select()
      .single();

    if (userError) {
      toast({
        description: userError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    //Adiciona o usuario a empresa
    const { error: associacaoError } = await supabase
      .from('empresa_usuarios')
      .insert([{ empresa_id: companyData.id, usuario_id: userData.id }]);

    if (associacaoError) {
      toast({
        description: associacaoError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    toast({
      description: 'Conta criada com sucesso!',
      className: 'bg-green-300',
      duration: 4000,
    });
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
              Crie sua conta
            </h1>
            <h2 className="text-gray-500 text-base">
              Comece agora a planejar sua startup
            </h2>
          </div>
          <form
            className="flex flex-col justify-center items-center gap-2"
            onSubmit={handleRegister}
          >
            <Input
              type="text"
              placeholder="Nome da startup"
              id="company"
              required
              value={company}
              onChange={(e) => setCompnay(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Nome do Usuário"
              id="userName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
                'Cadastrar-me'
              )}
            </Button>
            <Button variant="link">
              <a href="/login">Já tenho conta</a>
            </Button>
            <p className="text-gray-500 text-xs text-center">
              Ao clicar em continuar, você concorda com nossos Termos de Serviço
              e Política de Privacidade.
            </p>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default RegisterPage;
