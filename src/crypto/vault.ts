import * as forge from 'node-forge';
import * as argon2 from 'argon2';

interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

interface EncryptedVault {
  salt: string;
  iv: string;
  data: string;
  version: number;
  keyDerivationInfo: {
    type: string;
    iterations: number;
    memory: number;
    parallelism: number;
  };
}

class VaultEncryption {
  private readonly ENCRYPTION_ALGORITHM = 'AES-GCM';
  private readonly CURRENT_VERSION = 1;
  
  /**
   * Encrypts the vault data with a master password
   */
  async encryptVault(vault: VaultEntry[], masterPassword: string): Promise<EncryptedVault> {
    try {
      // Generate a random salt for key derivation
      const salt = forge.random.getBytesSync(32);
      const saltHex = forge.util.bytesToHex(salt);
      
      // Use Argon2id for secure key derivation (memory-hard function resistant to side-channels)
      const derivedKey = await argon2.hash(masterPassword, {
        type: argon2.argon2id,
        salt: Buffer.from(salt, 'binary'),
        hashLength: 32, // 256-bit key
        timeCost: 10,  // Number of iterations
        memoryCost: 131072, // 128 MB in KiB (memory usage)
        parallelism: 4 // Parallel threads
      });
      
      // Convert the derived key to raw bytes (remove the argon2 format prefix)
      const keyBuffer = Buffer.from(derivedKey).slice(-32);
      // Convert to a format node-forge can use
      const key = forge.util.createBuffer(keyBuffer.toString('binary'));
      
      // Generate a random initialization vector
      const iv = forge.random.getBytesSync(12); // 96 bits for AES-GCM
      const ivHex = forge.util.bytesToHex(iv);
      
      // Convert vault to JSON and then to bytes
      const plaintext = JSON.stringify(vault);
      
      // Encrypt using AES-GCM for authenticated encryption
      const cipher = forge.cipher.createCipher('AES-GCM', key);
      cipher.start({
        iv: iv,
        tagLength: 128 // 16 bytes authentication tag
      });
      cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
      cipher.finish();
      
      // Get ciphertext and authentication tag
      const encrypted = cipher.output.getBytes();
      const tag = cipher.mode.tag.getBytes();
      
      // Combine the ciphertext and tag
      const encryptedWithTag = encrypted + tag;
      const encryptedHex = forge.util.bytesToHex(encryptedWithTag);
      
      // Return the encrypted vault with metadata
      return {
        salt: saltHex,
        iv: ivHex,
        data: encryptedHex,
        version: this.CURRENT_VERSION,
        keyDerivationInfo: {
          type: 'argon2id',
          iterations: 10, // timeCost
          memory: 131072, // memoryCost (128 MB)
          parallelism: 4
        }
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt vault');
    }
  }
  
  /**
   * Decrypts the vault data with the master password
   */
  async decryptVault(encryptedVault: EncryptedVault, masterPassword: string): Promise<VaultEntry[]> {
    try {
      // Convert stored values back to binary
      const salt = forge.util.hexToBytes(encryptedVault.salt);
      const iv = forge.util.hexToBytes(encryptedVault.iv);
      const encryptedWithTag = forge.util.hexToBytes(encryptedVault.data);
      
      // Split the ciphertext and tag (last 16 bytes are the tag)
      const tagLength = 16; // 128 bits
      const encrypted = encryptedWithTag.slice(0, -tagLength);
      const tag = encryptedWithTag.slice(-tagLength);
      
      // Derive the same key using Argon2id with stored parameters
      const derivedKey = await argon2.hash(masterPassword, {
        type: argon2.argon2id,
        salt: Buffer.from(salt, 'binary'),
        hashLength: 32,
        timeCost: encryptedVault.keyDerivationInfo.iterations,
        memoryCost: encryptedVault.keyDerivationInfo.memory,
        parallelism: encryptedVault.keyDerivationInfo.parallelism
      });
      
      // Extract the key part and convert to format node-forge can use
      const keyBuffer = Buffer.from(derivedKey).slice(-32);
      const key = forge.util.createBuffer(keyBuffer.toString('binary'));
      
      // Decrypt using AES-GCM
      const decipher = forge.cipher.createDecipher('AES-GCM', key);
      decipher.start({
        iv: iv,
        tag: forge.util.createBuffer(tag)
      });
      decipher.update(forge.util.createBuffer(encrypted));
      
      const result = decipher.finish();
      
      // If authentication fails, finish() returns false
      if (!result) {
        throw new Error('Decryption failed: Authentication tag mismatch');
      }
      
      // Parse the decrypted JSON
      const decrypted = decipher.output.toString();
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt vault: Incorrect password or corrupted data');
    }
  }
  
  /**
   * Creates a key from a hardware token for vault encryption
   * This will be extended to support actual hardware keys
   */
  async createHardwareKeyDerivation(hardwareToken: string): Promise<Buffer> {
    // In a real implementation, this would interact with the hardware security module
    // For now, this is a placeholder for the hardware key integration
    const tokenBytes = forge.util.encodeUtf8(hardwareToken);
    const hash = forge.md.sha256.create();
    hash.update(tokenBytes);
    return Buffer.from(hash.digest().getBytes(), 'binary');
  }
}

export { VaultEncryption, VaultEntry, EncryptedVault }; 