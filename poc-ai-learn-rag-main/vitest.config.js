// Vitest transforms this file independently of the package "type" field.
// Using CJS require() here to stay consistent with the rest of the project.
const { defineConfig } = require('vitest/config')

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.{js,ts}'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,ts}'],
    },
  },
})
