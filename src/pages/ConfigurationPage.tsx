import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import CardPages from '@/components/dashboard/CardPagesComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageFile extends File {
  preview: string;
}

function ConfigurationPage() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0] as unknown as ImageFile;
      setImage(Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
    }
  });

  return (
    <CardPages>
      <h1 className="text-gray-900 font-bold text-2xl">Configurações</h1>
      <form className="gap-4 flex flex-col w-1/3">
        <div className="gap-2 flex flex-col">
          <Label>Nome</Label>
          <Input type="text" />
        </div>
        <div className="gap-2 flex flex-col">
          <Label>E-mail</Label>
          <Input type="email" />
        </div>
        <div className="gap-2 flex flex-col">
          <Label>Foto</Label>
          <div {...getRootProps()} className="rounded-md border border-gray-300 p-4 cursor-pointer">
            <input {...getInputProps()} />
            {image ? (
              <img src={image.preview} alt="Preview" className="w-32 h-32 object-cover" />
            ) : (
              <p className='text-sm text-gray-500'>Arraste e solte a imagem aqui, ou clique para selecionar uma imagem</p>
            )}
          </div>
        </div>
        <div className="gap-2 flex flex-col">
          <Label>Senha atual</Label>
          <Input type="password" />
        </div>
        <div className="gap-2 flex flex-col">
          <Label>Senha nova</Label>
          <Input type="password" />
        </div>
        <Button>Alterar dados</Button>
      </form>
    </CardPages>
  );
}

export default ConfigurationPage;
