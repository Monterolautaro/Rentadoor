export const getEncryptionKey = () => {
  const key = process.env.AES_SECRET_KEY;
  if (!key) {
    throw new Error('AES_SECRET_KEY environment variable is not defined');
  }
  return Buffer.from(key, 'hex');
};

export const IV_LENGTH = 12;

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

export const KEY_ID = 'key_v1';

