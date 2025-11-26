import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Fix for ES Modules (__dirname not available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
    throw new Error('SECRET_KEY is not defined in .env file');
}

const rootDir = __dirname;

// INPUT file to encrypt
const envPath = path.join(rootDir, `serviceAccountKey.json`);

// OUTPUT encrypted file
const outPath = path.join(rootDir, `serviceAccountKey.enc.json`);

// Read file
const envData = fs.readFileSync(envPath, 'utf-8');

// Encrypt with AES
const encrypted = CryptoJS.AES.encrypt(envData, secretKey).toString();

// Save encrypted output
fs.writeFileSync(outPath, JSON.stringify({ data: encrypted }, null, 2));

console.log(`✅ Encrypted serviceAccountKey.json → serviceAccountKey.enc.json`);
