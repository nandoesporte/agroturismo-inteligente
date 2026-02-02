
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService, ExtractedProperty } from '@/utils/FirecrawlService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Undo2, Check, X, ExternalLink, Phone, Mail, Info, Sparkles, Clock, Home, Tag, AlertTriangle, FileCheck, Save } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

const predefinedUrls = [
  { name: "Trivago Agroturismo Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/agriturismo-pousada-rural?search=paraná%20agroturismo" },
  { name: "Trivago Pousadas Rurais Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/pousada-rural?search=paraná%20pousada%20rural" },
  { name: "Trivago Fazendas Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/fazenda-hotel?search=paraná%20fazenda%20hotel" },
  { name: "Trivago Hotéis Rurais Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/hotel%20rural?search=paraná%20hotel%20rural" },
  { name: "Trivago Ecoturismo Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/eco%20resort?search=paraná%20ecoturismo" },
  { name: "Chalés no Paraná", url: "https://www.trivago.com.br/pt-BR/srl/hotels-paraná-brasil/chales?search=paraná%20chalés" },
  { name: "Cafés Coloniais Paraná", url: "https://www.google.com/search?q=cafés+coloniais+paraná" }
];

const propertyCategories = [
  "Todos",
  "Agroturismo",
  "Turismo Rural",
  "Fazenda",
  "Chalé",
  "Café Colonial",
  "Pousada Rural"
];

interface ScrapingToolProps {
  onImportProperty: (property: any) => void;
  onBatchImport: (properties: any[]) => void;
}

export const ScrapingTool: React.FC<ScrapingToolProps> = ({ onImportProperty, onBatchImport }) => {
  const { toast } = useToast();
  const [customUrl, setCustomUrl] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(predefinedUrls[0].url);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapedProperties, setScrapedProperties] = useState<ExtractedProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("predefined");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectAll, setSelectAll] = useState(false);
  const [bulkImportInProgress, setBulkImportInProgress] = useState(false);
  const [urlsToScrape, setUrlsToScrape] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [existingProperties, setExistingProperties] = useState<string[]>([]);
  const [importingSelectedInProgress, setImportingSelectedInProgress] = useState(false);
  const [currentImportIndex, setCurrentImportIndex] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);
  const [batchSaveInProgress, setBatchSaveInProgress] = useState(false);

  useEffect(() => {
    fetchExistingProperties();
  }, []);

  const fetchExistingProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('name, location');
      
      if (error) throw error;
      
      const existingIdentifiers = data?.map(p => 
        `${p.name.toLowerCase().trim()}|${p.location.toLowerCase().trim()}`
      ) || [];
      
      setExistingProperties(existingIdentifiers);
    } catch (error) {
      console.error('Error fetching existing properties:', error);
    }
  };

  const propertyExists = (property: ExtractedProperty): boolean => {
    if (!property.name || !property.location) return false;
    
    const identifier = `${property.name.toLowerCase().trim()}|${property.location.toLowerCase().trim()}`;
    return existingProperties.includes(identifier);
  };

  const handleUrlSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleScrape = async (urlToScrape: string) => {
    if (!urlToScrape) {
      toast({
        title: "URL Inválida",
        description: "Por favor, insira uma URL válida para extrair dados",
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
        title: "Iniciando extração de dados",
        description: `Analisando dados de ${urlToScrape} com IA`,
      });

      setProgress(30);
      const result = await FirecrawlService.scrapeWebsite(urlToScrape);
      setProgress(70);
      
      if (result.success && result.properties && result.properties.length > 0) {
        setScrapedProperties(result.properties);
        toast({
          title: "Extração com IA concluída",
          description: `Encontradas ${result.properties.length} propriedades`,
        });
      } else {
        toast({
          title: "Nenhuma propriedade encontrada",
          description: result.error || "A IA não conseguiu extrair dados deste site",
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

    const updatedSelections = { ...selectedProperties, [index]: !selectedProperties[index] };
    const allSelected = filteredProperties.every((_, i) => {
      const originalIndex = scrapedProperties.findIndex(p => p === filteredProperties[i]);
      return updatedSelections[originalIndex];
    });
    
    setSelectAll(allSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    const newSelectedProperties = { ...selectedProperties };
    
    filteredProperties.forEach((property, _) => {
      const originalIndex = scrapedProperties.findIndex(p => p === property);
      newSelectedProperties[originalIndex] = checked;
    });
    
    setSelectedProperties(newSelectedProperties);
  };

  const handleImportSelected = async () => {
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
    
    setImportingSelectedInProgress(true);
    setTotalToImport(selectedItems.length);
    setCurrentImportIndex(0);
    
    // Format properties for import
    const formattedProperties = selectedItems.map(property => ({
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
      type: property.type || '',
      is_featured: false
    }));
    
    // Use the batch import handler
    onBatchImport(formattedProperties);
    
    await fetchExistingProperties();
    
    toast({
      title: "Propriedades importadas",
      description: `${selectedItems.length} propriedades foram importadas para serem salvas em lote`,
    });
    
    setSelectedProperties({});
    setSelectAll(false);
    setImportingSelectedInProgress(false);
  };

  const handleSingleImport = (property: ExtractedProperty) => {
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
      type: property.type || '',
      is_featured: false
    };
    
    onImportProperty(formattedProperty);
    
    toast({
      title: "Propriedade importada",
      description: "A propriedade foi importada para o formulário",
    });
  };

  const handleBulkScrape = async () => {
    const urls = predefinedUrls.map(item => item.url);
    setUrlsToScrape(urls);
    setCurrentUrlIndex(0);
    setBulkImportInProgress(true);
    setScrapedProperties([]);
    setSelectedProperties({});
    
    await processBulkScrape(urls, 0);
  };

  const processBulkScrape = async (urls: string[], index: number) => {
    if (index >= urls.length) {
      setBulkImportInProgress(false);
      toast({
        title: "Processo em lote concluído",
        description: `Extração de ${urls.length} sites finalizada`,
      });
      return;
    }

    setCurrentUrlIndex(index);
    
    const urlToScrape = urls[index];
    toast({
      title: `Processando site ${index + 1} de ${urls.length}`,
      description: `Extraindo dados de: ${predefinedUrls.find(item => item.url === urlToScrape)?.name || urlToScrape}`,
    });

    try {
      setIsLoading(true);
      setProgress(20);
      
      const result = await FirecrawlService.scrapeWebsite(urlToScrape);
      
      if (result.success && result.properties && result.properties.length > 0) {
        setScrapedProperties(prev => [...prev, ...result.properties]);
        
        toast({
          title: "Site processado com sucesso",
          description: `Encontradas ${result.properties.length} propriedades`,
        });
      }
    } catch (error: any) {
      console.error(`Erro ao processar ${urlToScrape}:`, error);
      toast({
        title: "Erro em um dos sites",
        description: `Problema ao processar: ${predefinedUrls.find(item => item.url === urlToScrape)?.name}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
      
      setTimeout(() => {
        processBulkScrape(urls, index + 1);
      }, 1000);
    }
  };

  const filteredProperties = selectedCategory === "Todos"
    ? scrapedProperties
    : scrapedProperties.filter(property => property.type === selectedCategory);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Extração de Dados com IA</CardTitle>
        <CardDescription>
          Use IA para extrair informações de propriedades a partir de sites. Especializado em turismo rural no Paraná.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Buscas Predefinidas (Paraná)</TabsTrigger>
            <TabsTrigger value="custom">URL Personalizada</TabsTrigger>
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
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleScrape(selectedUrl)}
                disabled={isLoading || bulkImportInProgress}
                className="flex-1 bg-nature-600 hover:bg-nature-700"
              >
                {isLoading ? (
                  "Analisando com IA..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Extrair Dados com IA
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleBulkScrape}
                disabled={isLoading || bulkImportInProgress}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {bulkImportInProgress ? (
                  `Processando ${currentUrlIndex + 1}/${urlsToScrape.length}...`
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Extrair Todos os Sites
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-url">URL Personalizada</Label>
              <Input
                id="custom-url"
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Insira qualquer URL de site que contenha dados de propriedades de turismo ou hospedagem.
                Os resultados serão adaptados para o contexto do turismo rural no Paraná.
              </p>
            </div>
            
            <Button
              onClick={() => handleScrape(customUrl)}
              disabled={isLoading || bulkImportInProgress || !customUrl}
              className="w-full bg-nature-600 hover:bg-nature-700"
            >
              {isLoading ? (
                "Analisando com IA..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Extrair Dados com IA
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {(isLoading || bulkImportInProgress) && (
          <Progress value={progress} className="w-full mt-4" />
        )}

        {importingSelectedInProgress && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Importando propriedades ({currentImportIndex}/{totalToImport})</span>
              <span className="text-sm">{Math.round((currentImportIndex / totalToImport) * 100)}%</span>
            </div>
            <Progress value={(currentImportIndex / totalToImport) * 100} className="w-full" />
          </div>
        )}

        {scrapedProperties.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-semibold">
                Propriedades Encontradas ({filteredProperties.length} de {scrapedProperties.length})
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleImportSelected}
                  className="text-sm bg-nature-600 hover:bg-nature-700"
                  disabled={importingSelectedInProgress}
                >
                  {importingSelectedInProgress ? (
                    <>
                      <FileCheck className="h-4 w-4 mr-1 animate-pulse" /> 
                      Importando {currentImportIndex}/{totalToImport}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" /> 
                      Importar Todas Selecionadas
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md">
              <div className="p-3 bg-muted/20 border-b flex items-center">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="mr-3"
                />
                <Label htmlFor="select-all" className="flex-1 cursor-pointer font-medium">
                  Selecionar todas as propriedades ({filteredProperties.length})
                </Label>
              </div>
              
              <div className="divide-y">
                {filteredProperties.map((property, index) => {
                  const originalIndex = scrapedProperties.findIndex(p => p === property);
                  const isExisting = propertyExists(property);
                  
                  return (
                    <div 
                      key={originalIndex} 
                      className={`p-3 flex items-start space-x-3 ${isExisting ? 'bg-amber-50' : ''}`}
                    >
                      <Checkbox
                        id={`property-${originalIndex}`}
                        checked={selectedProperties[originalIndex] || false}
                        onCheckedChange={() => togglePropertySelection(originalIndex)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{property.name || "Propriedade sem nome"}</p>
                              {isExisting && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Duplicada
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Esta propriedade já existe no sistema</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground truncate">
                                {property.location || "Localização não especificada"}
                              </p>
                              {property.type && (
                                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                                  {property.type}
                                </span>
                              )}
                            </div>
                          </div>
                          {property.price && (
                            <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded">
                              {property.price}
                            </span>
                          )}
                        </div>
                        
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
                        
                        {property.hours && (
                          <div className="mt-2 flex items-center gap-1 text-xs">
                            <Clock size={12} className="text-muted-foreground" />
                            <span className="text-muted-foreground">{property.hours}</span>
                          </div>
                        )}
                        
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
                                    <ExternalLink size={12} /> Ver site
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Abrir página no site</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => handleSingleImport(property)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Importar esta propriedade
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            setSelectAll(false);
          }}
          disabled={scrapedProperties.length === 0}
        >
          <Undo2 className="h-4 w-4 mr-2" /> Limpar Resultados
        </Button>
      </CardFooter>
    </Card>
  );
};
