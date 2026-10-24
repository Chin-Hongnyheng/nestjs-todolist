import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface UserPipeOptions {
  validateComplexity?: boolean;
  checkForbiddenUsername?: boolean;
}

const FORBIDDEN_USERNAMES = [
  'admin',
  'administrator',
  'root',
  'superuser',
  'system',
  'moderator',
  'owner',
  'support',
  'null',
  'undefined',
];

@Injectable()
export class SanitizeUserPipe implements PipeTransform {
  constructor(private readonly options: UserPipeOptions = {}) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const errors: string[] = [];
    const validateComplexity = this.options.validateComplexity ?? true;
    const checkForbidden = this.options.checkForbiddenUsername ?? true;

    // 1. Sanitize & Validate Email
    if (value.email !== undefined) {
      if (typeof value.email !== 'string' || value.email.trim() === '') {
        errors.push('Email cannot be empty');
      } else {
        value.email = value.email.trim().toLowerCase();

        // Must contain '@'
        if (!value.email.includes('@')) {
          errors.push('Email must contain an "@" symbol');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.email)) {
            errors.push(
              'Email must be a valid email address (e.g. user@example.com)',
            );
          }
        }
      }
    }

    // 2. Sanitize & Validate Username / Name
    if (value.name !== undefined) {
      if (typeof value.name !== 'string' || value.name.trim() === '') {
        errors.push('Name cannot be empty');
      } else {
        value.name = value.name.trim();

        if (checkForbidden) {
          const normalizedName = value.name.toLowerCase();
          const isForbidden = FORBIDDEN_USERNAMES.some(
            (forbidden) =>
              normalizedName === forbidden ||
              normalizedName.startsWith(`${forbidden}_`) ||
              normalizedName.startsWith(`${forbidden}-`),
          );

          if (isForbidden) {
            errors.push(
              `The username "${value.name}" is reserved and forbidden. Please choose a different name.`,
            );
          }
        }
      }
    }

    // 3. Validate Password Complexity
    if (value.password !== undefined && validateComplexity) {
      if (typeof value.password !== 'string') {
        errors.push('Password must be a string');
      } else {
        if (value.password.length < 8) {
          errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(value.password)) {
          errors.push(
            'Password must contain at least one uppercase letter (A-Z)',
          );
        }
        if (!/[a-z]/.test(value.password)) {
          errors.push(
            'Password must contain at least one lowercase letter (a-z)',
          );
        }
        if (!/[0-9]/.test(value.password)) {
          errors.push('Password must contain at least one digit/number (0-9)');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value.password)) {
          errors.push(
            'Password must contain at least one special character (!@#$%^&*...)',
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return value;
  }
}
