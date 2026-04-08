import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadModels, loadDatabaseFromStorage, getAllUsers } from '../services/faceRecognitionService';

interface User {
  id: string;
  name: string;
  sampleCount: number;
}

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  registeredUsers: User[];
  modelsLoaded: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUsers: () => void;
  recognizeUser: (userId: string, userName: string, confidence: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load models and database on mount
  useEffect(() => {
    const initialize = async () => {
      console.log('Initializing face recognition system...');
      
      // Load face database from localStorage
      loadDatabaseFromStorage();
      refreshUsers();
      
      // Load face-api.js models
      const loaded = await loadModels();
      setModelsLoaded(loaded);
      
      if (loaded) {
        console.log('Face recognition system ready!');
      }
    };
    
    initialize();
  }, []);

  const refreshUsers = () => {
    const users = getAllUsers();
    setRegisteredUsers(users.map(u => ({ id: u.userId, name: u.userName, sampleCount: u.sampleCount })));
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const recognizeUser = (userId: string, userName: string, _confidence: number) => {
    setCurrentUser({ id: userId, name: userName, sampleCount: 0 });
    setIsAuthenticated(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        isAuthenticated,
        currentUser,
        registeredUsers,
        modelsLoaded,
        login,
        logout,
        refreshUsers,
        recognizeUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
