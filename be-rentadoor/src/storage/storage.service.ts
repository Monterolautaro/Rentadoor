import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { StorageRepository } from './storage.repository';

@Injectable()
export class StorageService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageRepository: StorageRepository,
  ) {}

  async uploadEncryptedFile(buffer: Buffer, userId: string, fileName: string) {
    // Encrypt
    const encrypted = this.encryptionService.encryptBuffer(buffer);

    // Hash
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    const storagePath = `${userId}/${uuidv4()}_${fileName}.enc`;

    await this.storageRepository.uploadToSupabase(storagePath, encrypted.cipherText);

    const fileRecord = await this.storageRepository.insertMetadata({
      user_id: userId,
      file_name: fileName,
      storage_path: storagePath,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
      encryption_algorithm: encrypted.algorithm,
      key_id: encrypted.keyId,
      sha256_hash: sha256,
    });


    return fileRecord;
  }

  async getEncryptedFiles(userId?: string) {
    return await this.storageRepository.fetchFiles(userId);
  }

  async downloadAndDecryptFile(fileId: string) {

    const fileRecord = await this.storageRepository.fetchFileById(fileId);

    const encryptedData = await this.storageRepository.downloadFromSupabase(fileRecord.storage_path);

    const decryptedBuffer = this.encryptionService.decryptBuffer(
      encryptedData,
      fileRecord.iv,
      fileRecord.auth_tag,
    );

    return {
      fileName: fileRecord.file_name,
      buffer: decryptedBuffer,
    };
  }
}
