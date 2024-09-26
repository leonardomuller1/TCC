import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterProps {
  filterName: string;
  setFilterName: (value: string) => void;
  filterResponsavel: string;
  setFilterResponsavel: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  handleAddTarefa: () => void;
}

const FiltersTasks: React.FC<FilterProps> = ({
  filterName,
  setFilterName,
  filterResponsavel,
  setFilterResponsavel,
  filterStatus,
  setFilterStatus,
  handleAddTarefa,
}) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <div className="flex-grow">
        <Input
          type="text"
          placeholder="Filtrar por nome da tarefa"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-grow">
        <Input
          type="text"
          placeholder="Filtrar por responsável"
          value={filterResponsavel}
          onChange={(e) => setFilterResponsavel(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-grow">
        <Select
          onValueChange={(value) => setFilterStatus(value)}
          value={filterStatus}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status da tarefa" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">Status da tarefa</SelectItem>
              <SelectItem value="A fazer">A fazer</SelectItem>
              <SelectItem value="Fazendo">Fazendo</SelectItem>
              <SelectItem value="Aprovação">Aprovação</SelectItem>
              <SelectItem value="Feito">Feito</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-shrink-0">
        <Button onClick={handleAddTarefa} className="w-full md:w-auto">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Adicionar tarefa
        </Button>
      </div>
    </div>
  );
};

export default FiltersTasks;
