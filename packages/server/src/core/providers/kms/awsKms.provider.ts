import {
  KMSClient,
  GenerateDataKeyCommand,
  DecryptCommand,
} from '@aws-sdk/client-kms';
import type { GenerateDataKeyResult, IKmsProvider } from '../types.js';

interface AwsKmsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  keyId: string;
}

const DATA_KEY_SPEC = 'AES_256';

export class AwsKmsProvider implements IKmsProvider {
  private readonly client: KMSClient;
  private readonly keyId: string;

  constructor(config: AwsKmsConfig) {
    this.keyId = config.keyId;
    this.client = new KMSClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async generateDataKey(): Promise<GenerateDataKeyResult> {
    const result = await this.client.send(
      new GenerateDataKeyCommand({
        KeyId: this.keyId,
        KeySpec: DATA_KEY_SPEC,
      })
    );

    if (!result.Plaintext || !result.CiphertextBlob) {
      throw new Error('AWS KMS: GenerateDataKey did not return key material.');
    }

    return {
      plaintextKey: Buffer.from(result.Plaintext),
      encryptedDataKey: Buffer.from(result.CiphertextBlob).toString('base64'),
    };
  }

  async decryptDataKey(encryptedDataKey: string): Promise<Buffer> {
    const result = await this.client.send(
      new DecryptCommand({
        KeyId: this.keyId,
        CiphertextBlob: Buffer.from(encryptedDataKey, 'base64'),
      })
    );

    if (!result.Plaintext) {
      throw new Error('AWS KMS: Decrypt did not return key material.');
    }

    return Buffer.from(result.Plaintext);
  }
}
