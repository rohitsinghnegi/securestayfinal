import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:5000';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord';
  profilePicture?: string;
  verified: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'student' | 'landlord') => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'landlord';
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { profilePictureFile?: File }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (apiUser: any, fallbackRole?: 'student' | 'landlord'): User => {
    const role = (apiUser.role as 'student' | 'landlord') || fallbackRole || 'student';
    const picture = apiUser.profilePicture
      ? String(apiUser.profilePicture).startsWith('http')
        ? apiUser.profilePicture
        : `${API_BASE_URL}/uploads/${apiUser.profilePicture}`
      : undefined;

    return {
      id: apiUser._id || apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      role,
      verified: Boolean(apiUser.verified),
      phone: apiUser.phone,
      profilePicture: picture,
    };
  };

  // Try to restore user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    const hydrate = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error('Failed to fetch current user');
        const data = await resp.json();
        const normalizedUser: User = normalizeUser(data.user);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  const login = async (email: string, password: string, role?: 'student' | 'landlord') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Login failed');
      }

      const data = await response.json();
      const token: string = data.token;
      const normalizedUser: User = normalizeUser(data.user, role);

      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      if (token) localStorage.setItem('token', token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'landlord';
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Registration failed');
      }

      const data = await response.json();
      const token: string = data.token;
      const normalizedUser: User = normalizeUser(data.user, userData.role);

      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      if (token) localStorage.setItem('token', token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<User> & { profilePictureFile?: File }) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      if (typeof data.name === 'string') form.append('name', data.name);
      if (typeof data.email === 'string') form.append('email', data.email);
      if (typeof data.phone === 'string') form.append('phone', data.phone);
      if (data.profilePictureFile) form.append('profilePicture', data.profilePictureFile);

      const resp = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to update profile');
      }

      const body = await resp.json();
      const normalizedUser: User = normalizeUser(body.user);
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile, changePassword, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
