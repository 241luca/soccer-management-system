import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateOrganizationUpdate = [
  // Contact fields
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{4,10}$/)
    .withMessage('Invalid phone number'),
  
  body('website')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Invalid website URL'),
  
  // Color validation
  body('primaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be valid hex format (#RRGGBB)'),
  
  body('secondaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Secondary color must be valid hex format (#RRGGBB)'),
  
  // Italian specific validations
  body('fiscalCode')
    .optional()
    .matches(/^[A-Z0-9]{16}$/)
    .withMessage('Invalid Italian fiscal code'),
  
  body('vatNumber')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('VAT number must be 11 digits'),
  
  body('iban')
    .optional()
    .matches(/^IT\d{2}[A-Z]\d{22}$/)
    .withMessage('Invalid Italian IBAN format'),
  
  // Social media URLs
  body('socialFacebook')
    .optional()
    .isURL()
    .withMessage('Invalid Facebook URL'),
  
  body('socialInstagram')
    .optional()
    .isURL()
    .withMessage('Invalid Instagram URL'),
  
  body('socialTwitter')
    .optional()
    .isURL()
    .withMessage('Invalid Twitter URL'),
  
  body('socialYoutube')
    .optional()
    .isURL()
    .withMessage('Invalid YouTube URL'),
  
  // Other validations
  body('foundedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid foundation year'),
  
  body('postalCode')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),
  
  body('province')
    .optional()
    .isLength({ min: 2, max: 2 })
    .isAlpha()
    .toUpperCase()
    .withMessage('Province must be 2 letters'),

  // President and secretary fields
  body('presidentEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid president email format'),
  
  body('presidentPhone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{4,10}$/)
    .withMessage('Invalid president phone number'),
  
  body('secretaryEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid secretary email format'),
  
  body('secretaryPhone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{4,10}$/)
    .withMessage('Invalid secretary phone number'),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      errors: errors.mapped()
    });
  }
  next();
};
