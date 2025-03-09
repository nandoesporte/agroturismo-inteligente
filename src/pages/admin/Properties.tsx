import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, Plus, Trash2, Image, Database, Phone, 
  Mail, Clock, Home, Download, Loader2 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrapingTool } from '@/components/admin/ScrapingTool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  review_count: number;
  image: string;
  tags: string[];
  amenities?: string[];
  hours?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    image: '',
    tags: '',
    amenities: '',
    hours: '',
    contact_phone: '',
    contact_email: '',
    contact_website: '',
    is_featured: false
  });
  const [activeTab, setActiveTab] = useState("properties");
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar propriedades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_featured: checked }));
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      location: property.location,
      price: property.price.toString(),
      image: property.image || '',
      tags: property.tags ? property.tags.join(', ') : '',
      amenities: property.amenities ? property.amenities.join(', ') : '',
      hours: property.hours || '',
      contact_phone: property.contact?.phone || '',
      contact_email: property.contact?.email || '',
      contact_website: property.contact?.website || '',
      is_featured: property.is_featured
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        throw new Error('O preço deve ser um número válido e positivo');
      }
      
      const propertyData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        amenities: formData.amenities.split(',').map(amenity => amenity.trim()).filter(amenity => amenity),
        hours: formData.hours.trim(),
        contact: {
          phone: formData.contact_phone.trim(),
          email: formData.contact_email.trim(),
          website: formData.contact_website.trim()
        },
        is_featured: formData.is_featured
      };

      let result;
      
      if (editingProperty) {
        result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id)
          .select();
          
        toast({
          title: "Propriedade atualizada",
          description: "A propriedade foi atualizada com sucesso.",
        });
      } else {
        result = await supabase
          .from('properties')
          .insert(propertyData)
          .select();
          
        toast({
          title: "Propriedade adicionada",
          description: "A propriedade foi adicionada com sucesso.",
        });
      }

      if (result.error) throw result.error;
      
      setOpenDialog(false);
      fetchProperties();
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar propriedade:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta propriedade?")) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Propriedade excluída",
        description: "A propriedade foi excluída com sucesso.",
      });
      
      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingProperty(null);
    setFormData({
      name: '',
      location: '',
      price: '',
      image: '',
      tags: '',
      amenities: '',
      hours: '',
      contact_phone: '',
      contact_email: '',
      contact_website: '',
      is_featured: false
    });
  };

  const handleImportProperty = (property: any) => {
    setFormData({
      name: property.name || '',
      location: property.location || '',
      price: property.price ? property.price.toString() : '',
      image: property.image || '',
      tags: Array.isArray(property.tags) ? property.tags.join(', ') : '',
      amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
      hours: property.hours || '',
      contact_phone: property.contact?.phone || '',
      contact_email: property.contact?.email || '',
      contact_website: property.contact?.website || '',
      is_featured: property.is_featured || false
    });
    setOpenDialog(true);
  };

  const normalizePrice = (priceStr: string): number => {
    if (!priceStr || priceStr === 'Não informado' || priceStr === 'Sob consulta') {
      return 0;
    }
    
    const match = priceStr.match(/\d+/);
    if (match) {
      return parseFloat(match[0]);
    }
    return 0;
  };

  const handleImportPredefinedProperties = async () => {
    setImportLoading(true);
    
    try {
      const predefinedProperties = [
        {
          name: "Pousada Paraná",
          location: "Turvo",
          price: normalizePrice("A partir de R$235"),
          image: "",
          tags: ["Trilhas ecológicas", "cachoeira", "escalada", "tirolesa", "rapel"],
          amenities: ["Wi-Fi", "estacionamento coberto", "cozinha equipada"],
          hours: "Não informado",
          contact: {
            phone: "(42) 99980-4079",
            email: "",
            website: "https://www.gralhaazul.eco.br/hospedagem/pousada-parana"
          },
          is_featured: false
        },
        {
          name: "Pousada Parque São Luiz do Purunã",
          location: "Balsa Nova",
          price: 0,
          image: "",
          tags: ["Caminhadas", "pescarias", "passeios a cavalo", "banho de cachoeira", "mountain bike"],
          amenities: ["Piscina natural", "redário", "comida caseira"],
          hours: "Não informado",
          contact: {
            phone: "Não informado",
            email: "",
            website: "https://www.pousadaparquepuruna.com.br/"
          },
          is_featured: false
        },
        {
          name: "Virá Hotel de Charme",
          location: "Fernandes Pinheiro",
          price: 0,
          image: "",
          tags: ["Pesca", "pedalinho", "caiaque", "stand up paddle", "cavalgadas", "trilhas de bicicleta"],
          amenities: ["Piscina aquecida", "hidromassagem", "lareira"],
          hours: "Não informado",
          contact: {
            phone: "Não informado",
            email: "",
            website: "https://www.vira.com.br/"
          },
          is_featured: false
        },
        {
          name: "Mata Atlântica Park Hotel",
          location: "Pontal do Paraná",
          price: 0,
          image: "",
          tags: ["Trilhas", "cachoeiras"],
          amenities: ["Piscinas", "saunas", "hidromassagem", "recreação infantil", "quadras de esporte"],
          hours: "Não informado",
          contact: {
            phone: "Não informado",
            email: "",
            website: "https://www.mataatlanticapark.com.br/"
          },
          is_featured: false
        },
        {
          name: "Hotel Lago das Pedras",
          location: "Apucarana",
          price: 0,
          image: "",
          tags: ["Pedalinho", "pesca"],
          amenities: ["4 piscinas (infantil, com tobogã, coberta)", "sauna", "restaurante"],
          hours: "Não informado",
          contact: {
            phone: "Não informado",
            email: "",
            website: "https://www.lagodaspedras.com.br/"
          },
          is_featured: false
        },
        {
          name: "Pousada Fazenda Ribeirão das Flores",
          location: "Bocaiúva do Sul",
          price: 0,
          image: "",
          tags: ["Trilhas", "cascatas"],
          amenities: ["Piscina com tobogã", "área de meditação"],
          hours: "Não informado",
          contact: {
            phone: "Não informado",
            email: "",
            website: "https://www.ribeiraodasflores.com.br/"
          },
          is_featured: false
        },
        {
          name: "Hotel Fazenda Salto Bandeirantes",
          location: "Bandeirantes",
          price: 0,
          image: "",
          tags: ["Trilha para cachoeira", "pescaria", "cavalgadas"],
          amenities: ["Piscinas", "piscina natural", "quadras esportivas", "salão de jogos", "bar molhado"],
          hours: "Não informado",
          contact: {
            phone: "Não informado",
            email: "",
            website: "https://www.saltobandeirantes.com.br/"
          },
          is_featured: false
        }
      ];
      
      const { data, error } = await supabase
        .from('properties')
        .insert(predefinedProperties)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Importação concluída",
        description: `${predefinedProperties.length} propriedades foram importadas com sucesso.`,
      });
      
      fetchProperties();
      setImportDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao importar propriedades:', error);
      toast({
        title: "Erro na importaç��o",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Propriedades</h1>
            <TabsList className="mt-2">
              <TabsTrigger value="properties">Propriedades</TabsTrigger>
              <TabsTrigger value="scraping">Raspagem de Dados</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Importar Lista
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Importar Propriedades Predefinidas</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá adicionar 7 propriedades predefinidas ao sistema. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleImportPredefinedProperties}
                    disabled={importLoading}
                  >
                    {importLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      'Importar'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-nature-600 hover:bg-nature-700" 
                  onClick={() => {
                    resetForm();
                    setOpenDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Nova Propriedade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProperty ? 'Editar' : 'Adicionar'} Propriedade</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes da propriedade abaixo.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="price">Preço (R$)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="image">URL da Imagem</Label>
                        <div className="flex gap-2 flex-col sm:flex-row">
                          <Input
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                          />
                          <Button type="button" variant="outline" className="flex-shrink-0">
                            <Image className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="tags">Atividades (separadas por vírgula)</Label>
                        <Input
                          id="tags"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="Café Colonial, Trilhas, Pousada"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="amenities">Comodidades (separadas por vírgula)</Label>
                        <Input
                          id="amenities"
                          name="amenities"
                          value={formData.amenities}
                          onChange={handleInputChange}
                          placeholder="Wi-Fi, Estacionamento, Café da manhã"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="hours">Horário de Funcionamento</Label>
                        <Input
                          id="hours"
                          name="hours"
                          value={formData.hours}
                          onChange={handleInputChange}
                          placeholder="Seg-Sex: 9h às 17h, Sáb-Dom: 10h às 16h"
                        />
                      </div>
                      
                      <div className="col-span-1 md:col-span-2">
                        <h3 className="text-sm font-medium mb-2">Informações de Contato</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="contact_phone">Telefone</Label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <Phone className="h-4 w-4" />
                              </span>
                              <Input
                                id="contact_phone"
                                name="contact_phone"
                                value={formData.contact_phone}
                                onChange={handleInputChange}
                                className="rounded-l-none"
                                placeholder="(42) 9999-9999"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="contact_email">Email</Label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                <Mail className="h-4 w-4" />
                              </span>
                              <Input
                                id="contact_email"
                                name="contact_email"
                                type="email"
                                value={formData.contact_email}
                                onChange={handleInputChange}
                                className="rounded-l-none"
                                placeholder="contato@exemplo.com"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="contact_website">Website</Label>
                            <Input
                              id="contact_website"
                              name="contact_website"
                              value={formData.contact_website}
                              onChange={handleInputChange}
                              placeholder="https://exemplo.com.br"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-1 md:col-span-2 flex items-center space-x-2">
                        <Checkbox
                          id="is_featured"
                          checked={formData.is_featured}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="is_featured">Destacar na página inicial</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="properties">
          <div className="bg-white rounded-md shadow overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-nature-600 rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando propriedades...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma propriedade encontrada.</p>
                <Button 
                  className="mt-4 bg-nature-600 hover:bg-nature-700" 
                  onClick={() => setOpenDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Propriedade
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Localização</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="hidden lg:table-cell">Classificação</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Destaque</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium md:table-cell">
                        <div className="md:hidden font-bold mb-1">Nome:</div>
                        {property.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{property.location}</TableCell>
                      <TableCell>
                        <div className="sm:hidden font-bold mb-1">Preço:</div>
                        {property.price > 0 ? `R$ ${property.price.toFixed(2)}` : "Não informado"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {property.rating > 0 ? (
                          <div className="flex items-center">
                            <span className="text-amber-500">★</span>
                            <span className="ml-1">{property.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({property.review_count})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sem avaliações</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {property.is_featured ? (
                          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full inline-block">
                            Sim
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full inline-block">
                            Não
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(property)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(property.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="scraping">
          <div className="bg-white rounded-md shadow p-4 md:p-6">
            <ScrapingTool onImportProperty={handleImportProperty} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProperties;
