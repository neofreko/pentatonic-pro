# Project Instructions for Gemini

You are working on the **Pentatonic Pro** project.
**MANDATORY:** You must strictly adhere to the following Test-Driven Development (TDD) and SOLID principles in all your code modifications and creations.

## 1. Test-Driven Development (TDD) Cycle

### Red: Write a Failing Test
- **Before** writing any implementation code, you **MUST** write a unit test for the desired functionality.
- Verify the test fails.
- Command: `bun test` (or specific test file).

### Green: Write the Minimum Code to Pass
- Write just enough code to make the test pass.
- Focus on correctness first.

### Refactor: Improve the Code
- Clean up the code while keeping the tests passing.
- Apply SOLID principles during this phase.

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

## 3. Project Specifics
- **Runtime/Package Manager**: Bun (`bun install`, `bun test`, `bun run dev`).
- **Framework**: React + Vite + TypeScript.
- **Testing**: Vitest (via `bun test`).

## 4. Behavior
- Always verify your changes by running tests.
- If a test doesn't exist for the code you are modifying, create one first.
