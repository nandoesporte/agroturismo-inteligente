
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService, ExtractedProperty } from '@/utils/FirecrawlService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Undo2, Check, X, ExternalLink, Phone, Mail, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const predefinedUrls = [
  { name: "Paraná Turismo", url: "https://www.turismo.pr.gov.br/" },
  { name: "Viaje Paraná", url: "https://www.viajeparana.com/" },
  { name: "Rota do Café", url: "https://rotadocafe.tur.br/" },
  { name: "Rota dos Vinhedos", url: "https://www.rotadosvinhedos.com.br/" },
  { name: "Turismo Rural Brasil", url: "https://www.turismoruralbrasileiro.com.br/" },
  { name: "Vinícola Durigan", url: "https://www.vinicoladurigan.com.br/" },
  { name: "Fazenda Capoava", url: "https://www.fazendacapoava.com.br/" },
  { name: "Caminhos do Vinho", url: "https://www.caminhosdovinho.org.br/" },
  { name: "Circuito das Frutas SP", url: "https://circuitodasfrutas.com.br/" },
  { name: "Circuito das Águas MG", url: "https://circuitodasaguaspaulista.sp.gov.br/" },
];

interface ScrapingToolProps {
  onImportProperty: (property: any) => void;
}

export const ScrapingTool: React.FC<ScrapingToolProps> = ({ onImportProperty }) => {
  const { toast } = useToast();
  const [customUrl, setCustomUrl] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(predefinedUrls[0].url);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapedProperties, setScrapedProperties] = useState<ExtractedProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("predefined");
  const [currentTab, setCurrentTab] = useState<string>("predefined");

  const handleUrlSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleScrape = async (urlToScrape: string) => {
    if (!urlToScrape) {
      toast({
        title: "URL Inválida",
        description: "Por favor, insira uma URL válida para raspar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setScrapedProperties([]);
    setSelectedProperties({});
    
    try {
      toast({
        title: "Iniciando raspagem de dados",
        description: `Coletando dados de ${urlToScrape}`,
      });

      setProgress(30);
      const result = await FirecrawlService.scrapeWebsite(urlToScrape);
      setProgress(70);
      
      if (result.success && result.properties && result.properties.length > 0) {
        setScrapedProperties(result.properties);
        toast({
          title: "Raspagem concluída",
          description: `Encontradas ${result.properties.length} propriedades`,
        });
      } else {
        toast({
          title: "Nenhum dado encontrado",
          description: result.error || "Não foi possível encontrar dados de propriedades neste site",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na raspagem",
        description: error.message || "Ocorreu um erro ao raspar o site",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const togglePropertySelection = (index: number) => {
    setSelectedProperties(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleImportSelected = () => {
    const selectedItems = Object.entries(selectedProperties)
      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => scrapedProperties[parseInt(index)]);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhuma propriedade selecionada",
        description: "Por favor, selecione pelo menos uma propriedade para importar",
        variant: "destructive",
      });
      return;
    }
    
    selectedItems.forEach(property => {
      // Convert the property to the format expected by the form
      const formattedProperty = {
        name: property.name || '',
        location: property.location || '',
        price: property.price ? parseFloat(property.price.replace(/[^\d.,]/g, '')) || 0 : 0,
        image: property.image || '',
        tags: property.activities || [],
        is_featured: false
      };
      
      onImportProperty(formattedProperty);
    });
    
    toast({
      title: "Propriedades importadas",
      description: `${selectedItems.length} propriedades foram importadas para o formulário`,
    });
    
    // Reset selections
    setSelectedProperties({});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ferramenta de Raspagem de Dados</CardTitle>
        <CardDescription>
          Colete informações sobre propriedades de agroturismo de sites específicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Sites Predefinidos</TabsTrigger>
            <TabsTrigger value="custom">URL Personalizada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {predefinedUrls.map((site) => (
                <div 
                  key={site.url}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    selectedUrl === site.url ? 'border-nature-600 bg-nature-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleUrlSelect(site.url)}
                >
                  <p className="font-medium">{site.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{site.url}</p>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => handleScrape(selectedUrl)}
              disabled={isLoading}
              className="w-full bg-nature-600 hover:bg-nature-700"
            >
              {isLoading ? "Raspando Dados..." : "Raspar Site Selecionado"}
            </Button>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-url">URL do Site</Label>
              <Input
                id="custom-url"
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exemplo.com.br"
                className="w-full"
              />
            </div>
            
            <Button
              onClick={() => handleScrape(customUrl)}
              disabled={isLoading || !customUrl}
              className="w-full bg-nature-600 hover:bg-nature-700"
            >
              {isLoading ? "Raspando Dados..." : "Raspar URL Personalizada"}
            </Button>
          </TabsContent>
        </Tabs>

        {isLoading && (
          <Progress value={progress} className="w-full mt-4" />
        )}

        {scrapedProperties.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Propriedades Encontradas ({scrapedProperties.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportSelected}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Importar Selecionadas
              </Button>
            </div>
            
            <div className="border rounded-md divide-y">
              {scrapedProperties.map((property, index) => (
                <div key={index} className="p-3 flex items-start space-x-3">
                  <Checkbox
                    id={`property-${index}`}
                    checked={selectedProperties[index] || false}
                    onCheckedChange={() => togglePropertySelection(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium truncate">{property.name || "Propriedade sem nome"}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {property.location || "Localização não especificada"}
                        </p>
                      </div>
                      {property.price && (
                        <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded">
                          {property.price}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm mt-1 line-clamp-2">
                      {property.description || "Sem descrição disponível"}
                    </p>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {property.activities && property.activities.length > 0 && (
                        property.activities.map((activity, actIdx) => (
                          <span 
                            key={actIdx} 
                            className="inline-block px-2 py-1 bg-nature-50 text-nature-700 rounded-full text-xs"
                          >
                            {activity}
                          </span>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {property.image && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Info size={12} /> Imagem
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Imagem disponível para esta propriedade</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {property.contact?.phone && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1">
                                <Phone size={12} /> {property.contact.phone}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Telefone de contato</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {property.contact?.email && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1">
                                <Mail size={12} /> {property.contact.email}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Email de contato</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {property.contact?.website && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1">
                                <ExternalLink size={12} /> Site
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Website disponível</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setScrapedProperties([]);
            setSelectedProperties({});
          }}
          disabled={scrapedProperties.length === 0}
        >
          <Undo2 className="h-4 w-4 mr-2" /> Limpar Resultados
        </Button>
      </CardFooter>
    </Card>
  );
};
