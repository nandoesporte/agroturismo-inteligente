
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ImageIcon, 
  Settings2Icon,
  BookOpenTextIcon,
  HomeIcon,
  LayoutGridIcon,
  UserCogIcon
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminSettings = () => {
  const settingsCards = [
    {
      title: "Slides do Hero",
      description: "Gerencie as imagens e textos que aparecem no carousel da página inicial",
      icon: <ImageIcon className="h-6 w-6" />,
      link: "/admin/hero-slides"
    },
    {
      title: "Configurações do Site",
      description: "Configurações gerais do site como nome, descrição e informações de contato",
      icon: <Settings2Icon className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Conteúdo da Página Sobre",
      description: "Edite as informações exibidas na página Sobre",
      icon: <BookOpenTextIcon className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Configurações da Página Inicial",
      description: "Personalize os componentes exibidos na página inicial",
      icon: <HomeIcon className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Layout e Aparência",
      description: "Personalize cores, fontes e outros elementos visuais",
      icon: <LayoutGridIcon className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Permissões de Usuários",
      description: "Configure permissões e papéis de usuário",
      icon: <UserCogIcon className="h-6 w-6" />,
      link: "#"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card, index) => (
          <Card key={index} className={card.link === "#" ? "opacity-70" : ""}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                {card.icon}
              </div>
              <div>
                <CardTitle>{card.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{card.description}</CardDescription>
            </CardContent>
            <CardFooter>
              {card.link !== "#" ? (
                <Button asChild className="w-full">
                  <Link to={card.link}>Gerenciar</Link>
                </Button>
              ) : (
                <Button disabled className="w-full">Em breve</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
