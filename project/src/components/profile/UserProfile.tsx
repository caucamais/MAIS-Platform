// MAIS Political Command Center - User Profile Component
// Swiss Precision Standards - Complete Profile Management

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Phone, MapPin, Calendar, Shield, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG } from '../../types';
import type { User as UserType } from '../../types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, updatePassword, loading } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) return null;

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido';
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (profileData.phone && !/^\+?[\d\s-()]+$/.test(profileData.phone)) {
      errors.phone = 'Número de teléfono inválido';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    const success = await updateProfile(profileData);
    if (success) {
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    const success = await updatePassword(passwordData.newPassword);
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Contraseña actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleInputChange = (field: string, value: string, form: 'profile' | 'password') => {
    if (form === 'profile') {
      setProfileData(prev => ({ ...prev, [field]: value }));
    } else {
      setPasswordData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      comite_ejecutivo_nacional: 'Comité Ejecutivo Nacional',
      lider_regional: 'Líder Regional',
      comite_departamental: 'Comité Departamental',
      candidato: 'Candidato',
      influenciador_digital: 'Influenciador Digital',
      lider_comunitario: 'Líder Comunitario',
      votante_simpatizante: 'Votante/Simpatizante'
    };
    return roleNames[role] || role;
  };

  const getTerritoryDisplayName = (zone: string) => {
    return TERRITORY_CONFIG[zone as keyof typeof TERRITORY_CONFIG]?.name || zone;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
                      <p className="text-white/80 text-sm">{user.full_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-6 py-3 bg-green-50 border-b border-green-200"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-green-700 text-sm">{successMessage}</p>
                  </div>
                </motion.div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Información Personal</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'security'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Seguridad</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'profile' ? (
                  <div className="space-y-6">
                    {/* User Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Rol Político</p>
                            <p className="font-medium">{getRoleDisplayName(user.role)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Territorio</p>
                            <p className="font-medium">{getTerritoryDisplayName(user.territory_zone)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value, 'profile')}
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                              validationErrors.full_name
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            disabled={loading}
                          />
                        </div>
                        {validationErrors.full_name && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value, 'profile')}
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                              validationErrors.email
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            disabled={loading}
                          />
                        </div>
                        {validationErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono (Opcional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value, 'profile')}
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                              validationErrors.phone
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="+57 300 123 4567"
                            disabled={loading}
                          />
                        </div>
                        {validationErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Save className="h-5 w-5" />
                          <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                        </div>
                      </motion.button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Password Status */}
                    <div className={`p-4 rounded-lg border ${
                      user.is_password_changed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        {user.is_password_changed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            user.is_password_changed ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {user.is_password_changed 
                              ? 'Contraseña personalizada configurada' 
                              : 'Usando contraseña temporal'
                            }
                          </p>
                          <p className={`text-sm ${
                            user.is_password_changed ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {user.is_password_changed 
                              ? 'Tu cuenta está segura con una contraseña personalizada'
                              : 'Se recomienda cambiar la contraseña temporal por seguridad'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value, 'password')}
                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                              validationErrors.newPassword
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Mínimo 8 caracteres"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {validationErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value, 'password')}
                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors ${
                              validationErrors.confirmPassword
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Repite la nueva contraseña"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {validationErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span>Mínimo 8 caracteres</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              /(?=.*[a-z])/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span>Al menos una letra minúscula</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              /(?=.*[A-Z])/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span>Al menos una letra mayúscula</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              /(?=.*\d)/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span>Al menos un número</span>
                          </li>
                        </ul>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 hover:from-red-700 hover:via-yellow-700 hover:to-green-700 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Lock className="h-5 w-5" />
                          <span>{loading ? 'Actualizando...' : 'Cambiar Contraseña'}</span>
                        </div>
                      </motion.button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserProfile;