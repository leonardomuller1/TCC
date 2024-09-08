import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

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

  const daysInMonth = (year: number, month: number): number =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number): number =>
    new Date(year, month, 1).getDay();
  const lastDayOfMonth = (year: number, month: number): number =>
    new Date(year, month, daysInMonth(year, month)).getDay();

  const startOfWeek = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const daysOfWeek = (startDate: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + i,
        ),
      );
    }
    return days;
  };

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    } else {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7,
        ),
      );
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    } else {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 7,
        ),
      );
    }
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
      const prevMonthDate = new Date(
        year,
        month - 1,
        daysInMonth(year, month - 1) - i,
      );
      calendar.push(
        <div
          key={`prev-${i}`}
          className="flex flex-col border p-2 bg-gray-100 text-gray-300"
        >
          <div className="text-xs">{prevMonthDate.getDate()}</div>
        </div>,
      );
    }

    // Days of the current month
    for (let i = 1; i <= days; i++) {
      const date = new Date(year, month, i);
      const hasTask = tarefas.some(
        (tarefa) =>
          new Date(tarefa.prazo).toDateString() === date.toDateString(),
      );

      calendar.push(
        <div key={i} className={`flex flex-col border p-2 bg-gray-50`}>
          <div className="text-xs font-medium">{i}</div>
          {hasTask && (
            <div className="mt-2 text-sm text-gray-700">
              {tarefas
                .filter(
                  (tarefa) =>
                    new Date(tarefa.prazo).toDateString() ===
                    date.toDateString(),
                )
                .map((tarefa) => (
                  <div
                  key={tarefa.id}
                  onClick={() => onTaskClick(tarefa)}
                  className="mb-2 border border-gray-200 rounded-md px-2 py-1 flex items-center"
                >
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${
                      tarefa.status === 'A fazer'
                        ? 'bg-orange-400'
                        : tarefa.status === 'Fazendo'
                          ? 'bg-sky-400'
                          : tarefa.status === 'Aprovação'
                            ? 'bg-purple-400'
                            : tarefa.status === 'Feito'
                              ? 'bg-emerald-400'
                              : ''
                    }`}
                  />
                  {tarefa.nome}
                </div>
                ))}
            </div>
          )}
        </div>,
      );
    }

    // Days from the next month
    for (let i = 1; calendar.length < totalDays; i++) {
      calendar.push(
        <div
          key={`next-${i}`}
          className="flex flex-col border p-2 bg-gray-100 text-gray-300"
        >
          <div className="text-xs">{i}</div>
        </div>,
      );
    }

    return calendar;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const week = daysOfWeek(startDate);
    return week.map((date, index) => {
      const tasksForDay = tarefas.filter(
        (tarefa) =>
          new Date(tarefa.prazo).toDateString() === date.toDateString(),
      );

      return (
        <div key={index} className={`flex flex-col border p-2`}>
          <div className="text-xs">
            {date.toLocaleDateString('default', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </div>
          {tasksForDay.length > 0 && (
            <div className="text-sm text-gray-700 mt-2">
              {tasksForDay.map((tarefa) => (
                <div
                  key={tarefa.id}
                  onClick={() => onTaskClick(tarefa)}
                  className="mb-2 border border-gray-200 rounded-md px-2 py-1 flex items-center"
                >
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${
                      tarefa.status === 'A fazer'
                        ? 'bg-gray-400'
                        : tarefa.status === 'Fazendo'
                          ? 'bg-yellow-400'
                          : tarefa.status === 'Aprovação'
                            ? 'bg-blue-400'
                            : tarefa.status === 'Feito'
                              ? 'bg-green-400'
                              : ''
                    }`}
                  />
                  {tarefa.nome}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-screen flex flex-col border rounded-md	border-gray-200">
      <div className="flex gap-2 justify-between py-2 px-4">
        <div className="flex gap-2 items-center	">
          <Button onClick={handlePrev} variant="outline">
            {'<'}
          </Button>
          <div className="text-sm font-medium text-gray-700">
            {view === 'month'
              ? `Mês: ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`
              : `Semana de ${startOfWeek(currentDate).toLocaleDateString()}`}
          </div>
          <Button onClick={handleNext} variant="outline">
            {'>'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleToday} variant="outline">
            Hoje
          </Button>
          <Button
            onClick={() => setView(view === 'month' ? 'week' : 'month')}
            variant="outline"
          >
            {view === 'month' ? 'Ver Semana' : 'Ver Mês'}
          </Button>
        </div>
      </div>

      <div
        className={`flex flex-wrap ${view === 'month' ? 'grid grid-cols-7' : 'grid grid-cols-7 gap-0'} overflow-auto flex-1`}
      >
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
};

export default Calendar;
