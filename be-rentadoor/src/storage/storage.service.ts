import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { StorageRepository } from './storage.repository';
import { AuthRepository } from '../auth/auth.repository';

@Injectable()
export class StorageService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageRepository: StorageRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async uploadEncryptedFile(buffer: Buffer, userId: string, fileName: string) {
    // Encrypt
    const encrypted = this.encryptionService.encryptBuffer(buffer);

    // Hash
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    const storagePath = `${userId}/${uuidv4()}_${fileName}.enc`;

    await this.storageRepository.uploadToSupabase(storagePath, encrypted.cipherText);

    // Convertir buffers a base64 para almacenamiento en DB
    const metadata = {
      user_id: userId,
      file_name: fileName,
      storage_path: storagePath,
      iv: encrypted.iv.toString('base64'),
      auth_tag: encrypted.authTag.toString('base64'),
      encryption_algorithm: encrypted.algorithm,
      key_id: encrypted.keyId,
      sha256_hash: sha256,
    };

    const fileRecord = await this.storageRepository.insertMetadata(metadata);

    return fileRecord;
  }

  async getEncryptedFiles(userId?: string) {
    const files = await this.storageRepository.fetchFiles(userId);
    
    // Agrupar archivos por usuario y obtener información del usuario
    const filesByUser = {};
    
    for (const file of files) {
      const userId = file.user_id;
      if (!filesByUser[userId]) {
        // Obtener información del usuario
        const user = await this.authRepository.getUserById(parseInt(userId));
        filesByUser[userId] = {
          userId,
          user: user ? {
            id: user.id,
            name: user.nombre,
            email: user.email,
            identityVerificationStatus: user.identityVerificationStatus || 'not_verified'
          } : null,
          files: [],
          status: user?.identityVerificationStatus || 'not_verified'
        };
      }
      filesByUser[userId].files.push(file);
    }
    
    return Object.values(filesByUser);
  }

  async downloadAndDecryptFile(fileId: string) {
    const fileRecord = await this.storageRepository.fetchFileById(fileId);

    const encryptedData = await this.storageRepository.downloadFromSupabase(fileRecord.storage_path);

    try {
      // Convertir strings a buffers si es necesario
      const ivBuffer = typeof fileRecord.iv === 'string' ? Buffer.from(fileRecord.iv, 'base64') : fileRecord.iv;
      const authTagBuffer = typeof fileRecord.auth_tag === 'string' ? Buffer.from(fileRecord.auth_tag, 'base64') : fileRecord.auth_tag;

      const decryptedBuffer = this.encryptionService.decryptBuffer(
        encryptedData,
        ivBuffer,
        authTagBuffer,
      );
      return {
        fileName: fileRecord.file_name,
        buffer: decryptedBuffer,
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  async uploadPropertyImage(buffer: Buffer, userId: string, fileName: string): Promise<string> {
    const storagePath = `${userId}/${Date.now()}_${fileName}`;
    
    await this.storageRepository.uploadPropertyImageToSupabase(storagePath, buffer);
    
    // Retornar la URL pública de la imagen
    const imageUrl = await this.storageRepository.getPublicUrl(storagePath);
    return imageUrl;
  }

  async getPropertyImageUrl(imageName: string): Promise<string> {
    const imageUrl = await this.storageRepository.getPublicUrl(imageName);
    return imageUrl;
  }

  async deletePropertyImage(imageName: string, userId: string): Promise<void> {
    const storagePath = `${userId}/${imageName}`;
    await this.storageRepository.deleteFromSupabase(storagePath);
  }
}
