import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { StorageRepository } from './storage.repository';
import { AuthRepository } from '../auth/auth.repository';
import { EncryptionService } from '../encryption/encryption.service';
import { sanitizeFileName } from '../utils/file.utils';

@Injectable()
export class StorageService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageRepository: StorageRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async uploadEncryptedFile(buffer: Buffer, userId: number, fileName: string, bucket: string, _table: string) {
    const encrypted = this.encryptionService.encryptBuffer(buffer);
    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const cleanFileName = sanitizeFileName(fileName);
    const storagePath = `${userId}/${uuidv4()}_${cleanFileName}.enc`;
    await this.storageRepository.uploadToSupabase(storagePath, encrypted.cipherText, bucket);
    const metadata = {
      user_id: userId,
      file_name: cleanFileName,
      storage_path: storagePath,
      iv: encrypted.iv.toString('base64'),
      auth_tag: encrypted.authTag.toString('base64'),
      encryption_algorithm: encrypted.algorithm,
      key_id: encrypted.keyId,
      sha256_hash: sha256,
    };
    // Siempre usar la tabla 'encrypted_files' para metadata
    const fileRecord = await this.storageRepository.insertMetadata(metadata, 'encrypted_files');
    return fileRecord;
  }

  async getEncryptedFiles(userId?: string, table: string = 'encrypted_files') {
    const files = await this.storageRepository.fetchFiles(userId, table);
    const filesByUser: any = {};
    for (const file of files) {
      const uid = file.user_id;
      if (!filesByUser[uid]) {
        const user = await this.authRepository.getUserById(parseInt(uid));
        filesByUser[uid] = {
          userId: uid,
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
      filesByUser[uid].files.push(file);
    }
    return Object.values(filesByUser);
  }

  
  async getVerificationFiles(userId?: string, table: string = 'encrypted_files') {
    const files = await this.storageRepository.fetchFiles(userId, table);
    const onlyVerification = files.filter(f => typeof f.file_name === 'string' && (f.file_name.startsWith('selfie_') || f.file_name.startsWith('dni_')));
    const filesByUser: any = {};
    for (const file of onlyVerification) {
      const uid = file.user_id;
      if (!filesByUser[uid]) {
        const user = await this.authRepository.getUserById(parseInt(uid));
        filesByUser[uid] = {
          userId: uid,
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
      filesByUser[uid].files.push(file);
    }
   
    return Object.values(filesByUser).filter((g: any) => g.files && g.files.length > 0);
  }

  async downloadAndDecryptFile(fileId: string, table: string = 'encrypted_files', bucket: string = 'encrypted') {
    const fileRecord = await this.storageRepository.fetchFileById(fileId, table);
    const encryptedData = await this.storageRepository.downloadFromSupabase(fileRecord.storage_path, bucket);
    try {
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
    const cleanFileName = sanitizeFileName(fileName);
    const storagePath = `${userId}/${Date.now()}_${cleanFileName}`;
    
    await this.storageRepository.uploadPropertyImageToSupabase(storagePath, buffer);
    
    // Retornar la URL pública de la imagen
    const imageUrl = await this.storageRepository.getPublicUrl(storagePath);
    return imageUrl;
  }

  async getPropertyImageUrl(imageName: string): Promise<string> {
    const cleanFileName = sanitizeFileName(imageName);
    const imageUrl = await this.storageRepository.getPublicUrl(cleanFileName);
    return imageUrl;
  }

  async deletePropertyImage(imageName: string, userId: string): Promise<void> {
    const cleanFileName = sanitizeFileName(imageName);
    const storagePath = `${userId}/${cleanFileName}`;
    await this.storageRepository.deleteFromSupabase(storagePath);
  }
}
