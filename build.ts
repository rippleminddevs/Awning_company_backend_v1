import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.SECRET_KEY;
const appMode = process.env.NODE_ENV || 'production';
if (!secretKey) {
    throw new Error('SECRET_KEY is not defined in .env file');
}
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

// ENV ENCRYPTION
const envPath = path.join(rootDir, 'src/environments', `${appMode}.json`);

const envOutDir = path.join(distDir, "environments");
fs.mkdirSync(envOutDir, { recursive: true });

const outPath = path.join(envOutDir, `${appMode}.enc.json`);

// 🔐 Encrypt
const envData = fs.readFileSync(envPath, 'utf-8');
const encrypted = CryptoJS.AES.encrypt(envData, secretKey).toString();

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ data: encrypted }, null, 2));

console.log(`✅ Encrypted environments/${appMode}.json -> dist/${appMode}.enc.json`);
// ENV ENCRYPTION

// Copy dependencies and scripts to dist/package.json
const mainPkgPath = path.join(rootDir, 'package.json');
const distPkgPath = path.join(distDir, 'package.json');

const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf-8'));

const newPkg = {
    name: mainPkg.name,
    version: mainPkg.version,
    main: 'main.js', // or wherever your entry point will be
    scripts: {
        start: 'node main.js'
    },
    dependencies: mainPkg.dependencies
};

fs.writeFileSync(distPkgPath, JSON.stringify(newPkg, null, 2));

console.log('✅ dist/package.json created.');

const mainServiceAccountJsonPath = path.join(rootDir, 'serviceAccountKey.json');
const distServiceAccountJsonPath = path.join(distDir, 'serviceAccountKey.json');
const mainServiceAccountJson = JSON.parse(fs.readFileSync(mainServiceAccountJsonPath, 'utf-8'));
fs.writeFileSync(distServiceAccountJsonPath, JSON.stringify(mainServiceAccountJson, null, 2));

console.log('✅ dist/serviceAccountKey.json created.');

// COPY EJS VIEWS
const viewsSrc = path.join(rootDir, 'src/views');
const viewsDist = path.join(distDir, 'views');

function copyEjsFiles(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true });

    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        const stat = fs.statSync(srcFile);

        if (stat.isDirectory()) {
            copyEjsFiles(srcFile, destFile);
        } else if (file.endsWith('.ejs')) {
            fs.copyFileSync(srcFile, destFile);
            console.log(`✅ Copied: ${srcFile} -> ${destFile}`);
        }
    }
}

copyEjsFiles(viewsSrc, viewsDist);
console.log('✅ All EJS templates copied to dist/views');