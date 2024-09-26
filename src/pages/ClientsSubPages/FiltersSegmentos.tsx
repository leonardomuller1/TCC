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
  filterTipoCliente: string;
  setFilterTipoCliente: (value: string) => void;
  filterVaiAtender: string;
  setFilterVaiAtender: (value: string) => void;
  handleAddSegmento: () => void;
}

const FiltersSegmentos: React.FC<FilterProps> = ({
  filterName,
  setFilterName,
  filterTipoCliente,
  setFilterTipoCliente,
  filterVaiAtender,
  setFilterVaiAtender,
  handleAddSegmento,
}) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <div className="flex-grow">
        <Input
          type="text"
          placeholder="Filtrar por nome"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-grow">
        <Input
          type="text"
          placeholder="Filtrar por tipo de cliente"
          value={filterTipoCliente}
          onChange={(e) => setFilterTipoCliente(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-grow">
        <Select
          onValueChange={(value) => setFilterVaiAtender(value)}
          value={filterVaiAtender}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por vai atender" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-shrink-0">
        <Button onClick={handleAddSegmento} className="w-full md:w-auto">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Adicionar segmento
        </Button>
      </div>
    </div>
  );
};

export default FiltersSegmentos;