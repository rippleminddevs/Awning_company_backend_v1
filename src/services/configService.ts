import { readFileSync } from 'fs';
import path from 'path';
import { EnvConfig } from '../common/interfaces/appconfig';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'production';

const loadEnvConfig = (env: string): EnvConfig => {
  if (env !== 'development') {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error('SECRET_KEY is not defined in .env file');
    }

    const encryptedEnvPath = path.join(__dirname, `../environments/${env}.enc.json`);
    const encryptedData = JSON.parse(readFileSync(encryptedEnvPath, 'utf-8')).data;
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
    const envConfig: EnvConfig = JSON.parse(decryptedData);
    return envConfig;
  }

  const envPath = path.join(__dirname, `../environments/${env}.json`);
  return JSON.parse(readFileSync(envPath, 'utf-8'));
}

export const config: EnvConfig = loadEnvConfig(env);
