// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student' as 'student' | 'landlord'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AUTO REDIRECT if already logged in
  useEffect(() => {
    if (user?.role === 'student') navigate('/student-dashboard');
    else if (user?.role === 'landlord') navigate('/landlord-dashboard');
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password, formData.role);
      // Navigation is handled by useEffect when user updates
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-pink-600 transition-colors">SecureStays</Link>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${formData.role === 'student' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFormData({ ...formData, role: 'student' })}
            >
              Student Login
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${formData.role === 'landlord' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFormData({ ...formData, role: 'landlord' })}
            >
              Landlord Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input type="email" label="Email Address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} error={errors.email} placeholder="Enter your email" />

            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} label="Password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} error={errors.password} placeholder="Enter your password" />
              <button type="button" className="absolute right-3 top-9 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {errors.submit && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{errors.submit}</div>}

            <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
