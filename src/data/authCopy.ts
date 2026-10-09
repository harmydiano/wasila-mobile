import type { AuthError } from './authFlow';

export function authErrorText(e: AuthError): string {
  switch (e.kind) {
    case 'offline':
      return 'No connection. Check your internet and try again.';
    case 'too_soon':
      return `Wait ${e.retryAfter} seconds before asking for another code.`;
    case 'too_many':
      return 'Too many codes for this address. Try again in an hour.';
    case 'invalid_email':
      return 'That email address does not look right.';
    case 'wrong_code':
      return e.attemptsLeft === 1 ? 'That code is not right. One more try.' : `That code is not right. ${e.attemptsLeft} more tries.`;
    case 'expired':
      return 'That code has expired. Send a new one.';
    case 'cancelled':
      return '';
    default:
      return 'Something went wrong. Try again.';
  }
}
