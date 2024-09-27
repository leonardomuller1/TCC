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
  filterTipo: string;
  setFilterTipo: (value: string) => void;
  filterDataInicial: string;
  setFilterDataInicial: (value: string) => void;
  filterDataFinal: string;
  setFilterDataFinal: (value: string) => void;
  handleAddRegistro: () => void;
}

const FiltersFinancials: React.FC<FilterProps> = ({
  filterName,
  setFilterName,
  filterTipo,
  setFilterTipo,
  filterDataInicial,
  setFilterDataInicial,
  filterDataFinal,
  setFilterDataFinal,
  handleAddRegistro,
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
        <Select
          onValueChange={(value) => setFilterTipo(value)}
          value={filterTipo}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">Todos os tipos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-grow">
        <Input
          type="date"
          placeholder="Data Inicial"
          value={filterDataInicial}
          onChange={(e) => setFilterDataInicial(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-grow">
        <Input
          type="date"
          placeholder="Data Final"
          value={filterDataFinal}
          onChange={(e) => setFilterDataFinal(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-shrink-0">
        <Button onClick={handleAddRegistro} className="w-full md:w-auto">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Adicionar Registro
        </Button>
      </div>
    </div>
  );
};

export default FiltersFinancials;
