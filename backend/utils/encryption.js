const CryptoJS = require('crypto-js');
const os = require('os');
const crypto = require('crypto');

class EncryptionManager {
  constructor() {
    // Verwende Hardware-spezifische Eigenschaften als Teil des Schlüssels
    this.hardwareKey = this.generateHardwareKey();
    this.encryptionKey = this.generateEncryptionKey();
  }

  // Generiere Hardware-spezifischen Schlüssel
  generateHardwareKey() {
    const cpus = os.cpus();
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    
    // Kombiniere Hardware-Eigenschaften
    const hardwareString = `${hostname}-${platform}-${arch}-${cpus[0].model}`;
    return crypto.createHash('sha256').update(hardwareString).digest('hex');
  }

  // Generiere Master-Verschlüsselungsschlüssel
  generateEncryptionKey() {
    // Kombiniere Hardware-Key mit Environment-Variable (falls vorhanden)
    const envSecret = process.env.ENCRYPTION_SECRET || 'default-secret-key';
    const masterKey = `${this.hardwareKey}-${envSecret}`;
    return crypto.createHash('sha256').update(masterKey).digest('hex');
  }

  // Verschlüssele API Key
  encryptApiKey(apiKey) {
    try {
      const encrypted = CryptoJS.AES.encrypt(apiKey, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  // Entschlüssele API Key
  decryptApiKey(encryptedKey) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedKey, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt API key - check if running on same machine');
    }
  }

  // Utility: Verschlüssele alle API Keys in .env
  encryptEnvFile(envPath = '.env') {
    const fs = require('fs');
    const path = require('path');
    
    const envFile = path.join(__dirname, '..', envPath);
    
    if (!fs.existsSync(envFile)) {
      console.log('No .env file found to encrypt');
      return;
    }

    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    
    const encryptedLines = lines.map(line => {
      if (line.includes('_API_KEY=') && !line.includes('#')) {
        const [key, value] = line.split('=');
        if (value && value.length > 10) {
          const encrypted = this.encryptApiKey(value);
          console.log(`✓ Encrypted ${key}`);
          return `${key}_ENCRYPTED=${encrypted}`;
        }
      }
      return line;
    });

    // Schreibe verschlüsselte Version
    const encryptedContent = encryptedLines.join('\n');
    fs.writeFileSync(envFile + '.encrypted', encryptedContent);
    console.log(`✓ Encrypted environment file saved as ${envPath}.encrypted`);
  }

  // Utility: Teste Verschlüsselung
  testEncryption() {
    const testKey = 'test-api-key-12345';
    console.log('🔐 Testing encryption...');
    
    try {
      const encrypted = this.encryptApiKey(testKey);
      console.log(`Original: ${testKey}`);
      console.log(`Encrypted: ${encrypted.substring(0, 20)}...`);
      
      const decrypted = this.decryptApiKey(encrypted);
      console.log(`Decrypted: ${decrypted}`);
      
      const success = testKey === decrypted;
      console.log(`✓ Encryption test: ${success ? 'PASSED' : 'FAILED'}`);
      return success;
    } catch (error) {
      console.error('✗ Encryption test FAILED:', error.message);
      return false;
    }
  }
}

module.exports = EncryptionManager;
