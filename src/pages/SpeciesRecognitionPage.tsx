
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpeciesRecognition from '@/components/SpeciesRecognition';
import { Leaf } from 'lucide-react';

const SpeciesRecognitionPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center justify-center p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-full mb-3 sm:mb-4">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-nature-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Identificador de Espécies
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-2">
              Tire uma foto ou faça upload de uma imagem para identificar plantas e animais
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-4 sm:p-6">
            <SpeciesRecognition />
          </div>
          
          <div className="mt-6 sm:mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Dicas para melhores resultados:</h3>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1">
              <li>Tire fotos com boa iluminação</li>
              <li>Mantenha a câmera estável ao fotografar</li>
              <li>Capture a planta ou animal de perto, mas com o objeto inteiro visível</li>
              <li>Para plantas, tente incluir flores, folhas ou frutos se possível</li>
              <li>Para animais, tente uma visão lateral clara</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SpeciesRecognitionPage;
