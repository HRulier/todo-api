// jest.config.ts
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    "nanoid": "<rootDir>/tests/__mocks__/nanoid.js",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};
