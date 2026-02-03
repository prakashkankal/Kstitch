# Playwright Testing Guide for Claifit

This guide covers how to run and write tests for the Claifit application using Playwright.

## 📦 Installation

Playwright is already installed! The setup includes:

- `@playwright/test` package
- Configuration file (`playwright.config.js`)
- Test directory (`tests/`)
- Sample tests

## 🚀 Running Tests

### Run all tests (headless mode)

```bash
npm test
```

### Run tests with browser visible

```bash
npm run test:headed
```

### Run tests in interactive UI mode (recommended for debugging)

```bash
npm run test:ui
```

### Run tests in debug mode (step through tests)

```bash
npm run test:debug
```

### View the last test report

```bash
npm run test:report
```

### Run specific test file

```bash
npx playwright test tests/homepage.spec.js
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 📝 Test Structure

Tests are organized in the `tests/` directory:

- **`homepage.spec.js`** - Tests for the homepage functionality
- **`auth.spec.js`** - Tests for authentication (login/registration)
- **`general.spec.js`** - Tests for navigation, responsive design, and performance
- **`example.spec.js`** - Original example tests (can be deleted)

## ✍️ Writing Tests

### Basic Test Structure

```javascript
import { test, expect } from "@playwright/test";

test("test description", async ({ page }) => {
  // Navigate to a page
  await page.goto("/");

  // Interact with elements
  await page.click("button");

  // Make assertions
  await expect(page).toHaveURL("/expected-url");
});
```

### Common Actions

```javascript
// Navigation
await page.goto("/path");

// Click elements
await page.click("button");
await page.getByRole("button", { name: "Login" }).click();

// Fill inputs
await page.fill('input[name="email"]', "test@example.com");
await page.getByLabel("Password").fill("password123");

// Check visibility
await expect(page.locator(".navbar")).toBeVisible();

// Check text content
await expect(page.locator("h1")).toHaveText("Welcome");

// Check URL
await expect(page).toHaveURL(/.*login/);

// Wait for elements
await page.waitForSelector(".loading", { state: "hidden" });
```

### Grouping Tests

```javascript
test.describe("Feature Tests", () => {
  test("test 1", async ({ page }) => {
    // test code
  });

  test("test 2", async ({ page }) => {
    // test code
  });
});
```

## 🎯 Best Practices

1. **Use data-testid attributes** - Add `data-testid` to your components for reliable selectors

   ```html
   <button data-testid="login-button">Login</button>
   ```

   ```javascript
   await page.getByTestId("login-button").click();
   ```

2. **Use semantic locators** - Prefer `getByRole`, `getByLabel`, `getByText`

   ```javascript
   await page.getByRole("button", { name: "Login" }).click();
   await page.getByLabel("Email").fill("test@example.com");
   ```

3. **Wait for content** - Use `waitForLoadState` for dynamic content

   ```javascript
   await page.waitForLoadState("networkidle");
   ```

4. **Take screenshots** - Useful for debugging

   ```javascript
   await page.screenshot({ path: "screenshot.png" });
   ```

5. **Use before/after hooks** - Setup and cleanup

   ```javascript
   test.beforeEach(async ({ page }) => {
     await page.goto("/");
   });

   test.afterEach(async ({ page }) => {
     await page.close();
   });
   ```

## 🔧 Configuration

The `playwright.config.js` file includes:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Automatically starts `npm run dev` before tests
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on retry

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

The report includes:

- Test results
- Screenshots of failures
- Videos of test runs
- Execution traces

## 🐛 Debugging

### Using UI Mode (Recommended)

```bash
npm run test:ui
```

This opens an interactive UI where you can:

- See all tests
- Run specific tests
- Watch tests in real-time
- Time-travel through test execution
- Inspect the DOM at each step

### Using Debug Mode

```bash
npm run test:debug
```

This opens the Playwright Inspector where you can:

- Step through tests line by line
- Pause and resume execution
- View network requests
- Inspect elements

### Using console.log

```javascript
test("my test", async ({ page }) => {
  console.log("Current URL:", page.url());
  const text = await page.locator("h1").textContent();
  console.log("Heading text:", text);
});
```

## 📱 Testing Responsive Design

```javascript
test("mobile view", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  // test mobile-specific behavior
});
```

## 🔐 Testing Authenticated Routes

```javascript
test.describe("Protected Routes", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("can access dashboard", async ({ page }) => {
    await expect(page).toHaveURL("/dashboard");
  });
});
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions Guide](https://playwright.dev/docs/test-assertions)

## 🎓 Next Steps

1. Run the existing tests: `npm test`
2. Update tests to match your actual component structure
3. Add `data-testid` attributes to your key components
4. Write tests for critical user flows:
   - User registration
   - User login
   - Tailor registration
   - Creating orders
   - Profile updates
5. Set up CI/CD to run tests automatically

---

Happy Testing! 🎉
