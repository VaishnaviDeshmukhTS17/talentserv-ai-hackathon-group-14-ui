module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: {
          ignoreCodes: [1343], // Ignore TypeScript error about import.meta
        },
        astTransformers: {
          before: [
            {
              path: 'ts-jest-mock-import-meta',
              options: {
                metaObjectReplacement: {
                  env: {
                    VITE_FIREBASE_API_KEY: "mock_firebase_key",
                    VITE_FIREBASE_AUTH_DOMAIN: "propintel-real-estate.firebaseapp.com",
                    VITE_FIREBASE_PROJECT_ID: "propintel-real-estate",
                    VITE_FIREBASE_STORAGE_BUCKET: "propintel-real-estate.firebasestorage.app",
                    VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
                    VITE_FIREBASE_APP_ID: "mock_app_id",
                    VITE_API_BASE_URL: ""
                  }
                }
              }
            }
          ]
        }
      }
    ]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/jest.styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/jest.fileMock.js'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
