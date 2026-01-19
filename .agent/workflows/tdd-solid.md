---
description: Test-Driven Development (TDD) and SOLID Principles Workflow
---

# TDD and SOLID Principles Workflow

Following these steps ensures that code is testable, maintainable, and robust.

## 1. Test-Driven Development (TDD) Cycle

### Red: Write a Failing Test
- Before writing implementation code, write a test for the desired functionality.
- Run the test and ensure it fails.
- Example: `bun test src/utils/myLogic.test.ts`

### Green: Write the Minimum Code to Pass
- Write just enough code to make the test pass.
- Don't worry about perfect design yet; focus on correctness.

### Refactor: Improve the Code
- Clean up the code while keeping the tests passing.
- Apply SOLID principles during this phase.

---

## 2. SOLID Principles Checklist

### Single Responsibility Principle (SRP)
- A class/component/function should have only one reason to change.
- **Action**: Extract large components into smaller, focused ones.

### Open/Closed Principle (OCP)
- Software entities should be open for extension but closed for modification.
- **Action**: Use props, children, or strategy patterns to allow behavior changes without editing the source code.

### Liskov Substitution Principle (LSP)
- Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
- **Action**: Ensure interfaces are consistent and types are strictly adhered to.

### Interface Segregation Principle (ISP)
- No client should be forced to depend on methods it does not use.
- **Action**: Keep props and interfaces small and specific. Avoid "fat" context or prop objects.

### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions.
- **Action**: Inject dependencies (like API services or logic functions) rather than hardcoding imports where possible.

---

## 3. Running Tests
- Run all tests: `bun test`
- Run UI dashboard: `bun run test:ui` (requires node/npm for some vitest-ui features, but `bun test` is preferred for speed).
