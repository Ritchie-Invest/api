import { Email } from '../Email';
import { WrongEmailFormatError } from '../../error/WrongEmailFormatError';

describe('Email value object', () => {
  it('should instanciate an Email', () => {
    // Given
    const email = 'valid@example.com';

    // When
    const emailValueObject = new Email(email);

    // Then
    expect(emailValueObject.value()).toBe(email);
  });

  it('should throw WrongEmailFormatError if Email is instanciated with empty email string', () => {
    // Given
    const email = '';

    // When / Then
    expect(() => new Email(email)).toThrow(WrongEmailFormatError);
  });

  it('should throw WrongEmailFormatError if Email is instanciated with invalid email string', () => {
    // Given
    const email = 'invalid';

    // When / Then
    expect(() => new Email(email)).toThrow(WrongEmailFormatError);
  });

  it('should throw WrongEmailFormatError if Email is instanciated without domain', () => {
    // Given
    const email = 'john.doe';

    // When / Then
    expect(() => new Email(email)).toThrow(WrongEmailFormatError);
  });

  it('should normalize email by trimming spaces and converting to lowercase', () => {
    // Given
    const email = 'Valid@example.com';

    // When
    const normalizedEmail = new Email(email).normalize();

    // Then
    expect(normalizedEmail).toBe('valid@example.com');
  });

  it('should not modify email case if value is called', () => {
    // Given
    const email = 'Valid@example.com';

    // When
    const returnedEmail = new Email(email).value();

    // Then
    expect(returnedEmail).toBe('Valid@example.com');
  });
});
