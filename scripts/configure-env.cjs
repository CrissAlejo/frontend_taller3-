const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const contents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const match = contents.match(/^\s*API_URL\s*=\s*(.*?)\s*$/m);
const apiUrl = (process.env.API_URL ?? (match ? match[1].replace(/^(['"])(.*)\1$/, '$2') : 'http://localhost:3000/api')).replace(/\/+$/, '');
const parsed = new URL(apiUrl);
if (!['http:', 'https:'].includes(parsed.protocol)) {
  throw new Error('API_URL debe usar http o https');
}
fs.writeFileSync(
  path.join(root, 'src/environments/api.generated.ts'),
  `// Generado por scripts/configure-env.cjs. Editar .env.\nexport const apiUrl = ${JSON.stringify(apiUrl)};\n`,
);
