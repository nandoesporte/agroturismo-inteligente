
import React, { useState } from 'react';
import { 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Plus, 
  ArrowLeftRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Slide = {
  image: string;
  title: string;
  subtitle: string;
};

const AdminHeroSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Descubra o Agroturismo no Paraná',
      subtitle: 'Experiências autênticas em meio à natureza e cultura rural'
    },
    {
      image: 'https://images.unsplash.com/photo-1464278533981-50e57c3a85bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Sabores da Terra',
      subtitle: 'Conheça as delícias da gastronomia rural paranaense'
    },
    {
      image: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Paisagens Deslumbrantes',
      subtitle: 'Caminhos e trilhas para se conectar com a natureza'
    },
    {
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: 'Fazendas Históricas',
      subtitle: 'Conheça a história e a cultura das fazendas centenárias do Paraná'
    },
    {
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80',
      title: 'Vida Rural Autêntica',
      subtitle: 'Experiências genuínas de convivência com famílias rurais'
    }
  ]);
  
  const [editingSlide, setEditingSlide] = useState<Slide & { index: number } | null>(null);
  const [newSlide, setNewSlide] = useState<Slide>({
    image: '',
    title: '',
    subtitle: ''
  });
  
  const handleDelete = (index: number) => {
    if (slides.length <= 1) {
      toast({
        title: "Erro",
        description: "Você precisa manter pelo menos um slide.",
        variant: "destructive"
      });
      return;
    }
    
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);
    toast({
      title: "Sucesso",
      description: "Slide removido com sucesso.",
    });
  };
  
  const handleEdit = () => {
    if (!editingSlide) return;
    
    const newSlides = [...slides];
    newSlides[editingSlide.index] = {
      image: editingSlide.image,
      title: editingSlide.title,
      subtitle: editingSlide.subtitle
    };
    
    setSlides(newSlides);
    setEditingSlide(null);
    toast({
      title: "Sucesso",
      description: "Slide atualizado com sucesso.",
    });
  };
  
  const handleAdd = () => {
    if (!newSlide.image || !newSlide.title || !newSlide.subtitle) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setSlides([...slides, newSlide]);
    setNewSlide({
      image: '',
      title: '',
      subtitle: ''
    });
    toast({
      title: "Sucesso",
      description: "Novo slide adicionado com sucesso.",
    });
  };
  
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === slides.length - 1)) {
      return;
    }
    
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the slides
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setSlides(newSlides);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Slides do Hero</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Slide</DialogTitle>
              <DialogDescription>
                Preencha todos os campos para adicionar um novo slide à seção hero.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-image">URL da Imagem</Label>
                <Input
                  id="new-image"
                  placeholder="https://example.com/image.jpg"
                  value={newSlide.image}
                  onChange={(e) => setNewSlide({...newSlide, image: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-title">Título</Label>
                <Input
                  id="new-title"
                  placeholder="Título do Slide"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-subtitle">Subtítulo</Label>
                <Textarea
                  id="new-subtitle"
                  placeholder="Descrição do slide"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({...newSlide, subtitle: e.target.value})}
                />
              </div>
              
              {newSlide.image && (
                <div className="space-y-2">
                  <Label>Prévia</Label>
                  <div className="relative aspect-video overflow-hidden rounded-md">
                    <img 
                      src={newSlide.image} 
                      alt="Prévia" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/600x400?text=Imagem+Inválida";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="submit" onClick={handleAdd}>Adicionar Slide</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute top-2 right-2 flex space-x-1 z-10">
              <Button variant="outline" size="icon" className="bg-white" onClick={() => moveSlide(index, 'up')} disabled={index === 0}>
                <ArrowLeftRight className="h-4 w-4 rotate-90" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white" onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1}>
                <ArrowLeftRight className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
            
            <CardHeader className="p-0">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="object-cover w-full h-full" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400?text=Imagem+Inválida";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <CardTitle className="truncate text-lg">{slide.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{slide.subtitle}</p>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setEditingSlide({...slide, index})}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Editar Slide</DialogTitle>
                    <DialogDescription>
                      Altere as informações do slide conforme necessário.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {editingSlide && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-image">URL da Imagem</Label>
                        <Input
                          id="edit-image"
                          value={editingSlide.image}
                          onChange={(e) => setEditingSlide({...editingSlide, image: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Título</Label>
                        <Input
                          id="edit-title"
                          value={editingSlide.title}
                          onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-subtitle">Subtítulo</Label>
                        <Textarea
                          id="edit-subtitle"
                          value={editingSlide.subtitle}
                          onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                        />
                      </div>
                      
                      {editingSlide.image && (
                        <div className="space-y-2">
                          <Label>Prévia</Label>
                          <div className="relative aspect-video overflow-hidden rounded-md">
                            <img 
                              src={editingSlide.image} 
                              alt="Prévia" 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://placehold.co/600x400?text=Imagem+Inválida";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleEdit}>Salvar Alterações</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O slide será permanentemente removido.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(index)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHeroSlides;
