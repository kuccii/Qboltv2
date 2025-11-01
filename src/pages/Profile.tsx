import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  MapPin, 
  Phone, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  AppLayout,
  PageHeader,
  PageLayout,
  SectionLayout,
  FormField,
  SelectInput,
  ActionMenu
} from '../design-system';

const Profile: React.FC = () => {
  const { authState, updateUser } = useAuth();
  const currentUser = authState.user;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    company: currentUser?.company || '',
    industry: currentUser?.industry || 'construction',
    country: currentUser?.country || 'Kenya',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    bio: currentUser?.bio || ''
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    if (currentUser) {
      const userData = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        company: currentUser.company || '',
        industry: currentUser.industry || 'construction',
        country: currentUser.country || 'Kenya',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bio: currentUser.bio || ''
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [currentUser]);

  const industryOptions = [
    { value: 'construction', label: 'Construction' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' }
  ];

  const countryOptions = [
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Tanzania', label: 'Tanzania' },
    { value: 'Ethiopia', label: 'Ethiopia' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      await updateUser(formData);
      
      setOriginalData(formData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setMessage(null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <AppLayout>
      <PageHeader
        title="Profile"
        subtitle="Manage your account information and preferences"
        breadcrumbs={[{ label: 'Profile' }]}
        actions={
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <X size={16} className="inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !hasChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit3 size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        }
      />

      <PageLayout>
        <div className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Profile Picture Section */}
          <SectionLayout title="Profile Picture" subtitle="Your profile photo">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Camera size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentUser?.name || 'User Name'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentUser?.email || 'user@example.com'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Member since {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </SectionLayout>

          {/* Personal Information */}
          <SectionLayout title="Personal Information" subtitle="Your basic account details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Full Name"
                required
                icon={<User size={18} />}
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </FormField>

              <FormField
                label="Email Address"
                required
                icon={<Mail size={18} />}
              >
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </FormField>

              <FormField
                label="Phone Number"
                icon={<Phone size={18} />}
              >
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Enter your phone number"
                />
              </FormField>

              <FormField
                label="Country"
                icon={<MapPin size={18} />}
              >
                <SelectInput
                  value={formData.country}
                  onChange={(value: string) => handleInputChange('country', value)}
                  options={countryOptions}
                  disabled={!isEditing}
                />
              </FormField>
            </div>
          </SectionLayout>

          {/* Company Information */}
          <SectionLayout title="Company Information" subtitle="Your business details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Company Name"
                required
                icon={<Building size={18} />}
              >
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Enter your company name"
                />
              </FormField>

              <FormField
                label="Industry"
                required
                icon={<Shield size={18} />}
              >
                <SelectInput
                  value={formData.industry}
                  onChange={(value: string) => handleInputChange('industry', value)}
                  options={industryOptions}
                  disabled={!isEditing}
                />
              </FormField>

              <FormField
                label="Address"
                icon={<MapPin size={18} />}
                className="md:col-span-2"
              >
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed resize-none"
                  placeholder="Enter your business address"
                />
              </FormField>
            </div>
          </SectionLayout>

          {/* Bio Section */}
          <SectionLayout title="About You" subtitle="Tell others about yourself">
            <FormField
              label="Bio"
              icon={<User size={18} />}
            >
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed resize-none"
                placeholder="Tell us about yourself, your experience, and what you're looking for..."
              />
            </FormField>
          </SectionLayout>

          {/* Account Status */}
          <SectionLayout title="Account Status" subtitle="Your account information and verification status">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Email Verified</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your email is verified</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Account Type</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{currentUser?.role || 'User'}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Member Since</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">January 2024</p>
                </div>
              </div>
            </div>
          </SectionLayout>
        </div>
      </PageLayout>
    </AppLayout>
  );
};

export default Profile;
