import React, { useState } from 'react';

// Tipos
type Tarefa = {
    id: number;
    empresa_id: string; // Adicionar
    nome: string;
    descricao: string;
    prazo: string;
    status: string;
    responsavel: string;
    created_at: string; // Adicionar
    updated_at: string; // Adicionar
  };

type Status = {
  id: string;
  nome: string;
};

interface KanbanBoardProps {
  tarefas: Tarefa[];
  statusList: Status[];
  onStatusChange: (tarefaId: number, newStatus: string) => void;
  onTaskClick: (tarefa: Tarefa) => void; // Nova prop para lidar com clique na tarefa
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tarefas,
  statusList,
  onStatusChange,
  onTaskClick,
}) => {
  const [draggedTask, setDraggedTask] = useState<Tarefa | null>(null);

  const handleDragStart = (tarefa: Tarefa) => {
    setDraggedTask(tarefa);
  };

  const handleDrop = (status: string) => {
    if (draggedTask) {
      onStatusChange(draggedTask.id, status);
      setDraggedTask(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex gap-4">
      {statusList.map((status) => (
        <div
          key={status.id}
          onDrop={() => handleDrop(status.nome)}
          onDragOver={handleDragOver}
          className="w-1/4 bg-gray-100 p-4 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-bold mb-4">{status.nome}</h3>
          {tarefas
            .filter((tarefa) => tarefa.status === status.nome)
            .map((tarefa) => (
              <div
                key={tarefa.id}
                draggable
                onDragStart={() => handleDragStart(tarefa)}
                onClick={() => onTaskClick(tarefa)} // Chama a função quando a tarefa é clicada
                className="bg-white p-2 mb-2 rounded-lg shadow-sm cursor-pointer"
              >
                <h4 className="font-medium">{tarefa.nome}</h4>
                <p className="text-sm text-gray-600">{formatDate(tarefa.prazo)}</p>
                <p className="text-sm text-gray-400">Responsável: {tarefa.responsavel}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
