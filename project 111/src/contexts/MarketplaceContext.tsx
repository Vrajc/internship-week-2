import React, { createContext, useContext, useState } from 'react';

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  condition: 'excellent' | 'good' | 'fair' | 'parts';
  category: string;
  images: string[];
  createdAt: Date;
  isActive: boolean;
}

interface MarketplaceContextType {
  items: MarketplaceItem[];
  addItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => void;
  removeItem: (itemId: string) => void;
  getUserItems: (userId: string) => MarketplaceItem[];
  getAllItems: () => MarketplaceItem[];
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MarketplaceItem[]>([
    {
      id: '1',
      sellerId: '1',
      sellerName: 'John Doe',
      title: 'iPhone 12 Pro - Excellent Condition',
      description: 'Barely used iPhone 12 Pro with original box, charger, and screen protector. Battery health at 95%.',
      price: 650,
      condition: 'excellent',
      category: 'Smartphones',
      images: ['https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400&h=300&fit=crop'],
      createdAt: new Date('2024-01-15'),
      isActive: true
    },
    {
      id: '2',
      sellerId: '2',
      sellerName: 'Jane Smith',
      title: 'Gaming Laptop - Parts Only',
      description: 'ASUS ROG laptop with motherboard issues. Screen, keyboard, and other components work perfectly.',
      price: 200,
      condition: 'parts',
      category: 'Laptops',
      images: ['https://images.pexels.com/photos/442559/pexels-photo-442559.jpeg?w=400&h=300&fit=crop'],
      createdAt: new Date('2024-01-14'),
      isActive: true
    }
  ]);

  const addItem = (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
    const newItem: MarketplaceItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setItems(prev => [newItem, ...prev]);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getUserItems = (userId: string) => {
    return items.filter(item => item.sellerId === userId);
  };

  const getAllItems = () => {
    return items.filter(item => item.isActive);
  };

  return (
    <MarketplaceContext.Provider value={{
      items,
      addItem,
      removeItem,
      getUserItems,
      getAllItems
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
};