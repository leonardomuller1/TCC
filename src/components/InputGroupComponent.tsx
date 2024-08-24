//componentes
import { ReactNode } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

//interface
interface InputGroupProps {
  title?: string;
  subtitle?: string  | ReactNode;
  label: string;
  placeholder: string;
  value: string;
  divider: boolean;
  rows: number;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void; 
}

const InputGroup: React.FC<InputGroupProps> = ({
  title,
  subtitle,
  label,
  placeholder,
  value,
  divider,
  rows,
  onChange
}) => {
  return (
    <div className="max-w-2xl flex flex-col gap-2">
      <div className='pb-2'>
        <h4 className="text-gray-900 text-lg font-semibold">{title}</h4>
        <h5 className='text-gray-500 text-sm font-normal'>{subtitle}</h5>
      </div>
      <Label>{label}</Label>
      <Textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange}/>
      {divider && <div className="h-px w-full bg-gray-200"></div>}
    </div>
  );
};

export default InputGroup;
