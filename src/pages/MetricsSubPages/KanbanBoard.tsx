import React, { useState } from 'react';
import { PlusCircledIcon} from '@radix-ui/react-icons'; // Importando o ícone de Plus

// Tipos
type Tarefa = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  prazo: string;
  status: string;
  responsavel: string;
  created_at: string;
  updated_at: string;
};

type Status = {
  id: string;
  nome: string;
};

interface KanbanBoardProps {
  tarefas: Tarefa[];
  statusList: Status[];
  onStatusChange: (tarefaId: number, newStatus: string) => void;
  onTaskClick: (tarefa: Tarefa) => void;
  onAddTask: (status: string) => void; // Nova prop para adicionar tarefa
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tarefas,
  statusList,
  onStatusChange,
  onTaskClick,
  onAddTask, // Usando a nova prop
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

  function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}


  return (
    <div className="flex gap-4">
      {statusList.map((status) => (
        <div
          key={status.id}
          onDrop={() => handleDrop(status.nome)}
          onDragOver={handleDragOver}
          className="w-1/4 bg-gray-50 p-4 rounded-2xl border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base text-gray-700 font-mediunbg-red-300 self-center">
              {status.nome}
            </h3>
            <button
              onClick={() => onAddTask(status.nome)} // Chama a função para adicionar tarefa com o status da coluna
              className="focus:outline-none"
            >
              <PlusCircledIcon className="w-4 h-4 text-gray-500 hover:text-gray-700"/>
            </button>
          </div>

          {tarefas
            .filter((tarefa) => tarefa.status === status.nome)
            .map((tarefa) => (
              <div
                key={tarefa.id}
                draggable
                onDragStart={() => handleDragStart(tarefa)}
                onClick={() => onTaskClick(tarefa)} // Chama a função quando a tarefa é clicada
                className="border border-gray-200 p-2 mb-2 rounded-mg cursor-pointer"
              >
                <h4 className="font-bold text-sm text-gray-700">
                  {tarefa.nome}
                </h4>
                <div className="flex gap-2">
                  <p className="text-xs	text-gray-700">
                    {formatDate(tarefa.prazo)}
                  </p>
                  <p className="text-xs	text-gray-700">{tarefa.responsavel}</p>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
