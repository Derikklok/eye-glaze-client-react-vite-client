import { createContext, useContext, useState, ReactNode } from 'react';

// User interface
interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    _id: string;
    username: string;
    createdAt: string;
    age: number;
  };
}

interface RegisterResponse {
  status: string;
  message: string;
  data: {
    id: string;
    username: string;
    age: number;
    createdAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, birthDate: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for localStorage
const saveUserToStorage = (user: User) => {
  localStorage.setItem('eyeGlazeUser', JSON.stringify(user));
};

const removeUserFromStorage = () => {
  localStorage.removeItem('eyeGlazeUser');
};

const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('eyeGlazeUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user state from localStorage
  const [user, setUser] = useState<User | null>(() => getUserFromStorage());
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the backend API with credentials
      const response = await fetch('http://localhost:5174/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Adapting email to username for API compatibility
          password,
        }),
      });

      const data = await response.json() as LoginResponse;
      console.log(data.data.username);
      
      if (!response.ok || data.status !== 'success') {
        const errorMsg = data.message || `Login failed with status: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      // Format user data to match our User interface
      const newUser: User = {
        id: data.data._id,
        email: data.data.username,
        name: data.data.username.split('@')[0],
        age: data.data.age
      };
      
      setUser(newUser);
      saveUserToStorage(newUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to be handled by the component
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, birthDate: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5174/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password,
          birthDate,
        }),
      });

      const data = await response.json() as RegisterResponse;
      
      if (!response.ok || data.status !== 'success') {
        const errorMsg = data.message || `Registration failed with status: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      // Format user data to match our User interface
      const newUser: User = {
        id: data.data.id,
        email: data.data.username,
        name: name || data.data.username.split('@')[0],
        age: data.data.age
      };
      
      setUser(newUser);
      saveUserToStorage(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeUserFromStorage();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}