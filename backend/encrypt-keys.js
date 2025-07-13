#!/usr/bin/env node

const EncryptionManager = require('./utils/encryption');
const fs = require('fs');
const path = require('path');

// CLI Script zum Verschlüsseln/Entschlüsseln von API Keys
const encryption = new EncryptionManager();

function showHelp() {
  console.log(`
🔐 Freshly API Key Encryption Tool

Usage:
  node encrypt-keys.js [command] [options]

Commands:
  test              - Test encryption/decryption
  encrypt [key]     - Encrypt a single API key
  decrypt [key]     - Decrypt a single API key
  encrypt-env       - Encrypt all API keys in .env file
  setup             - Interactive setup for encrypted keys

Examples:
  node encrypt-keys.js test
  node encrypt-keys.js encrypt "your-gemini-api-key-here"
  node encrypt-keys.js encrypt-env
  node encrypt-keys.js setup
`);
}

function setupInteractive() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🔐 Interactive API Key Encryption Setup\n');

  rl.question('Enter your Gemini API Key: ', (geminiKey) => {
    if (!geminiKey) {
      console.log('❌ No API key provided');
      rl.close();
      return;
    }

    try {
      const encryptedGemini = encryption.encryptApiKey(geminiKey);
      
      // Create encrypted .env content
      const envContent = `# Freshly App Environment Variables
# Generated on: ${new Date().toISOString()}

# Server Configuration
PORT=3001

# Encrypted API Keys (Hardware-bound encryption)
GEMINI_API_KEY_ENCRYPTED=${encryptedGemini}

# Optional: Additional encryption secret (recommended for production)
# ENCRYPTION_SECRET=your-additional-secret-key

# Google Cloud Credentials (unchanged)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Development
NODE_ENV=development
`;

      fs.writeFileSync(path.join(__dirname, '.env.encrypted'), envContent);
      
      console.log('\n✅ Success!');
      console.log('✓ API key encrypted and saved to .env.encrypted');
      console.log('✓ Original API key securely processed');
      console.log('\n📋 Next steps:');
      console.log('1. Backup your original .env file');
      console.log('2. Replace .env with .env.encrypted (rename it)');
      console.log('3. Update your visionService.js to use encrypted keys');
      console.log('4. Test the application');
      
    } catch (error) {
      console.error('❌ Encryption failed:', error.message);
    }
    
    rl.close();
  });
}

// Parse command line arguments
const command = process.argv[2];
const value = process.argv[3];

switch (command) {
  case 'test':
    console.log('🧪 Running encryption test...');
    encryption.testEncryption();
    break;
    
  case 'encrypt':
    if (!value) {
      console.error('❌ Please provide a key to encrypt');
      console.log('Usage: node encrypt-keys.js encrypt "your-api-key"');
      break;
    }
    try {
      const encrypted = encryption.encryptApiKey(value);
      console.log('✅ Encrypted API Key:');
      console.log(encrypted);
    } catch (error) {
      console.error('❌ Encryption failed:', error.message);
    }
    break;
    
  case 'decrypt':
    if (!value) {
      console.error('❌ Please provide a key to decrypt');
      console.log('Usage: node encrypt-keys.js decrypt "encrypted-key"');
      break;
    }
    try {
      const decrypted = encryption.decryptApiKey(value);
      console.log('✅ Decrypted API Key:');
      console.log(decrypted);
    } catch (error) {
      console.error('❌ Decryption failed:', error.message);
    }
    break;
    
  case 'encrypt-env':
    console.log('🔐 Encrypting .env file...');
    encryption.encryptEnvFile();
    break;
    
  case 'setup':
    setupInteractive();
    break;
    
  default:
    showHelp();
}
