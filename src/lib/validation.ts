// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  trimWhitespace?: boolean;
  removeSpecialChars?: boolean;
}

// Input sanitization
export const sanitizeInput = (
  input: string, 
  options: SanitizationOptions = {}
): string => {
  const {
    maxLength = 1000,
    allowHtml = false,
    trimWhitespace = true,
    removeSpecialChars = false
  } = options;

  let sanitized = input;

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Remove HTML tags if not allowed
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove special characters if specified
  if (removeSpecialChars) {
    sanitized = sanitized.replace(/[<>\"'%;()&+]/g, '');
  }

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  if (email.length > 254) {
    errors.push('Email address is too long');
  }

  return { isValid: errors.length === 0, errors };
};

// Password validation
export const validatePassword = (password: string, minLength: number = 8): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { isValid: errors.length === 0, errors };
};

// Phone number validation (East African format)
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid East African phone number
  const eastAfricanRegex = /^(254|256|250|255|257|258|260|263|264|265|266|267|268|269|290|291|292|293|294|295|296|297|298|299)[0-9]{8,9}$/;
  
  if (!eastAfricanRegex.test(cleanPhone)) {
    errors.push('Please enter a valid East African phone number');
  }

  return { isValid: errors.length === 0, errors };
};

// Company name validation
export const validateCompanyName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Company name is required');
    return { isValid: false, errors };
  }

  if (name.length < 2) {
    errors.push('Company name must be at least 2 characters long');
  }

  if (name.length > 100) {
    errors.push('Company name must be less than 100 characters');
  }

  // Check for valid characters (letters, numbers, spaces, hyphens, periods)
  const validNameRegex = /^[a-zA-Z0-9\s\-\.]+$/;
  if (!validNameRegex.test(name)) {
    errors.push('Company name contains invalid characters');
  }

  return { isValid: errors.length === 0, errors };
};

// Price validation
export const validatePrice = (price: string | number): ValidationResult => {
  const errors: string[] = [];
  
  if (price === '' || price === null || price === undefined) {
    errors.push('Price is required');
    return { isValid: false, errors };
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    errors.push('Price must be a valid number');
    return { isValid: false, errors };
  }

  if (numPrice < 0) {
    errors.push('Price cannot be negative');
  }

  if (numPrice > 1000000000) { // 1 billion
    errors.push('Price is too high');
  }

  return { isValid: errors.length === 0, errors };
};

// Material name validation
export const validateMaterialName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Material name is required');
    return { isValid: false, errors };
  }

  if (name.length < 2) {
    errors.push('Material name must be at least 2 characters long');
  }

  if (name.length > 50) {
    errors.push('Material name must be less than 50 characters');
  }

  // Check for valid characters (letters, numbers, spaces, hyphens)
  const validNameRegex = /^[a-zA-Z0-9\s\-]+$/;
  if (!validNameRegex.test(name)) {
    errors.push('Material name contains invalid characters');
  }

  return { isValid: errors.length === 0, errors };
};

// Location validation
export const validateLocation = (location: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!location) {
    errors.push('Location is required');
    return { isValid: false, errors };
  }

  if (location.length < 2) {
    errors.push('Location must be at least 2 characters long');
  }

  if (location.length > 100) {
    errors.push('Location must be less than 100 characters');
  }

  return { isValid: errors.length === 0, errors };
};

// Generic text validation
export const validateText = (
  text: string, 
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
  } = {}
): ValidationResult => {
  const { required = true, minLength = 1, maxLength = 1000, allowEmpty = false } = options;
  const errors: string[] = [];
  
  if (required && !text) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  if (text && text.length < minLength) {
    errors.push(`Must be at least ${minLength} characters long`);
  }

  if (text && text.length > maxLength) {
    errors.push(`Must be less than ${maxLength} characters`);
  }

  if (!allowEmpty && text === '') {
    errors.push('This field cannot be empty');
  }

  return { isValid: errors.length === 0, errors };
};

// XSS prevention
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// SQL injection prevention (basic)
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/;/g, '') // Remove semicolons
    .trim();
};

