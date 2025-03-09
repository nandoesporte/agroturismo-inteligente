
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
import { Plus, Undo2, Check, X, ExternalLink, Phone, Mail, Info, Sparkles, Clock, Home } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const predefinedUrls = [
  { name: "Trivago Agroturismo Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/agriturismo-pousada-rural?search=paraná%20agroturismo" },
  { name: "Trivago Pousadas Rurais Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/pousada-rural?search=paraná%20pousada%20rural" },
  { name: "Trivago Fazendas Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/fazenda-hotel?search=paraná%20fazenda%20hotel" },
  { name: "Trivago Hotéis Rurais Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/hotel%20rural?search=paraná%20hotel%20rural" },
  { name: "Trivago Ecoturismo Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/eco%20resort?search=paraná%20ecoturismo" }
];

interface ScrapingToolProps {
  onImportProperty: (property: any) => void;
}

export const ScrapingTool: React.FC<ScrapingToolProps> = ({ onImportProperty }) => {
  const { toast } = useToast();
  const [customUrl, setCustomUrl] = useState('https://www.trivago.com.br/pt-BR/');
  const [selectedUrl, setSelectedUrl] = useState(predefinedUrls[0].url);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapedProperties, setScrapedProperties] = useState<ExtractedProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("predefined");

  const handleUrlSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleScrape = async (urlToScrape: string) => {
    if (!urlToScrape) {
      toast({
        title: "URL Inválida",
        description: "Por favor, insira uma URL válida do Trivago para extrair dados",
        variant: "destructive",
      });
      return;
    }

    if (!urlToScrape.includes('trivago.com')) {
      toast({
        title: "URL Inválida",
        description: "Por favor, insira apenas URLs do Trivago. Esta ferramenta está otimizada para buscar dados do Trivago.",
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
        title: "Iniciando extração de agroturismo no Paraná",
        description: `Analisando dados de ${urlToScrape} com IA`,
      });

      setProgress(30);
      const result = await FirecrawlService.scrapeWebsite(urlToScrape);
      setProgress(70);
      
      if (result.success && result.properties && result.properties.length > 0) {
        setScrapedProperties(result.properties);
        toast({
          title: "Extração com IA concluída",
          description: `Encontradas ${result.properties.length} propriedades de agroturismo no Paraná`,
        });
      } else {
        toast({
          title: "Nenhuma propriedade de agroturismo encontrada",
          description: result.error || "A IA não conseguiu extrair dados de propriedades de agroturismo no Paraná neste site",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na extração",
        description: error.message || "Ocorreu um erro ao extrair dados do site com IA",
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
        price: property.price ? parseFloat(property.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0,
        image: property.image || '',
        images: property.images || [],
        tags: property.activities || [],
        amenities: property.amenities || [],
        hours: property.hours || '',
        contact: {
          phone: property.contact?.phone || '',
          email: property.contact?.email || '',
          website: property.contact?.website || ''
        },
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
        <CardTitle>Extração de Agroturismo no Paraná - Trivago</CardTitle>
        <CardDescription>
          Use IA para extrair informações de propriedades de agroturismo no Paraná a partir do Trivago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Buscas Predefinidas</TabsTrigger>
            <TabsTrigger value="custom">URL Personalizada do Trivago</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined" className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
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
              {isLoading ? (
                "Analisando com IA..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Extrair Agroturismo com IA
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-url">URL do Trivago</Label>
              <Input
                id="custom-url"
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://www.trivago.com.br/pt-BR/..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Insira apenas URLs do Trivago. A ferramenta está otimizada para buscar dados de agroturismo no Paraná.
              </p>
            </div>
            
            <Button
              onClick={() => handleScrape(customUrl)}
              disabled={isLoading || !customUrl || !customUrl.includes('trivago.com')}
              className="w-full bg-nature-600 hover:bg-nature-700"
            >
              {isLoading ? (
                "Analisando com IA..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Extrair Agroturismo com IA
                </>
              )}
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
                Propriedades de Agroturismo Encontradas ({scrapedProperties.length})
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
                    
                    {/* Activities */}
                    {property.activities && property.activities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Atividades:</p>
                        <div className="flex flex-wrap gap-1">
                          {property.activities.map((activity, actIdx) => (
                            <span 
                              key={actIdx} 
                              className="inline-block px-2 py-1 bg-nature-50 text-nature-700 rounded-full text-xs"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Comodidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.map((amenity, amenIdx) => (
                            <span 
                              key={amenIdx} 
                              className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Hours */}
                    {property.hours && (
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{property.hours}</span>
                      </div>
                    )}
                    
                    {/* Contact Information */}
                    <div className="mt-2 flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
                      {property.image && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Info size={12} /> Imagem disponível
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
                              <a 
                                href={property.contact.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline"
                              >
                                <ExternalLink size={12} /> Ver no Trivago
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Abrir página no Trivago</p>
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
