import React, { useState, useRef } from 'react';
import { Camera, Aperture, Upload, RefreshCw, Info, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const SpeciesRecognition = () => {
  // States
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [speciesInfo, setSpeciesInfo] = useState<{ species: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Start camera capture
  const startCapture = async () => {
    setError(null);
    setCapturedImage(null);
    setSpeciesInfo(null);
    
    try {
      if (captureMode === 'camera') {
        setIsCapturing(true);
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões ou tente o modo de upload.');
      setIsCapturing(false);
      console.error('Erro ao acessar câmera:', err);
    }
  };
  
  // Stop camera capture
  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCapture();
      }
    } catch (err) {
      setError('Erro ao capturar imagem.');
      console.error('Erro ao capturar imagem:', err);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCapturedImage(null);
    setSpeciesInfo(null);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem selecionada é muito grande. Por favor, selecione uma imagem menor que 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Improved image preprocessing with better quality control and enhanced debugging
  const preprocessImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        let quality = 0.9;
        let result = canvas.toDataURL('image/jpeg', quality);
        
        console.log(`Initial processed image size: ${Math.round(result.length / 1024)}KB`);
        
        if (result.length > 800000) {
          quality = 0.7;
          result = canvas.toDataURL('image/jpeg', quality);
          console.log(`Reduced quality to 0.7, new size: ${Math.round(result.length / 1024)}KB`);
        }
        
        if (result.length > 500000) {
          quality = 0.5;
          result = canvas.toDataURL('image/jpeg', quality);
          console.log(`Reduced quality to 0.5, new size: ${Math.round(result.length / 1024)}KB`);
        }
        
        if (result.length > 300000) {
          const smallerCanvas = document.createElement('canvas');
          smallerCanvas.width = Math.floor(width * 0.75);
          smallerCanvas.height = Math.floor(height * 0.75);
          const smallerCtx = smallerCanvas.getContext('2d');
          smallerCtx?.drawImage(img, 0, 0, smallerCanvas.width, smallerCanvas.height);
          result = smallerCanvas.toDataURL('image/jpeg', 0.5);
          console.log(`Reduced dimensions and quality, final size: ${Math.round(result.length / 1024)}KB`);
        }
        
        resolve(result);
      };
      
      img.onerror = () => {
        console.error('Error loading image for preprocessing');
        resolve(dataUrl);
      };
      
      img.src = dataUrl;
    });
  };
  
  // Process the image with AI - improved error handling and user feedback
  const processImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setError(null);
    setSpeciesInfo(null);
    
    try {
      toast({
        title: "Processando imagem",
        description: "Analisando imagem e identificando espécie. Isto pode levar alguns instantes...",
      });
      
      const processedImage = await preprocessImage(capturedImage);
      console.log("Image prepared for sending, size:", Math.round(processedImage.length / 1024), "KB");
      
      if (!processedImage || processedImage.length < 100) {
        throw new Error('Dados de imagem inválidos. Por favor, tente novamente com outra foto.');
      }
      
      const payload = {
        image: processedImage
      };
      
      console.log("Sending request to species-recognition edge function");
      
      const { data, error: functionError } = await supabase.functions.invoke('species-recognition', {
        body: payload
      });
      
      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Erro ao processar imagem');
      }
      
      if (data && data.error) {
        console.error('API error:', data.error, data.details);
        throw new Error(data.error);
      }
      
      if (!data || !data.species) {
        throw new Error('Resposta inválida do serviço de reconhecimento');
      }
      
      console.log("Species recognition successful:", data);
      setSpeciesInfo(data);
      setDialogOpen(true);
      toast({
        title: "Sucesso!",
        description: "Espécie identificada com sucesso!",
        variant: "default",
      });
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setError('Ocorreu um erro ao analisar a imagem. Por favor, tente novamente com uma foto mais clara e nítida.');
      toast({
        title: "Erro",
        description: "Falha ao identificar espécie. Tente uma foto com melhor iluminação e foco no objeto principal.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Reset the component
  const resetComponent = () => {
    stopCapture();
    setCapturedImage(null);
    setSpeciesInfo(null);
    setError(null);
    setDialogOpen(false);
  };
  
  // Switch capture mode
  const switchMode = (mode: 'camera' | 'upload') => {
    stopCapture();
    setCaptureMode(mode);
    setCapturedImage(null);
    setSpeciesInfo(null);
    setError(null);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Component cleanup
  React.useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);
  
  // Enhanced description formatting for better readability
  const formatDescription = (text: string) => {
    let formattedText = text
      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-semibold text-nature-700 dark:text-nature-400 mt-4 mb-2">$1</h2>')
      .replace(/^## (.*$)/gim, '<h3 class="text-lg font-medium text-nature-600 dark:text-nature-500 mt-3 mb-1">$1</h3>')
      .replace(/^### (.*$)/gim, '<h4 class="text-md font-medium text-nature-600 dark:text-nature-500 mt-2 mb-1">$1</h4>')
      .replace(/\*([^*]+)\*/g, '<em class="text-nature-600 dark:text-nature-400 font-italic">$1</em>')
      .replace(/^\s*[\-\*]\s+(.+)$/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n\n/g, '<br /><br />')
      .replace(/\n/g, '<br />');
    
    return formattedText;
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-4 sm:p-5">
      <div className="flex justify-center mb-4">
        <div className="flex w-full max-w-[280px] bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-md transition-colors text-xs sm:text-sm py-2 h-auto",
              captureMode === 'camera' && "bg-white dark:bg-gray-600 shadow-sm"
            )}
            onClick={() => switchMode('camera')}
          >
            <Camera className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span>Câmera</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-md transition-colors text-xs sm:text-sm py-2 h-auto",
              captureMode === 'upload' && "bg-white dark:bg-gray-600 shadow-sm"
            )}
            onClick={() => switchMode('upload')}
          >
            <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span>Upload</span>
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      {captureMode === 'camera' && !capturedImage && (
        <div className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700 aspect-[4/3] mb-4">
          {isCapturing ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={captureImage}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-2 sm:p-3 shadow-lg"
                aria-label="Capturar foto"
              >
                <Aperture className="h-6 w-6 sm:h-8 sm:w-8 text-nature-600" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center">
              <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 px-2">
                Capture uma foto de planta ou animal para identificação
              </p>
              <Button 
                onClick={startCapture}
                size="sm"
                className="px-3 py-1 h-auto sm:h-10 sm:px-4 sm:py-2"
              >
                <Camera className="mr-1 sm:mr-2 h-4 w-4" />
                <span>Iniciar câmera</span>
              </Button>
            </div>
          )}
        </div>
      )}
      
      {captureMode === 'upload' && !capturedImage && (
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-8 mb-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-1">
            Clique para selecionar uma imagem ou arraste e solte aqui
          </p>
          <p className="text-xs text-gray-400 mt-1 sm:mt-2 px-1">
            Formato: JPG, PNG. Tamanho máximo: 5MB
          </p>
        </div>
      )}
      
      {capturedImage && (
        <div className="mb-4">
          <div className="relative rounded-lg overflow-hidden aspect-[4/3] mb-3">
            <img 
              src={capturedImage} 
              alt="Imagem capturada" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={resetComponent}
              disabled={isProcessing}
              className="w-full sm:flex-1 py-2 h-auto text-sm"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Nova foto
            </Button>
            <Button
              onClick={processImage}
              disabled={isProcessing}
              className="w-full sm:flex-1 bg-nature-600 hover:bg-nature-700 py-2 h-auto text-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Leaf className="mr-1.5 h-4 w-4" />
                  Identificar espécie
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-nature-700 dark:text-nature-400">
              {speciesInfo?.species || 'Espécie identificada'}
            </DialogTitle>
            <DialogDescription>
              Identificação e detalhes da espécie
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            {speciesInfo?.description ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: formatDescription(speciesInfo.description) 
                }} />
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Informações detalhadas não disponíveis.
              </p>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpeciesRecognition;
