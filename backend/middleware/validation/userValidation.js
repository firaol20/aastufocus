import Joi from 'joi';

// User registration validation schema
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  department: Joi.string()
    .max(100)
    .optional(),
  yearOfStudy: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Year of study must be a number',
      'number.integer': 'Year of study must be a whole number',
      'number.min': 'Year of study must be at least 1',
      'number.max': 'Year of study cannot exceed 5'
    }),
  phone: Joi.string()
    .pattern(/^[\+]?[\d]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number'
    })
});

// User login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// User update validation schema
export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional(),
  department: Joi.string()
    .max(100)
    .optional(),
  yearOfStudy: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
  phone: Joi.string()
    .pattern(/^[\+]?[\d]{10,15}$/)
    .optional()
});

// Admin user update validation schema
export const adminUpdateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional(),
  email: Joi.string()
    .email()
    .optional(),
  role: Joi.string()
    .valid('admin', 'leader', 'member')
    .optional(),
  department: Joi.string()
    .max(100)
    .optional(),
  yearOfStudy: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
  phone: Joi.string()
    .pattern(/^[\+]?[\d]{10,15}$/)
    .optional(),
  isActive: Joi.boolean()
    .optional()
});

// Password change validation schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your new password'
    })
});