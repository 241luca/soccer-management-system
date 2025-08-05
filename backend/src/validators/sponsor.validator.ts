import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSponsorCreate = [
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Sponsor name is required'),
  
  body('sponsorType')
    .isIn(['main', 'technical', 'gold', 'silver', 'bronze', 'partner'])
    .withMessage('Invalid sponsor type'),
  
  body('annualAmount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Annual amount must be a valid decimal number'),
  
  body('contractStartDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Contract start date must be a valid date'),
  
  body('contractEndDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Contract end date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.contractStartDate) {
        const start = new Date(req.body.contractStartDate);
        const end = new Date(value);
        if (end <= start) {
          throw new Error('Contract end date must be after start date');
        }
      }
      return true;
    }),
  
  body('visibility')
    .optional()
    .isArray()
    .withMessage('Visibility must be an array'),
  
  body('visibility.*')
    .optional()
    .isIn(['jersey', 'website', 'stadium', 'materials', 'events'])
    .withMessage('Invalid visibility option'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid contact email'),
  
  body('contactPhone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{4,10}$/)
    .withMessage('Invalid contact phone number')
];

export const validateSponsorUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Sponsor name cannot be empty'),
  
  body('sponsorType')
    .optional()
    .isIn(['main', 'technical', 'gold', 'silver', 'bronze', 'partner'])
    .withMessage('Invalid sponsor type'),
  
  body('annualAmount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Annual amount must be a valid decimal number'),
  
  body('contractStartDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Contract start date must be a valid date'),
  
  body('contractEndDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Contract end date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.body.contractStartDate) {
        const start = new Date(req.body.contractStartDate);
        const end = new Date(value);
        if (end <= start) {
          throw new Error('Contract end date must be after start date');
        }
      }
      return true;
    }),
  
  body('visibility')
    .optional()
    .isArray()
    .withMessage('Visibility must be an array'),
  
  body('visibility.*')
    .optional()
    .isIn(['jersey', 'website', 'stadium', 'materials', 'events'])
    .withMessage('Invalid visibility option'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid contact email'),
  
  body('contactPhone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{4,10}$/)
    .withMessage('Invalid contact phone number'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      errors: errors.mapped()
    });
    return;
  }
  next();
};
