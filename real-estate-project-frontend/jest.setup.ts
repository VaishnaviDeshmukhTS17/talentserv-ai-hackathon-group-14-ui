import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import { TextEncoder, TextDecoder } from 'util';

// Define globals needed by React Router / other browser standard APIs in jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;


// Parse and load .env file into process.env dynamically for Jest
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn('Failed to load .env in Jest setup:', e);
}


// Mock ResizeObserver for Recharts / responsiveness components
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver;

// Stub window.matchMedia which is missing in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
