// MAIS Political Command Center - Login Form
// Swiss Precision Standards - Secure Authentication

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../../contexts/appContextUtils';
import MAISLogo from '../../../ui/components/MAISLogo';
import ErrorDisplay from '../../../ui/components/ErrorDisplay';
import LoadingSpinner from '../../../ui/components/LoadingSpinner';
import { Lock, AtSign } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, loading, error } = useApp();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <MAISLogo className="h-16 w-auto" />
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Centro de Mando</h1>
            <p className="text-gray-500">Inicia sesión para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <ErrorDisplay message={error} />}
            
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Contraseña"
                {...register('password')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out flex items-center justify-center disabled:bg-blue-400"
            >
              {loading ? <LoadingSpinner /> : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Movimiento Alternativo Indígena y Social (MAIS).
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
