import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

interface ExportPDFButtonProps {
  data: {
    descricao: string;
    como_resolvido: string;
    impacto: string;
    exemplos: string;
    frequencia: string;
    segmento: string;
    gravidade: string;
  };
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ data }) => {
  const { toast } = useToast();

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();

      // Função para carregar a imagem em Base64
      const loadImage = async (url: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      // Carregar a logo
      const logoBase64 = await loadImage('/logo.png');

      // Adicionar a logo ao PDF
      doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20); // Adiciona o logo no topo esquerdo (10, 10)

      // Título centralizado
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40); // Cor do título
      doc.text('Relatório de Problema', 105, 40, { align: 'center' });

      // Início do conteúdo
      let yPosition = 50;
      const addSection = (title: string, content: string, color: [number, number, number]) => {
        // Título da seção com cor e negrito
        doc.setTextColor(...color);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 10, yPosition);
        yPosition += 8;

        // Conteúdo da seção
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60); // Cor do texto
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, yPosition);
        yPosition += lines.length * 7 + 10;

        // Verificação de quebra de página
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Adicionar as seções com cores diferenciadas
      addSection('Descrição geral do problema', data.descricao, [0, 102, 204]); // Azul para o título
      addSection('Como é resolvido atualmente', data.como_resolvido, [0, 153, 76]); // Verde
      addSection('Impacto do problema', data.impacto, [255, 102, 0]); // Laranja
      addSection('Exemplos e casos de uso', data.exemplos, [153, 51, 255]); // Roxo
      addSection('Frequência e ocorrência do problema', data.frequencia, [255, 51, 51]); // Vermelho
      addSection('Segmento de clientes afetados', data.segmento, [102, 102, 153]); // Cinza
      addSection('Gravidade do problema', data.gravidade, [0, 128, 128]); // Teal

      // Salvar o PDF
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
    <Button onClick={handleExportPDF}>
      Exportar como PDF
    </Button>
  );
};

export default ExportPDFButton;
