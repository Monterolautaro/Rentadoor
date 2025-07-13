import { EncryptionService } from '../encryption.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Buffer } from 'buffer';

describe('CryptoService AES-256-GCM Tests', () => {
  let cryptoService: EncryptionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    cryptoService = module.get<EncryptionService>(EncryptionService);
  });

  it('should encrypt and decrypt buffer correctly', () => {
    const testString = '¡Esto es un texto de prueba confidencial!';
    const testBuffer = Buffer.from(testString, 'utf-8');

    const encrypted = cryptoService.encryptBuffer(testBuffer);

    expect(encrypted.cipherText).toBeInstanceOf(Buffer);
    expect(encrypted.iv).toBeInstanceOf(Buffer);
    expect(encrypted.authTag).toBeInstanceOf(Buffer);
    expect(encrypted.algorithm).toBe('aes-256-gcm');
    expect(encrypted.keyId).toBeDefined();

    const decrypted = cryptoService.decryptBuffer(
      encrypted.cipherText,
      encrypted.iv,
      encrypted.authTag,
    );

    expect(decrypted.toString('utf-8')).toBe(testString);
  });

  it('should throw error on tampered cipherText', () => {
    const testBuffer = Buffer.from('Texto de prueba', 'utf-8');
    const encrypted = cryptoService.encryptBuffer(testBuffer);

    const tamperedCipherText = Buffer.from(encrypted.cipherText);
    tamperedCipherText[0] ^= 0xff; 

    expect(() => {
      cryptoService.decryptBuffer(
        tamperedCipherText,
        encrypted.iv,
        encrypted.authTag,
      );
    }).toThrow();
  });
});
