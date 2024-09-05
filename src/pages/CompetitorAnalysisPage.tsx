import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import useAuthStore from '@/stores/useAuthStore';
import { useToast } from '@/components/ui/use-toast';
import CardPages from '@/components/dashboard/CardPagesComponent';
import { Input } from '@/components/ui/input'; // Componente Input
import { Checkbox } from '@/components/ui/checkbox'; // Componente Checkbox
import { TrashIcon, PlusIcon } from '@radix-ui/react-icons'; // ícones do Radix

interface TableData {
  [key: string]: { [key: string]: boolean };
}

const CompetitorAnalysis: React.FC = () => {
  const { user } = useAuthStore();
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<string[]>([]);
  const [tableData, setTableData] = useState<TableData>({});
  const [loading, setLoading] = useState<boolean>(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.companyId) {
        toast({
          description: 'Usuário não autenticado ou companyId ausente',
          duration: 4000,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('competitors')
          .select('*')
          .eq('empresa_id', user.companyId)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);

        if (data) {
          setColumns(data.colunas);
          setRows(data.linhas);
          setTableData(data.dados);
        } else {
          const defaultColumns = ['Empresa X'];
          const defaultRows = ['CRUD'];
          const defaultData: TableData = {
            CRUD: { 'Empresa X': false },
          };

          setColumns(defaultColumns);
          setRows(defaultRows);
          setTableData(defaultData);
          saveData(defaultColumns, defaultRows, defaultData);
        }
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const saveData = async (
    updatedColumns: string[],
    updatedRows: string[],
    updatedData: TableData,
  ) => {
    try {
      const uniqueName = `competitors_${user?.companyId}`;
      const { error } = await supabase.from('competitors').upsert(
        {
          empresa_id: user?.companyId,
          name: uniqueName,
          colunas: updatedColumns,
          linhas: updatedRows,
          dados: updatedData,
        },
        { onConflict: 'empresa_id' }  // Instead of an array, provide 'empresa_id' as a single string
      );
      

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
    }
  };

  const handleAddColumn = () => {
    const newColumnName = `Empresa ${String.fromCharCode(65 + columns.length)}`;
    const updatedColumns = [...columns, newColumnName];

    const newTableData = { ...tableData };
    rows.forEach((row) => {
      newTableData[row] = {
        ...newTableData[row],
        [newColumnName]: false,
      };
    });

    setColumns(updatedColumns);
    setTableData(newTableData);
    saveData(updatedColumns, rows, newTableData);
  };

  const handleAddRow = () => {
    const newRowName = `Funcionalidade ${rows.length + 1}`;
    const updatedRows = [...rows, newRowName];

    const newTableData = { ...tableData };
    newTableData[newRowName] = {};
    columns.forEach((column) => {
      newTableData[newRowName][column] = false;
    });

    setRows(updatedRows);
    setTableData(newTableData);
    saveData(columns, updatedRows, newTableData);
  };

  const handleDeleteColumn = (colIndex: number) => {
    const columnToDelete = columns[colIndex];
    const updatedColumns = columns.filter((_, index) => index !== colIndex);

    const newTableData = { ...tableData };
    Object.keys(newTableData).forEach((row) => {
      delete newTableData[row][columnToDelete];
    });

    setColumns(updatedColumns);
    setTableData(newTableData);
    saveData(updatedColumns, rows, newTableData);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const rowToDelete = rows[rowIndex];
    const updatedRows = rows.filter((_, index) => index !== rowIndex);

    const newTableData = { ...tableData };
    delete newTableData[rowToDelete];

    setRows(updatedRows);
    setTableData(newTableData);
    saveData(columns, updatedRows, newTableData);
  };

  const handleCheckBoxChange = (row: string, column: string) => {
    const newTableData = { ...tableData };
    newTableData[row][column] = !newTableData[row][column];

    setTableData(newTableData);
    saveData(columns, rows, newTableData);
  };

  const handleColumnTitleChange = (index: number, value: string) => {
    const oldColumnName = columns[index];
    const updatedColumns = [...columns];
    updatedColumns[index] = value;

    const newTableData = { ...tableData };
    Object.keys(newTableData).forEach((row) => {
      newTableData[row][value] = newTableData[row][oldColumnName];
      delete newTableData[row][oldColumnName];
    });

    setColumns(updatedColumns);
    setTableData(newTableData);
    saveData(updatedColumns, rows, newTableData);
  };

  const handleRowTitleChange = (index: number, value: string) => {
    const oldRowName = rows[index];
    const updatedRows = [...rows];
    updatedRows[index] = value;

    const newTableData = { ...tableData };
    newTableData[value] = { ...newTableData[oldRowName] };
    delete newTableData[oldRowName];

    setRows(updatedRows);
    setTableData(newTableData);
    saveData(columns, updatedRows, newTableData);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <CardPages className="overflow-x-auto h-[calc(100vh-100px)] p-4">
      <h1 className="text-gray-900 font-bold text-2xl">
        Análise de concorrentes
      </h1>

      <table className="min-w-full border border-collapse">
        <thead>
          <tr>
            <th className="font-medium text-sm text-gray-500 p-2 border">
              Funcionalidade
            </th>
            {columns.map((column, colIndex) => (
              <th key={colIndex} className="p-2 border">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    type="text"
                    value={column}
                    onChange={(e) =>
                      handleColumnTitleChange(colIndex, e.target.value)
                    }
                    className="font-medium text-sm text-gray-500 bg-transparent border-none px-0 py-0 min-w-[120px]"
                  />
                  <button
                    onClick={() => handleDeleteColumn(colIndex)}
                    className="text-red-500"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </th>
            ))}
            <th>
              <button
                onClick={handleAddColumn}
                className="flex justify-center items-center text-green-500 w-8"
              >
                <PlusIcon />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-2 border">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    type="text"
                    value={row}
                    onChange={(e) =>
                      handleRowTitleChange(rowIndex, e.target.value)
                    }
                    className="font-medium text-sm text-gray-500 bg-transparent border-none px-0 py-0 min-w-[120px]"
                  />
                  <button
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="text-red-500"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </td>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="p-2 border text-center">
                  <Checkbox
                    checked={tableData[row]?.[column] || false}
                    onCheckedChange={() => handleCheckBoxChange(row, column)}
                  />
                </td>
              ))}
            </tr>
          ))}
          <button
            onClick={handleAddRow}
            className="px-4 py-2 text-green-500 flex justify-center items-center w-40 h-8"
          >
            <PlusIcon />
          </button>
        </tbody>
      </table>
    </CardPages>
  );
};

export default CompetitorAnalysis;
