import en from './apps/web/dictionaries/en.json';
import es from './apps/web/dictionaries/es.json';
import zh from './apps/web/dictionaries/zh.json';

function checkKeys(base: any, target: any, path = '') {
  for (const key in base) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!(key in target)) {
      console.log(`Missing key in target: ${currentPath}`);
    } else if (typeof base[key] === 'object' && base[key] !== null) {
      checkKeys(base[key], target[key], currentPath);
    }
  }
}

console.log('--- Checking ES ---');
checkKeys(en, es);
console.log('--- Checking ZH ---');
checkKeys(en, zh);
