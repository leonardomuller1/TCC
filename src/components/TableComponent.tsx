import React from 'react';
import { PlusCircledIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
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
  className?:string;
}

const DataTable: React.FC<MyTableComponentProps> = ({
  headers,
  rows,
  onAddClick,
  onOptionsClick,
  emptyStateMessage = "Nenhum dado encontrado :(",
  emptyStateDescription = "Vamos começar a planejar agora mesmo",
  emptyStateImage = "./emptystate.png",
  hidePlusIcon = false,
  externalAddButton,
  className
}) => {
  return (
    <div className={className}>
      {externalAddButton && (
        <div className="mb-4 flex justify-end">
          {externalAddButton}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {rows.length === 0 ? (
          <div className="text-center py-10">
            {emptyStateImage && (
              <div className="mb-4">
                <img src={emptyStateImage} alt="Empty State" className="mx-auto h-80 w-80 object-contain" />
              </div>
            )}
            <p className="text-gray-500">{emptyStateMessage}</p>
            <p className="text-gray-400 mt-2">{emptyStateDescription}</p>
            <div className="mt-4">
              {externalAddButton ? (
                externalAddButton
              ) : (
                <Button
                  onClick={onAddClick}
                >
                  <PlusCircledIcon className="w-5 h-5 inline mr-1" />
                  Adicionar nova informação
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Adicionando overflow-x-scroll para permitir scroll horizontal
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
                  <th scope="col" className="relative px-2 py-3 text-right text-sm text-gray-500 font-semibold">
                    <div className="flex justify-end">
                      <button onClick={onAddClick} className="focus:outline-none">
                        {!hidePlusIcon && (
                          <PlusCircledIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                        )}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-gray-50 hover:bg-gray-100/30">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 text-sm text-gray-800">
                        {cell}
                      </td>
                    ))}
                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <button onClick={() => onOptionsClick(rowIndex)} className="focus:outline-none">
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
    </div>
  );
};

export default DataTable;
