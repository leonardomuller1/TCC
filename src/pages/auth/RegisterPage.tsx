import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import useAuthStore from '@/stores/useAuthStore';

//componentes
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import CardAuthComponent from '../../components/auth/CardComponent';

//icones
import { ReloadIcon } from '@radix-ui/react-icons';

function RegisterPage() {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserId } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);

    // Verificação se já tem conta neste email
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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
      },
    );

    if (signUpError) {
      toast({
        description: signUpError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      toast({
        description: 'Erro ao obter ID do usuário.',
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    // Gera a URL do avatar com as iniciais
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('');
    const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&size=256`;

    // Cria o usuário com ID da empresa e avatar
    const { error: userError } = await supabase.from('usuarios').insert([
      {
        id: userId,
        nome: name,
        email,
        foto: avatarUrl,
      },
    ]);

    if (userError) {
      toast({
        description: userError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    // Cria a empresa
    const { data: companyData, error: companyError } = await supabase
      .from('empresas')
      .insert([
        {
          nome: company,
          acessos: {
            solucao: false,
            clientes: false,
            problema: true,
            andamento: false,
            financeiro: false,
            concorrentes: false,
          },
          userCreate: userId,
        },
      ])
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

    // Atualiza o usuário com o ID da empresa
    const { error: userUpdateError } = await supabase
      .from('usuarios')
      .update({ empresa: companyData.id }) // Adiciona o ID da empresa ao usuário
      .eq('id', userId);

    if (userUpdateError) {
      toast({
        description: userUpdateError.message,
        className: 'bg-red-300',
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    const { error: associationError } = await supabase
      .from('empresa_usuarios')
      .insert([{ empresa_id: companyData.id, usuario_id: userId }]);

    if (associationError) {
      toast({
        description: associationError.message,
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
    setUserId(userId);
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-row">
      <CardAuthComponent />

      <div className="flex justify-center items-center w-screen p-4">
        <div className="flex flex-col gap-4">
          <div className="gap-1">
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
