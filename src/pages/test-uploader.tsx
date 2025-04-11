import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ImageUploader from '@/components/ImageUploader';

export default function TestUploader() {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    toast.success('Imagem enviada com sucesso', {
      description: `URL: ${url.substring(0, 30)}...`
    });
  };

  const handleImageDelete = () => {
    setImageUrl(undefined);
    toast.info('Imagem removida');
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-8">
        <h1 className="text-3xl font-bold text-center">
          Teste do Componente ImageUploader
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Upload de Imagem</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader 
              initialImageUrl={imageUrl}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              height="300px"
              label="Imagem de Teste"
              maxSizeMB={2}
              customPath="test-uploads"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">URL da imagem:</p>
            <pre className="p-3 bg-muted mt-2 rounded-md text-sm break-all">
              {imageUrl || 'Nenhuma imagem enviada'}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Componente Desabilitado</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader 
              initialImageUrl="https://via.placeholder.com/300"
              height="200px"
              label="Componente Desabilitado"
              isDisabled={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 