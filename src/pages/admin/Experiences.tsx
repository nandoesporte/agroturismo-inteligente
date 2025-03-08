
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Trash2, Image, Clock } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  review_count: number;
  category: string;
  created_at: string;
  updated_at: string;
}

const AdminExperiences = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    duration: '',
    price: '',
    category: ''
  });
  const { toast } = useToast();

  const categories = ["Gastronomia", "Aventura", "Cultural", "Familiar", "Bem-estar"];

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar experiências",
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

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      title: experience.title,
      description: experience.description,
      image: experience.image || '',
      duration: experience.duration,
      price: experience.price.toString(),
      category: experience.category || 'Aventura'
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const experienceData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        duration: formData.duration,
        price: parseFloat(formData.price),
        category: formData.category
      };

      let result;
      
      if (editingExperience) {
        result = await supabase
          .from('experiences')
          .update(experienceData)
          .eq('id', editingExperience.id)
          .select();
          
        toast({
          title: "Experiência atualizada",
          description: "A experiência foi atualizada com sucesso.",
        });
      } else {
        result = await supabase
          .from('experiences')
          .insert(experienceData)
          .select();
          
        toast({
          title: "Experiência adicionada",
          description: "A experiência foi adicionada com sucesso.",
        });
      }

      if (result.error) throw result.error;
      
      setOpenDialog(false);
      fetchExperiences();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta experiência?")) return;
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Experiência excluída",
        description: "A experiência foi excluída com sucesso.",
      });
      
      fetchExperiences();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingExperience(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      duration: '',
      price: '',
      category: 'Aventura'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Experiências</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-nature-600 hover:bg-nature-700" 
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Experiência
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Editar' : 'Adicionar'} Experiência</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da experiência abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="duration">Duração</Label>
                    <div className="relative">
                      <Input
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="2 horas"
                        required
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="image">URL da Imagem</Label>
                    <div className="flex gap-2">
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
                  <div className="col-span-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-nature-600 rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando experiências...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma experiência encontrada.</p>
            <Button 
              className="mt-4 bg-nature-600 hover:bg-nature-700" 
              onClick={() => setOpenDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Experiência
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell className="font-medium">{experience.title}</TableCell>
                  <TableCell>
                    <span className="bg-nature-100 text-nature-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {experience.category}
                    </span>
                  </TableCell>
                  <TableCell>{experience.duration}</TableCell>
                  <TableCell>R$ {experience.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {experience.rating > 0 ? (
                      <div className="flex items-center">
                        <span className="text-amber-500">★</span>
                        <span className="ml-1">{experience.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({experience.review_count})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sem avaliações</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(experience)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(experience.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
    </div>
  );
};

export default AdminExperiences;
