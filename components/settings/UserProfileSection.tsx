import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { updateUser } from '../../services/backendApiService';
import { UserCreationData } from '../../types';
import ChangePasswordModal from './ChangePasswordModal';

const UserProfileSection: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastNamePaternal: user?.lastNamePaternal || '',
    lastNameMaternal: user?.lastNameMaternal || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || '',
    username: user?.username || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;
    
    setIsLoading(true);
    try {
      await updateUser(user.id, formData as Partial<UserCreationData>);
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      lastNamePaternal: user?.lastNamePaternal || '',
      lastNameMaternal: user?.lastNameMaternal || '',
      email: user?.email || '',
      phone: user?.phone || '',
      country: user?.country || '',
      username: user?.username || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const inputClassName = (fieldName: string) => 
    `mt-1 p-2 w-full border rounded-md ${
      errors[fieldName] 
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
        : 'border-slate-300 focus:ring-primary focus:border-primary'
    } ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`;

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{t('userProfile')}</h3>
            <p className="text-sm text-slate-500">Manage your personal information and account settings</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowChangePassword(true)}
              variant="secondary"
              size="sm"
            >
              {t('changePassword')}
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} size="sm">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('saveChanges')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('firstName')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('name')}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('lastNamePaternal')}
            </label>
            <input
              type="text"
              name="lastNamePaternal"
              value={formData.lastNamePaternal}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('lastNamePaternal')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('lastNameMaternal')}
            </label>
            <input
              type="text"
              name="lastNameMaternal"
              value={formData.lastNameMaternal}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('lastNameMaternal')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('username')}
            />
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('email')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('email')}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('cellNumber')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('phone')}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              {t('country')}
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClassName('country')}
            />
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </>
  );
};

export default UserProfileSection;
