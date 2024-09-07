import React, { useState } from 'react';

type Tarefa = {
  id: number;
  empresa_id: string;
  nome: string;
  descricao: string;
  status: string;
  prazo: string;
  responsavel: string;
  created_at: string;
  updated_at: string;
};

type CalendarProps = {
  tarefas: Tarefa[];
  onTaskClick: (tarefa: Tarefa) => void;
};

const Calendar: React.FC<CalendarProps> = ({ tarefas, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();
  const lastDayOfMonth = (year: number, month: number): number => new Date(year, month, daysInMonth(year, month)).getDay();

  const startOfWeek = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const daysOfWeek = (startDate: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handlePrevWeek = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const lastDay = lastDayOfMonth(year, month);
    const calendar = [];
    const totalDays = firstDay + days + (6 - lastDay);

    // Days from the previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonthDate = new Date(year, month - 1, daysInMonth(year, month - 1) - i);
      calendar.push(
        <div
          key={`prev-${i}`}
          className="flex flex-col border p-2 bg-gray-200 text-gray-400"
        >
          <div className="text-sm">{prevMonthDate.getDate()}</div>
        </div>
      );
    }

    // Days of the current month
    for (let i = 1; i <= days; i++) {
      const date = new Date(year, month, i);
      const hasTask = tarefas.some(tarefa => new Date(tarefa.prazo).toDateString() === date.toDateString());

      calendar.push(
        <div
          key={i}
          className={`flex flex-col border p-2 ${hasTask ? 'bg-blue-100' : 'bg-white'} ${
            i % 7 === 0 ? 'border-b-2' : ''
          }`}
        >
          <div className="text-sm font-medium">{i}</div>
          {hasTask && (
            <div className="mt-2 text-xs text-gray-700">
              {tarefas
                .filter(tarefa => new Date(tarefa.prazo).toDateString() === date.toDateString())
                .map(tarefa => (
                  <div key={tarefa.id} onClick={() => onTaskClick(tarefa)}>
                    <strong>{tarefa.nome}</strong>
                    <p>{tarefa.descricao}</p>
                    <p>
                      <em>Prazo: {new Date(tarefa.prazo).toLocaleDateString()}</em>
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      );
    }

    // Days from the next month
    for (let i = 1; calendar.length < totalDays; i++) {
      calendar.push(
        <div
          key={`next-${i}`}
          className="flex flex-col border p-2 bg-gray-200 text-gray-400"
        >
          <div className="text-sm">{i}</div>
        </div>
      );
    }

    return calendar;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const week = daysOfWeek(startDate);
    return week.map((date, index) => {
      const tasksForDay = tarefas.filter(tarefa => new Date(tarefa.prazo).toDateString() === date.toDateString());

      return (
        <div
          key={index}
          className={`flex flex-col border p-2 ${tasksForDay.length > 0 ? 'bg-blue-100' : 'bg-white'} border-r-2`}
        >
          <div className="text-xs">
            {date.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          {tasksForDay.length > 0 && (
            <div className="text-xs text-gray-700 mt-2">
              {tasksForDay.map(tarefa => (
                <div key={tarefa.id} onClick={() => onTaskClick(tarefa)}>
                  <strong>{tarefa.nome}</strong>
                  <p>{tarefa.descricao}</p>
                  <p>
                    <em>Prazo: {new Date(tarefa.prazo).toLocaleDateString()}</em>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-200">
        <button
          onClick={handlePrevMonth}
          disabled={view === 'week'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {'<'}
        </button>
        <button
          onClick={handlePrevWeek}
          disabled={view === 'month'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {'<'}
        </button>
        <div className="text-lg font-bold">
          {view === 'month'
            ? `Mês: ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`
            : `Semana de ${startOfWeek(currentDate).toLocaleDateString()}`
          }
        </div>
        <button
          onClick={handleNextMonth}
          disabled={view === 'week'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {'>'}
        </button>
        <button
          onClick={handleNextWeek}
          disabled={view === 'month'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {'>'}
        </button>
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Hoje
        </button>
        <button
          onClick={() => setView(view === 'month' ? 'week' : 'month')}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          {view === 'month' ? 'Ver Semana' : 'Ver Mês'}
        </button>
      </div>
      <div className={`flex flex-wrap ${view === 'month' ? 'grid grid-cols-7 gap-1' : 'grid grid-cols-7 gap-0'} overflow-auto flex-1`}>
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
};

export default Calendar;
