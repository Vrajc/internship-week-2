import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<Array<{email: string, password: string, name: string, role: string}>>([
    // Default admin account
    { email: 'admin@example.com', password: 'password', name: 'Admin User', role: 'admin' }
  ]);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    const storedUsers = localStorage.getItem('registeredUsers');
    
    if (storedUsers) {
      setRegisteredUsers(JSON.parse(storedUsers));
    }
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if user exists in registered users
      const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        return false;
      }

      const mockResponse = {
        user: {
          id: foundUser.email === 'admin@example.com' ? '1' : Date.now().toString(),
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role as 'user' | 'admin'
        },
        token: 'mock-jwt-token'
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      setUser(mockResponse.user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role = 'user'): Promise<boolean> => {
    try {
      // Check if user already exists
      if (registeredUsers.some(u => u.email === email)) {
        return false;
      }

      const newUser = { email, password, name, role };
      const updatedUsers = [...registeredUsers, newUser];
      
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      const mockResponse = {
        user: {
          id: Date.now().toString(),
          name,
          email,
          role: role as 'user' | 'admin'
        },
        token: 'mock-jwt-token'
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      setUser(mockResponse.user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};