import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import useAuthStore from '@/stores/useAuthStore';

//componentes
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import CardAuthComponent from '@/components/auth/CardComponent';

//icones
import { ReloadIcon } from '@radix-ui/react-icons';

function RegisterPage() {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);

    // Verificacao se ja tem conta neste email
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

    if (!userId) {
      toast({
        description: 'Erro ao obter ID do usuário.',
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    // Cria a empresa
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

    // Cria o usuario com ID da empresa
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

    // Adiciona o usuario a empresa
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
    const userWithCompanyId = {
      ...registerData.user,
      id: userId,
      companyId: companyData.id,
      email: email,
      name: name
    };

    setUser(userWithCompanyId);
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-row">
      <CardAuthComponent />

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
              onChange={(e) => setCompany(e.target.value)}
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
            <div className="flex w-full">
              <Button variant="link" size="link">
                <a href="/entrar">Já tenho conta</a>
              </Button>
            </div>
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
