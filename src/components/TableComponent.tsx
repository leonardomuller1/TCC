import React from 'react';
import { PlusCircledIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';

interface MyTableComponentProps {
  headers: string[];
  rows: string[][];
  onAddClick: () => void;
  onOptionsClick: (rowIndex: number) => void;
}

const DataTable: React.FC<MyTableComponentProps> = ({ headers, rows, onAddClick, onOptionsClick }) => {
  return (
<<<<<<< HEAD
    <div>
=======
    <div className="p-32">
>>>>>>> 596626c3f4b07b844431c40d2df8eb111a722877
      <div className="overflow-hidden rounded-lg border border-gray-200">
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
                    <PlusCircledIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className='hover:bg-gray-100'>
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
    </div>
  );
}

export default DataTable;
