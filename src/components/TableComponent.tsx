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
  className?: string;
  rowsPerPage?: number; // propriedade para definir quantos itens por página
  filters?: Filter[]; // propriedade para definir filtros
}

interface Filter {
  type: 'input' | 'dropdown';
  label: string;
  options?: string[]; // apenas para dropdown
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
  className,
  rowsPerPage = 10, // padrão para 10 itens por página
  filters = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1); // estado para controlar a página atual
  const [filterValues, setFilterValues] = useState<{ [key: string]: string }>({});

  // Função para filtrar as linhas
  const filteredRows = rows.filter((row) => {
    return filters.every((filter) => {
      const value = filterValues[filter.label];
      if (!value) return true;
      const index = headers.indexOf(filter.label);
      if (index === -1) return true;
      return row[index]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage); // calcular o total de páginas

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
  const currentRows = filteredRows.slice(startIndex, endIndex); // pegar apenas as linhas da página atual

  // Função para atualizar os valores dos filtros
  const handleFilterChange = (label: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [label]: value }));
    setCurrentPage(1); // Reiniciar a página atual quando os filtros mudam
  };

  return (
    <div className={className}>

      {filters.length > 0 && (
        <div>
          {filters.map((filter, index) => (
            <div key={index} className="flex flex-col">
              <label>{filter.label}</label>
              {filter.type === 'input' ? (
                <input
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1"
                  onChange={(e) => handleFilterChange(filter.label, e.target.value)}
                />
              ) : (
                <select
                  className="border border-gray-300 rounded px-2 py-1"
                  onChange={(e) => handleFilterChange(filter.label, e.target.value)}
                >
                  <option value="">Selecione</option>
                  {filter.options?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}


      <div className="overflow-hidden rounded-lg border border-gray-200">
        {filteredRows.length === 0 ? (
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
              
                <Button onClick={onAddClick}>
                  <PlusCircledIcon className="w-5 h-5 inline mr-1" />
                  Adicionar nova informação
                </Button>

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
