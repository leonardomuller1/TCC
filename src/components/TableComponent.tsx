import React, { useState } from 'react';
import {
  PlusCircledIcon,
  DotsHorizontalIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@radix-ui/react-icons';
import { Button } from './ui/button';

interface MyTableComponentProps {
  headers: string[];
  rows: React.ReactNode[][];
  onAddClick: () => void;
  onOptionsClick: (rowIndex: number) => void;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  emptyStateImage?: string;
  hidePlusIcon?: boolean;
  externalAddButton?: React.ReactNode;
  className?: string;
  rowsPerPage?: number; // propriedade para definir quantos itens por página
}

const DataTable: React.FC<MyTableComponentProps> = ({
  headers,
  rows,
  onAddClick,
  onOptionsClick,
  emptyStateMessage = 'Nenhum dado encontrado :(',
  emptyStateDescription = 'Vamos começar a planejar agora mesmo',
  emptyStateImage = './emptystate.png',
  hidePlusIcon = false,
  externalAddButton,
  className,
  rowsPerPage = 10, // padrão para 10 itens por página
}) => {
  const [currentPage, setCurrentPage] = useState(1); // estado para controlar a página atual
  const totalPages = Math.ceil(rows.length / rowsPerPage); // calcular o total de páginas

  // Funções de navegação
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Calcular o índice de início e fim para as linhas exibidas na página atual
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = rows.slice(startIndex, endIndex); // pegar apenas as linhas da página atual

  return (
    <div className={className}>
      {externalAddButton && (
        <div className="mb-4 flex justify-end">{externalAddButton}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {rows.length === 0 ? (
          <div className="text-center py-10">
            {emptyStateImage && (
              <div className="mb-4">
                <img
                  src={emptyStateImage}
                  alt="Empty State"
                  className="mx-auto h-80 w-80 object-contain"
                />
              </div>
            )}
            <p className="text-gray-500">{emptyStateMessage}</p>
            <p className="text-gray-400 mt-2">{emptyStateDescription}</p>
            <div className="mt-4">
              {externalAddButton ? (
                externalAddButton
              ) : (
                <Button onClick={onAddClick}>
                  <PlusCircledIcon className="w-5 h-5 inline mr-1" />
                  Adicionar nova informação
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 text-left text-sm text-gray-500 font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="relative px-2 py-3 text-right text-sm text-gray-500 font-semibold"
                  >
                    <div className="flex justify-end">
                      <button
                        onClick={onAddClick}
                        className="focus:outline-none"
                      >
                        {!hidePlusIcon && (
                          <PlusCircledIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-gray-50 hover:bg-gray-100/30"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 text-sm text-gray-800"
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <button
                          onClick={() => onOptionsClick(rowIndex + startIndex)}
                          className="focus:outline-none"
                        >
                          <DotsHorizontalIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex items-center mt-4 gap-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-2 py-2 text-sm hover:bg-gray-100 rounded"
          >
            <CaretLeftIcon />
          </button>
          <p className="text-sm">
            Página {currentPage} de {totalPages}
          </p>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-2 py-2 text-sm hover:bg-gray-100 rounded"
          >
            <CaretRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
