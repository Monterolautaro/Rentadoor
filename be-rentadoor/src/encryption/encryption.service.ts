import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
    getEncryptionKey,
    ENCRYPTION_ALGORITHM,
    KEY_ID,
} from './encryption.constants';
import { generateIV } from './encryption.utils';

@Injectable()
export class EncryptionService {

    encryptBuffer(data: Buffer) {
        const iv = generateIV();
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return {
            cipherText: encrypted,
            iv,
            authTag,
            algorithm: ENCRYPTION_ALGORITHM,
            keyId: KEY_ID,
        };
    }

    decryptBuffer(encrypted: Buffer | string, iv: Buffer, authTag: Buffer) {
        try {
            const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
            decipher.setAuthTag(authTag);

            const encryptedBuffer = typeof encrypted === 'string' ? Buffer.from(encrypted, 'base64') : encrypted;
            const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
            return decrypted;
        } catch (error) {
            console.error('Error decrypting buffer:', error);
            throw new Error(`Failed to decrypt: ${error.message}`);
        }
    }

}