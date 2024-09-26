import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
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

const ExportFiles: React.FC<ExportButtonProps> = ({ empresaId }) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { toast } = useToast();

  // Vetor com os nomes personalizados para os campos do "problema"
  const campoPersonalizadoProblema = {
    descricao: "Descrição geral do problema",
    como_resolvido: "Como é resolvido atualmente",
    impacto: "Impacto do problema",
    exemplos: "Exemplos e casos de uso",
    frequencia: "Frequência e ocorrência do problema",
    segmento: "Segmento de clientes afetados",
    gravidade: "Gravidade do problema",
  };

  const handleExportClick = () => {
    if (!empresaId) {
      toast({
        description: "Por favor, selecione uma empresa primeiro.",
        className: 'bg-yellow-300',
        duration: 4000,
      });
      return;
    }
    setExportDialogOpen(true);
  };

  const handleExportOption = async (option: string) => {
    setExportDialogOpen(false);

    try {
      if (option === 'competitors') {
        await exportCompetitors(empresaId);
      } else {
        const { data, error } = await supabase
          .from<ProblemaData>(option) // Especifica o tipo aqui
          .select('*')
          .eq('empresa_id', empresaId);

        if (error) throw error;

        const dadosPersonalizados = data.map((item: ProblemaData) => {
          const itemPersonalizado: Record<string, string> = {}; // Tipo específico
          Object.keys(campoPersonalizadoProblema).forEach((campoOriginal) => {
            const campoRenomeado = campoPersonalizadoProblema[campoOriginal as keyof ProblemaData];
            itemPersonalizado[campoRenomeado] = item[campoOriginal as keyof ProblemaData];
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

      const csvString = csvRows.map(row => row.join(',')).join('\n');
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

  return (
    <>
      <Button variant="outline" onClick={handleExportClick}>Exportar Dados</Button>
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escolha os dados para exportar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" onClick={() => handleExportOption('problema')}>Problema</Button>
            <Button variant="outline" onClick={() => handleExportOption('clientes')}>Clientes</Button>
            <Button variant="outline" onClick={() => handleExportOption('solucao')}>Solução</Button>
            <Button variant="outline" onClick={() => handleExportOption('concorrentes')}>Concorrentes</Button>
            <Button variant="outline" onClick={() => handleExportOption('financeiro')}>Financeiro</Button>
            <Button variant="outline" onClick={() => handleExportOption('andamento')}>Andamento</Button>
            <Button variant="outline" onClick={() => handleExportOption('competitors')}>Concorrentes</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportFiles;
