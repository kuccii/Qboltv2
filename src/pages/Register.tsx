import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft,
  Shield,
  Globe,
  Phone,
  Users,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import { SelectInput } from '../design-system';

interface FormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Company Info
  company: string;
  industry: 'construction' | 'agriculture';
  country: string;
  phone: string;
  
  // Step 3: Preferences
  role: string;
  companySize: string;
  interests: string[];
  
  // Step 4: Verification
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    industry: 'construction',
    country: 'Kenya',
    phone: '',
    role: '',
    companySize: '',
    interests: [],
    agreeTerms: false,
    agreeMarketing: false
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, loading: authLoading } = useAuth();
  const { setIndustry } = useIndustry();
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Personal Info', description: 'Your basic information' },
    { id: 2, title: 'Company Details', description: 'About your business' },
    { id: 3, title: 'Preferences', description: 'Customize your experience' },
    { id: 4, title: 'Verification', description: 'Terms and verification' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Calculate password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-orange-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && passwordStrength >= 3);
      case 2:
        return !!(formData.company && formData.industry && formData.country && formData.phone);
      case 3:
        return !!(formData.role && formData.companySize);
      case 4:
        return formData.agreeTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError('');
    } else {
      setError('Please fill in all required fields correctly.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(formData.email, formData.password, {
        name: formData.name,
        company: formData.company,
        industry: formData.industry,
        country: formData.country,
        phone: formData.phone,
        role: formData.role,
        companySize: formData.companySize,
        interests: formData.interests
      });
      
      // Set industry and navigate after successful registration
      setIndustry(formData.industry);
      navigate('/app');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="group">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold min-w-[60px] text-right ${
                      passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-orange-600' :
                      passwordStrength <= 4 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { check: formData.password.length >= 8, text: '8+ characters' },
                      { check: /[a-z]/.test(formData.password), text: 'Lowercase' },
                      { check: /[A-Z]/.test(formData.password), text: 'Uppercase' },
                      { check: /[0-9]/.test(formData.password), text: 'Number' },
                      { check: /[^A-Za-z0-9]/.test(formData.password), text: 'Special' }
                    ].map((req, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                          req.check
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {req.check ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {req.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm ${
                    formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500 focus:border-green-500'
                      : formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-700 focus:border-primary-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Passwords do not match
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Passwords match
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="group">
              <label htmlFor="company" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Industry <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, industry: 'construction' }))}
                  className={`group p-5 border-2 rounded-xl text-left transition-all duration-200 ${
                    formData.industry === 'construction'
                      ? 'border-primary-800 bg-gradient-to-br from-primary-800 to-primary-600 dark:from-primary-/30 dark:to-primary-/30 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <Building2 className={`h-8 w-8 mb-3 transition-colors ${
                    formData.industry === 'construction' ? 'text-primary-800 dark:text-primary-' : 'text-gray-400 group-hover:text-primary-'
                  }`} />
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">Construction</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Building materials, equipment</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, industry: 'agriculture' }))}
                  className={`group p-5 border-2 rounded-xl text-left transition-all duration-200 ${
                    formData.industry === 'agriculture'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <TrendingUp className={`h-8 w-8 mb-3 transition-colors ${
                    formData.industry === 'agriculture' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 group-hover:text-green-500'
                  }`} />
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">Agriculture</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Farming inputs, equipment</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 appearance-none bg-no-repeat bg-right pr-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em 1em' }}
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                  </select>
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="group">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-800 transition-colors z-10 pointer-events-none" />
                <div className="pl-12">
                  <SelectInput
                    options={[
                      { value: '', label: 'Select your role', disabled: true },
                      { value: 'procurement', label: 'Procurement Manager' },
                      { value: 'operations', label: 'Operations Manager' },
                      { value: 'finance', label: 'Finance Manager' },
                      { value: 'ceo', label: 'CEO/Founder' },
                      { value: 'other', label: 'Other' }
                    ]}
                    value={formData.role}
                    onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    placeholder="Select your role"
                    size="lg"
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-800 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Company Size <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '1-10', label: '1-10 employees', icon: Users },
                  { value: '11-50', label: '11-50 employees', icon: Building2 },
                  { value: '51-200', label: '51-200 employees', icon: Building2 },
                  { value: '200+', label: '200+ employees', icon: Building2 }
                ].map((size) => {
                  const IconComponent = size.icon;
                  return (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, companySize: size.value }))}
                      className={`group p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.companySize === size.value
                          ? 'border-primary-800 bg-gradient-to-br from-primary-800 to-primary-600 dark:from-primary-/30 dark:to-primary-/30 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    >
                      <IconComponent className={`h-6 w-6 mb-2 transition-colors ${
                        formData.companySize === size.value ? 'text-primary-800 dark:text-primary-' : 'text-gray-400 group-hover:text-primary-'
                      }`} />
                      <div className="font-semibold text-gray-900 dark:text-white">{size.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Areas of Interest <span className="text-gray-500 text-xs font-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Price Tracking', icon: TrendingUp },
                  { name: 'Supplier Discovery', icon: Users },
                  { name: 'Logistics Planning', icon: Globe },
                  { name: 'Risk Management', icon: Shield },
                  { name: 'Trade Financing', icon: TrendingUp },
                  { name: 'Market Analysis', icon: TrendingUp }
                ].map((interest) => {
                  const IconComponent = interest.icon;
                  return (
                    <button
                      key={interest.name}
                      type="button"
                      onClick={() => handleInterestToggle(interest.name)}
                      className={`group p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.interests.includes(interest.name)
                          ? 'border-primary-800 bg-gradient-to-br from-primary-800 to-primary-600 dark:from-primary-/30 dark:to-primary-/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <IconComponent className={`h-5 w-5 transition-colors ${
                          formData.interests.includes(interest.name) ? 'text-primary-800 dark:text-primary-' : 'text-gray-400 group-hover:text-primary-'
                        }`} />
                        {formData.interests.includes(interest.name) && (
                          <CheckCircle2 className="h-5 w-5 text-primary-800 dark:text-primary-" />
                        )}
                      </div>
                      <div className={`text-sm font-medium ${
                        formData.interests.includes(interest.name)
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {interest.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-primary-800 to-indigo-50 dark:from-primary-/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-primary-800 dark:border-primary-">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-800 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary-800 dark:text-primary-800 mb-2">
                    Almost There! 🎉
                  </h4>
                  <p className="text-primary-800 dark:text-primary-800 leading-relaxed">
                    By creating an account, you'll get access to real-time market data, supplier networks, 
                    and tools to optimize your business operations.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-800 dark:hover:border-primary-800 transition-all duration-200 bg-gray-50 dark:bg-gray-800/50">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleCheckboxChange('agreeTerms', e.target.checked)}
                  className="mt-1 h-5 w-5 text-primary-800 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all"
                />
                <label htmlFor="agreeTerms" className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="font-semibold text-primary-800 hover:text-primary-800 dark:text-primary-800 dark:hover:text-primary-800 underline decoration-2 underline-offset-2 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-semibold text-primary-800 hover:text-primary-800 dark:text-primary-800 dark:hover:text-primary-800 underline decoration-2 underline-offset-2 transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <input
                  type="checkbox"
                  id="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={(e) => handleCheckboxChange('agreeMarketing', e.target.checked)}
                  className="mt-1 h-5 w-5 text-primary-800 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all"
                />
                <label htmlFor="agreeMarketing" className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  I'd like to receive updates about new features and market insights
                  <span className="text-gray-500 text-xs ml-2">(optional)</span>
                </label>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h5 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                What happens next?
              </h5>
              <div className="space-y-3">
                {[
                  { icon: Mail, text: 'Verify your email address', bgClass: 'bg-primary-800 dark:bg-primary-/30', iconClass: 'text-primary-800 dark:text-primary-' },
                  { icon: User, text: 'Complete your industry profile', bgClass: 'bg-purple-50 dark:bg-purple-900/30', iconClass: 'text-purple-600 dark:text-purple-400' },
                  { icon: TrendingUp, text: 'Access your personalized dashboard', bgClass: 'bg-green-50 dark:bg-green-900/30', iconClass: 'text-green-600 dark:text-green-400' }
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${step.bgClass} flex items-center justify-center`}>
                      <step.icon className={`h-5 w-5 ${step.iconClass}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-800 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="text-white" size={32} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-yellow-800" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Join thousands of businesses optimizing their supply chain
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110'
                          : currentStep === step.id
                          ? 'bg-gradient-to-br from-primary-800 to-purple-600 text-white shadow-lg scale-110 ring-4 ring-primary-500 dark:ring-primary-'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>
                      <div className="mt-2 text-center hidden sm:block">
                        <div className={`text-xs font-medium ${
                          currentStep >= step.id
                            ? 'text-primary-800 dark:text-primary-'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-slide-in">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Indicator */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {steps[currentStep - 1].description}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {currentStep} of {steps.length}
              </div>
            </div>

            {/* Form Content */}
            <div className="animate-fade-in">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-800 to-purple-600 rounded-xl hover:from-primary-800 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(4) || isLoading || authLoading}
                  className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                >
                  {(isLoading || authLoading) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-primary-800 hover:text-primary-800 dark:text-primary-800 dark:hover:text-primary-800 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-800 via-purple-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Building2 size={48} className="text-white" />
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Trade Intelligence Platform
          </h2>
          
          <p className="text-primary-800 text-lg leading-relaxed mb-10">
            Empowering East African businesses with real-time market intelligence, 
            supplier insights, and trade financing solutions.
          </p>
          
          <div className="space-y-4">
            {[
              { icon: CheckCircle, text: 'Real-time price tracking', color: 'bg-green-400' },
              { icon: Shield, text: 'Verified supplier network', color: 'bg-primary-' },
              { icon: TrendingUp, text: 'Trade financing solutions', color: 'bg-purple-400' },
              { icon: Globe, text: 'Multi-country coverage', color: 'bg-indigo-400' }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 text-primary-800 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <div className={`${feature.color} rounded-lg p-2`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-primary-800 text-sm">
              Trusted by 10,000+ businesses across East Africa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
