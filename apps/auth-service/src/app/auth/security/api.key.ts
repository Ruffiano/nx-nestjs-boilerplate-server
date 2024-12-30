import crypto from 'crypto';
import { HttpErrorTypes as grpcErrorTypes, HttpResponse as grpcResponse} from '@nx-nestjs-boilerplate-server/http-handler';
import { RpcException } from '@nestjs/microservices';

const encryptionKey = process.env.SECRET_KEY;
const iv = Buffer.from(process.env.SECRET_IV, 'hex');

if (!encryptionKey || !iv) {
  throw new Error('ENCRYPTION_KEY and IV must be set.');
}

interface Permissions {
  READ: boolean;
  WRITE: boolean;
  writeValidUntil?: number;
}

interface ApiKeySecret {
  apiKey: string;
  apiSecret: string;
  userId: string;
  permissions: Permissions;
}

export class APIKEY {
  static generateApiKeySecret(userId: string, poolId: string, writeValidMonths: number, read: boolean, write: boolean): ApiKeySecret {
    if (writeValidMonths < 1 || writeValidMonths > 12) {
      throw new RpcException(grpcErrorTypes.API_KEY_INVALID);
    }

    const apiKey = poolId;
    const currentTime = Math.floor(Date.now() / 1000);
    const writeValidSeconds = writeValidMonths * 30 * 24 * 60 * 60;
    const writeValidUntil = currentTime + writeValidSeconds;

    const permissions: Permissions = {
      READ: read || true,
      WRITE: write || true,
      writeValidUntil
    };

    const secretData = JSON.stringify({ userId, poolId, permissions });
    const apiSecret = this.encrypt(secretData, encryptionKey, iv);

    return {
      apiKey,
      apiSecret,
      userId,
      permissions
    };
  }

  static generateSignature(apiKey: string, apiSecret: string, timestamp: number): string {
    const data = `${apiKey}${timestamp}`;
    return crypto.createHmac('sha256', apiSecret).update(data).digest('hex');
  }

  static verifySignature(apiKey: string, apiSecret: string, timestamp: number, signature: string): Promise<Permissions> {
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - timestamp) > 5) {
      return Promise.resolve({ READ: false, WRITE: false });
    }
    const validSignature = this.generateSignature(apiKey, apiSecret, timestamp);
    return Promise.resolve({ READ: validSignature === signature, WRITE: validSignature === signature });
  }

  static hasWritePermission(apiKey: string, encryptedSecret: string, timestamp: number, signature: string): Promise<Permissions> {
    const currentTime = Math.floor(Date.now() / 1000);
    const decryptedSecret = this.decrypt(encryptedSecret, encryptionKey, iv);
    const { userId, poolId, permissions } = JSON.parse(decryptedSecret);

    if (poolId !== apiKey || !permissions.WRITE || permissions.writeValidUntil < currentTime) {
      return Promise.resolve({ READ: true, WRITE: false });
    }

    return this.verifySignature(apiKey, encryptedSecret, timestamp, signature);
  }

  static encrypt(text: string, key: string, iv: Buffer): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  static decrypt(text: string, key: string, iv: Buffer): string {
    const encryptedText = Buffer.from(text, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
