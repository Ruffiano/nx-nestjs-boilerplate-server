import { Injectable } from '@nestjs/common';
import { HttpErrorTypes, HttpResponse } from '@nx-nestjs-boilerplate-server/http-handler';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordStrong', async: false })
@Injectable()
export class IsPasswordStrong implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialCharacter;
  }

  ThrowErrorValidation() {
    throw HttpResponse.getFailureResponse(HttpErrorTypes.PASSWORD_VALIDATION_FAILED, 'Password is too weak. It should contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
  };


  defaultMessage(args: ValidationArguments) {
    this.ThrowErrorValidation();
    return 'Password is too weak. It should contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
  }
}


@ValidatorConstraint({ name: 'isValidEmail', async: false })
@Injectable()
export class IsValidEmail implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  ThrowErrorValidation() {
    throw HttpResponse.getFailureResponse(HttpErrorTypes.EMAIL_VALIDATION_FAILED, 'Email is invalid format.');
  }

  defaultMessage(args: ValidationArguments) {
    this.ThrowErrorValidation();
    return 'Email ($value) is invalid.';
  }
}
