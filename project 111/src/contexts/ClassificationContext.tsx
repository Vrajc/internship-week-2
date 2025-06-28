import React, { createContext, useContext, useState } from 'react';

export interface Classification {
  id: string;
  userId: string;
  imageUrl: string;
  objectName: string;
  category: string;
  hazardousElements: string[];
  confidence: number;
  createdAt: Date;
}

interface ClassificationContextType {
  classifications: Classification[];
  addClassification: (classification: Omit<Classification, 'id' | 'createdAt'>) => void;
  getUserClassifications: (userId: string) => Classification[];
  getAllClassifications: () => Classification[];
}

const ClassificationContext = createContext<ClassificationContextType | undefined>(undefined);

export const useClassification = () => {
  const context = useContext(ClassificationContext);
  if (context === undefined) {
    throw new Error('useClassification must be used within a ClassificationProvider');
  }
  return context;
};

export const ClassificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classifications, setClassifications] = useState<Classification[]>([
    {
      id: '1',
      userId: '1',
      imageUrl: 'https://images.pexels.com/photos/442559/pexels-photo-442559.jpeg',
      objectName: 'Laptop Battery',
      category: 'Battery',
      hazardousElements: ['Lead', 'Cadmium', 'Mercury'],
      confidence: 94.2,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      userId: '1',
      imageUrl: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
      objectName: 'Smartphone',
      category: 'Mobile Device',
      hazardousElements: ['Lithium', 'Cobalt'],
      confidence: 87.5,
      createdAt: new Date('2024-01-14')
    },
    {
      id: '3',
      userId: '1',
      imageUrl: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
      objectName: 'Circuit Board',
      category: 'Electronic Component',
      hazardousElements: ['Lead', 'Mercury', 'Chromium'],
      confidence: 91.8,
      createdAt: new Date('2024-01-13')
    }
  ]);

  const addClassification = (classification: Omit<Classification, 'id' | 'createdAt'>) => {
    const newClassification: Classification = {
      ...classification,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setClassifications(prev => [newClassification, ...prev]);
  };

  const getUserClassifications = (userId: string) => {
    return classifications.filter(c => c.userId === userId);
  };

  const getAllClassifications = () => {
    return classifications;
  };

  return (
    <ClassificationContext.Provider value={{
      classifications,
      addClassification,
      getUserClassifications,
      getAllClassifications
    }}>
      {children}
    </ClassificationContext.Provider>
  );
};