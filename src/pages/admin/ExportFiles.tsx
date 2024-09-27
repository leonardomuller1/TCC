import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/supabaseClient';

interface ExportButtonProps {
  empresaId: string | null;
}

type ProblemaData = {
  descricao: string;
  como_resolvido: string;
  impacto: string;
  exemplos: string;
  frequencia: string;
  segmento: string;
  gravidade: string;
};

type Tarefa = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  status: string;
  prazo: string;
  responsavel: string;
  created_at: string;
  updated_at: string;
};

type Metrica = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  area: string;
  valores: { mes: string; valor: number }[];
  created_at: string;
  updated_at: string;
};

type SegmentoClientes = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  area: string;
  tipo_cliente: string;
  vai_atender: boolean;
  justificativa: string;
  relations: string[]; // Nova coluna para relações
  created_at: string;
  updated_at: string;
};

type Canal = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  tipo_de_canal: string;
  objetivo: string;
  created_at: string;
  updated_at: string;
};

type PublicoAlvo = {
  id: number;
  empresa_id: string;
  segmento_cliente: string;
  segmento: string;
  faixa_etaria: string;
  escolaridade: string;
  localizacao: string;
  cargo: string;
  porte_da_empresa: string;
  setor_de_atuacao: string;
  habitos_de_consumo: string;
  papel_de_compra: string;
  tarefas_e_responsabilidades: string;
  created_at: string;
  updated_at: string;
};

type SegmentoCliente = {
  id: number;
  nome: string;
};

type Solucao = {
  descricao: string;
  desafios: string;
  frase_curta: string;
};

type Beneficio = {
  titulo: string;
  descricao: string;
  diferenciais_competitivos: string;
};

type Funcionalidade = {
  id: number;
  empresa_id: string;
  titulo: string;
  descricao: string;
  versao_app: string;
  prioridade: string;
  created_at: string;
  updated_at: string;
};

type RegistroFinanceiro = {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  data: string;
  valor: number;
  pagamento_efetuado: boolean;
  created_at: string;
  updated_at: string;
};

const ExportFiles: React.FC<ExportButtonProps> = ({ empresaId }) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { toast } = useToast();

  // Vetor com os nomes personalizados para os campos do "problema"
  const campoPersonalizadoProblema = {
    descricao: 'Descrição geral do problema',
    como_resolvido: 'Como é resolvido atualmente',
    impacto: 'Impacto do problema',
    exemplos: 'Exemplos e casos de uso',
    frequencia: 'Frequência e ocorrência do problema',
    segmento: 'Segmento de clientes afetados',
    gravidade: 'Gravidade do problema',
  };

  const handleExportClick = () => {
    if (!empresaId) {
      toast({
        description: 'Por favor, selecione uma empresa primeiro.',
        className: 'bg-yellow-300',
        duration: 4000,
      });
      return;
    }
    setExportDialogOpen(true);
  };

  const handleExportOption = async (option: string) => {
    if (!empresaId) {
      toast({
        description: 'Por favor, selecione uma empresa válida.',
        className: 'bg-yellow-300',
        duration: 4000,
      });
      return;
    }

    setExportDialogOpen(false);

    try {
      if (option === 'concorrentes') {
        await exportCompetitors(empresaId);
      } else if (option === 'tarefas') {
        await exportTasks(empresaId);
      } else if (option === 'metricas') {
        await exportMetrics(empresaId);
      } else if (option === 'segmentos') {
        await exportSegmentos(empresaId);
      } else if (option === 'canais') {
        await exportCanais(empresaId);
      } else if (option === 'publicoalvo') {
        await exportPublicoAlvo(empresaId);
      } else if (option === 'solucao') {
        await exportSolution(empresaId);
      } else if (option === 'financeiro') {
        await exportFinanceiro(empresaId);
      } else {
        const { data, error } = await supabase
          .from(option)
          .select('*')
          .eq('empresa_id', empresaId);

        if (error) throw error;

        const dadosPersonalizados = data.map((item: ProblemaData) => {
          const itemPersonalizado: Record<string, string> = {};
          Object.keys(campoPersonalizadoProblema).forEach((campoOriginal) => {
            const campoRenomeado =
              campoPersonalizadoProblema[campoOriginal as keyof ProblemaData];
            itemPersonalizado[campoRenomeado] =
              item[campoOriginal as keyof ProblemaData];
          });
          return itemPersonalizado;
        });

        gerarPDF(dadosPersonalizados[0]);
        toast({
          description: `Dados de ${option} exportados com sucesso!`,
          className: 'bg-green-300',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        description: `Erro ao exportar dados de ${option}.`,
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportSolution = async (empresaId: string) => {
    try {
      console.log('Fetching solution and benefits data for empresa_id:', empresaId);
      const [solutionResponse, benefitsResponse, featuresResponse] = await Promise.all([
        supabase.from('solucao').select('*').eq('empresa_id', empresaId),
        supabase.from('beneficios').select('*').eq('empresa_id', empresaId),
        supabase.from('funcionalidades').select('*').eq('empresa_id', empresaId),
      ]);

      if (solutionResponse.error) throw solutionResponse.error;
      if (benefitsResponse.error) throw benefitsResponse.error;
      if (featuresResponse.error) throw featuresResponse.error;

      const solutionData = solutionResponse.data;
      const benefitsData = benefitsResponse.data;
      const featuresData = featuresResponse.data;

      if (!solutionData || solutionData.length === 0) {
        console.error('No solution data returned for empresa_id:', empresaId);
        throw new Error('No solution data found');
      }

      console.log('Solution data:', solutionData);
      console.log('Benefits data:', benefitsData);
      console.log('Features data:', featuresData);

      gerarPDFSolucao(solutionData, benefitsData, featuresData);
    } catch (error) {
      console.error('Detailed error in exportSolution:', error);
      toast({
        description: 'Erro ao exportar dados da solução e benefícios. Por favor, tente novamente.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportTasks = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push(['Nome', 'Descrição', 'Status', 'Prazo', 'Responsável']);

      // Data rows
      data.forEach((tarefa: Tarefa) => {
        csvRows.push([
          tarefa.nome,
          tarefa.descricao,
          tarefa.status,
          tarefa.prazo,
          tarefa.responsavel,
        ]);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'tarefas.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados de tarefas exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados de tarefas:', error);
      toast({
        description: 'Erro ao exportar dados de tarefas.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportMetrics = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('metricas')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push(['Nome', 'Descrição', 'Área', 'Valores']);

      // Data rows
      data.forEach((metrica: Metrica) => {
        const valoresString = metrica.valores
          .map((valor) => `${valor.mes}: ${valor.valor}`)
          .join(', ');
        csvRows.push([
          metrica.nome,
          metrica.descricao,
          metrica.area,
          valoresString,
        ]);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'metricas.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados de métricas exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados de métricas:', error);
      toast({
        description: 'Erro ao exportar dados de métricas.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportCompetitors = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('empresa_id', empresaId)
        .limit(1)
        .single();

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push(['Funcionalidade', ...data.colunas]);

      // Data rows
      data.linhas.forEach((row: string | number) => {
        const rowData = [row];
        data.colunas.forEach((column: string | number) => {
          // Substitui 'Checked' e 'Unchecked' pelos ícones desejados
          rowData.push(data.dados[row]?.[column] ? '✅' : '❌');
        });
        csvRows.push(rowData);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'competitors_analysis.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados de concorrentes exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados de concorrentes:', error);
      toast({
        description: 'Erro ao exportar dados de concorrentes.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportSegmentos = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('segmentoclientes')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push([
        'Nome',
        'Descrição',
        'Área',
        'Tipo de Cliente',
        'Vai Atender',
        'Justificativa',
        'Relações',
      ]);

      // Data rows
      data.forEach((segmento: SegmentoClientes) => {
        const relacoesString = segmento.relations.join(', ');
        csvRows.push([
          segmento.nome,
          segmento.descricao,
          segmento.area,
          segmento.tipo_cliente,
          segmento.vai_atender ? 'Sim' : 'Não',
          segmento.justificativa,
          relacoesString,
        ]);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'segmentos_clientes.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados de segmentos de clientes exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados de segmentos de clientes:', error);
      toast({
        description: 'Erro ao exportar dados de segmentos de clientes.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportCanais = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('canal')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push(['Nome', 'Descrição', 'Tipo de Canal', 'Objetivo']);

      // Data rows
      data.forEach((canal: Canal) => {
        csvRows.push([
          canal.nome,
          canal.descricao,
          canal.tipo_de_canal,
          canal.objetivo,
        ]);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'canais.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados de canais exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados de canais:', error);
      toast({
        description: 'Erro ao exportar dados de canais.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportPublicoAlvo = async (empresaId: string) => {
    try {
      const segmentosCliente = await fetchSegmentosCliente(empresaId);
      const segmentoMap = createSegmentoMap(segmentosCliente);

      const { data, error } = await supabase
        .from('publicoalvo')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push([
        'Segmento Cliente',
        'Faixa Etária',
        'Escolaridade',
        'Localização',
        'Cargo',
        'Porte da Empresa',
        'Setor de Atuação',
        'Hábitos de Consumo',
        'Papel de Compra',
        'Tarefas e Responsabilidades',
        'Criado em',
        'Atualizado em',
      ]);

      // Data rows
      data.forEach((publico: PublicoAlvo) => {
        const segmentoNome =
          segmentoMap[parseInt(publico.segmento_cliente, 10)] || 'Desconhecido';
        csvRows.push([
          segmentoNome,
          publico.faixa_etaria,
          publico.escolaridade,
          publico.localizacao,
          publico.cargo,
          publico.porte_da_empresa,
          publico.setor_de_atuacao,
          publico.habitos_de_consumo,
          publico.papel_de_compra,
          publico.tarefas_e_responsabilidades,
        ]);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'publico_alvo.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados de público-alvo exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados de público-alvo:', error);
      toast({
        description: 'Erro ao exportar dados de público-alvo.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const exportFinanceiro = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('financeiros')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;

      const csvRows = [];
      // Header
      csvRows.push([
        'Nome',
        'Tipo',
        'Categoria',
        'Data',
        'Valor',
        'Pagamento Efetuado',
      ]);

      // Data rows
      data.forEach((registro: RegistroFinanceiro) => {
        const dataFormatada = new Date(registro.data).toLocaleDateString('pt-BR');

        csvRows.push([
          registro.nome,
          registro.tipo,
          registro.categoria,
          dataFormatada,
          registro.valor,
          registro.pagamento_efetuado ? 'Sim' : 'Não',
        ]);
      });

      const csvString = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'registros_financeiros.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        description: 'Dados financeiros exportados com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar dados financeiros:', error);
      toast({
        description: 'Erro ao exportar dados financeiros.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const gerarPDF = (data: Record<string, string>) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Relatório de Problema', 105, 15, { align: 'center' });

      doc.setFontSize(12);
      let yPosition = 30;

      const addSection = (title: string, content: string) => {
        doc.setFontSize(14);
        doc.text(title, 10, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, yPosition);
        yPosition += lines.length * 7 + 10;

        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Adiciona seções ao PDF
      Object.keys(data).forEach((key) => {
        addSection(key, data[key]);
      });

      doc.save('relatorio_problema.pdf');

      toast({
        description: 'Relatório de problemas exportado com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        description: 'Erro ao exportar o relatório de problemas.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const gerarPDFSolucao = (solutionData: Solucao[], benefitsData: Beneficio[], featuresData: Funcionalidade[]) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Relatório de Soluções, Benefícios e Funcionalidades', 105, 15, { align: 'center' });

      doc.setFontSize(12);
      let yPosition = 30;

      const addSection = (title: string, content: string) => {
        doc.setFontSize(14);
        doc.text(title, 10, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, yPosition);
        yPosition += lines.length * 7 + 10;

        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Loop through each solution and add it to the PDF
      solutionData.forEach((solution, index) => {
        if (index > 0) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text(`Solução ${index + 1}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        addSection('Descrição geral da solução', solution.descricao);
        addSection('Desafios', solution.desafios);
        addSection('Frase curta', solution.frase_curta);
      });

      // Add benefits section
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(16);
      doc.text('Benefícios e Vantagens', 105, yPosition, { align: 'center' });
      yPosition += 15;

      // Create a table for benefits
      const benefitsTableData = [
        ['Título', 'Descrição', 'Diferenciais Competitivos'],
        ...benefitsData.map((benefit) => [
          benefit.titulo,
          benefit.descricao,
          benefit.diferenciais_competitivos,
        ]),
      ];

      const benefitsTableColumnWidths = [60, 60, 60];
      const benefitsTableRowHeight = 10;
      const benefitsTableStartY = yPosition + 10;

      doc.autoTable({
        startY: benefitsTableStartY,
        head: [benefitsTableData[0]],
        body: benefitsTableData.slice(1),
        columnStyles: {
          0: { cellWidth: benefitsTableColumnWidths[0] },
          1: { cellWidth: benefitsTableColumnWidths[1] },
          2: { cellWidth: benefitsTableColumnWidths[2] },
        },
        rowHeight: benefitsTableRowHeight,
        margin: { top: 10 },
      });

      // Add features section
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(16);
      doc.text('Funcionalidades', 105, yPosition, { align: 'center' });
      yPosition += 15;

      // Create a table for features
      const featuresTableData = [
        ['Título', 'Descrição', 'Prioridade', 'Versão do App'],
        ...featuresData.map((feature) => [
          feature.titulo,
          feature.descricao,
          feature.prioridade,
          feature.versao_app,
        ]),
      ];

      const featuresTableColumnWidths = [40, 60, 30, 30];
      const featuresTableRowHeight = 10;
      const featuresTableStartY = yPosition + 10;

      doc.autoTable({
        startY: featuresTableStartY,
        head: [featuresTableData[0]],
        body: featuresTableData.slice(1),
        columnStyles: {
          0: { cellWidth: featuresTableColumnWidths[0] },
          1: { cellWidth: featuresTableColumnWidths[1] },
          2: { cellWidth: featuresTableColumnWidths[2] },
          3: { cellWidth: featuresTableColumnWidths[3] },
        },
        rowHeight: featuresTableRowHeight,
        margin: { top: 10 },
      });

      doc.save('relatorio_solucoes_beneficios_e_funcionalidades.pdf');

      toast({
        description: 'Relatório de soluções, benefícios e funcionalidades exportado com sucesso!',
        className: 'bg-green-300',
        duration: 4000,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        description: 'Erro ao exportar o relatório de soluções, benefícios e funcionalidades.',
        className: 'bg-red-300',
        duration: 4000,
      });
    }
  };

  const fetchSegmentosCliente = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('segmentoclientes')
        .select('id, nome')
        .eq('empresa_id', empresaId);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar segmentos de cliente:', error);
      return [];
    }
  };

  const createSegmentoMap = (segmentos: SegmentoCliente[]) => {
    const map: { [key: number]: string } = {};
    segmentos.forEach((segmento) => {
      map[segmento.id] = segmento.nome;
    });
    return map;
  };

  return (
    <>
      <Button variant="outline" onClick={handleExportClick}>
        Exportar Dados
      </Button>
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escolha os dados para exportar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              onClick={() => handleExportOption('problema')}
            >
              Problema
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportOption('solucao')}
            >
              Solução
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExportOption('segmentos')}
            >
              Segmentos de Clientes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportOption('publicoalvo')}
            >
              Público-Alvo
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExportOption('canais')}
            >
              Canais
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportOption('concorrentes')}
            >
              Concorrentes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportOption('financeiro')}
            >
              Financeiro
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportOption('tarefas')}
            >
              Tarefas
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportOption('metricas')}
            >
              Métricas
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportFiles;
