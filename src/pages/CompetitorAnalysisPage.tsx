import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import useAuthStore from "@/stores/useAuthStore";
import { useToast } from '@/components/ui/use-toast';

interface TableData {
  [key: string]: { [key: string]: boolean };
}

const DynamicTable: React.FC = () => {
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
          className: 'bg-red-300',
          duration: 4000,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("competitors")
          .select("*")
          .eq("empresa_id", user.companyId)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);

        if (data) {
          setColumns(data.colunas);
          setRows(data.linhas);
          setTableData(data.dados);
        } else {
          // Inicializar dados padrão caso não exista registro
          const defaultColumns = ["Column 1"];
          const defaultRows = ["Row 1"];
          const defaultData: TableData = {
            "Row 1": { "Column 1": false },
          };
          
          setColumns(defaultColumns);
          setRows(defaultRows);
          setTableData(defaultData);
          saveData(defaultColumns, defaultRows, defaultData);
        }
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const saveData = async (updatedColumns: string[], updatedRows: string[], updatedData: TableData) => {
    try {
      const uniqueName = `competitors_${user?.companyId}`;
      const { error } = await supabase
        .from("competitors")
        .upsert({
          empresa_id: user?.companyId,
          name: uniqueName, // Usando um nome único
          colunas: updatedColumns,
          linhas: updatedRows,
          dados: updatedData,
        }, { onConflict: ['empresa_id'] }); // Garante que o registro existente seja atualizado

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }
  };

  const handleAddColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;
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
    const newRowName = `Row ${rows.length + 1}`;
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
    <div>
      <button onClick={handleAddColumn}>Add Column</button>
      <button onClick={handleAddRow}>Add Row</button>

      <table>
        <thead>
          <tr>
            <th></th>
            {columns.map((column, colIndex) => (
              <th key={colIndex}>
                <input
                  type="text"
                  value={column}
                  onChange={(e) =>
                    handleColumnTitleChange(colIndex, e.target.value)
                  }
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <input
                  type="text"
                  value={row}
                  onChange={(e) =>
                    handleRowTitleChange(rowIndex, e.target.value)
                  }
                />
              </td>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  <input
                    type="checkbox"
                    checked={tableData[row]?.[column] || false}
                    onChange={() => handleCheckBoxChange(row, column)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
