import * as crypto from 'crypto';
import { IV_LENGTH } from './encryption.constants';

export function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}
