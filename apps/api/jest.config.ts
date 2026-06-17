import type { Config } from "jest";

const config: Config = {
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/globalTeardown.ts",
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
};

export default config;
