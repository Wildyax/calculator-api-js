module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 80,
      lines: 90,
      statements: 90,
    },
  },
};
