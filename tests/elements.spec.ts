import { test, expect } from '@playwright/test';

/**
 * Add/Remove Elements Test Suite
 * 
 * Tests the functionality of dynamically adding and removing elements on the page.
 * Page: https://the-internet.herokuapp.com/add_remove_elements/
 */

test.describe('Add/Remove Elements', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('add_remove_elements/');
  });

  test('should display Add Element button on initial load', async ({ page }) => {
    // Verify the page loaded correctly
    await expect(page.locator('h3')).toHaveText('Add/Remove Elements');
    
    // Verify Add Element button exists
    const addButton = page.getByRole('button', { name: 'Add Element' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
  });

  test('should add a single element when clicking Add Element', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    
    // Initially, no delete buttons should exist
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    await expect(deleteButtons).toHaveCount(0);
    
    // Click Add Element
    await addButton.click();
    
    // Verify a delete button appeared
    await expect(deleteButtons).toHaveCount(1);
    await expect(deleteButtons.first()).toBeVisible();
  });

  test('should add multiple elements', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Add 5 elements
    for (let i = 0; i < 5; i++) {
      await addButton.click();
      await expect(deleteButtons).toHaveCount(i + 1);
    }
    
    // Verify all 5 delete buttons are present
    await expect(deleteButtons).toHaveCount(5);
  });

  test('should remove a single element', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Add an element first
    await addButton.click();
    await expect(deleteButtons).toHaveCount(1);
    
    // Remove the element
    await deleteButtons.first().click();
    
    // Verify the element was removed
    await expect(deleteButtons).toHaveCount(0);
  });

  test('should remove all elements', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Add 5 elements
    for (let i = 0; i < 5; i++) {
      await addButton.click();
    }
    await expect(deleteButtons).toHaveCount(5);
    
    // Remove all elements
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
    }
    
    // Verify all elements are removed
    await expect(deleteButtons).toHaveCount(0);
  });

  test('should add and remove elements in sequence', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Add 3 elements
    await addButton.click();
    await addButton.click();
    await addButton.click();
    await expect(deleteButtons).toHaveCount(3);
    
    // Remove one element
    await deleteButtons.first().click();
    await expect(deleteButtons).toHaveCount(2);
    
    // Add one more element
    await addButton.click();
    await expect(deleteButtons).toHaveCount(3);
    
    // Remove all remaining elements
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
    }
    await expect(deleteButtons).toHaveCount(0);
  });

  test('should maintain Add Element button after removing all elements', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Add and remove elements
    await addButton.click();
    await deleteButtons.first().click();
    
    // Verify Add Element button is still present and functional
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
    
    // Verify we can add again after removal
    await addButton.click();
    await expect(deleteButtons).toHaveCount(1);
  });

  test('should remove specific element when multiple exist', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Add 3 elements
    await addButton.click();
    await addButton.click();
    await addButton.click();
    await expect(deleteButtons).toHaveCount(3);
    
    // Remove the middle element (second one)
    await deleteButtons.nth(1).click();
    
    // Verify only 2 elements remain
    await expect(deleteButtons).toHaveCount(2);
  });

  test('should handle rapid add/remove actions', async ({ page }) => {
    const addButton = page.getByRole('button', { name: 'Add Element' });
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    
    // Rapidly add 10 elements
    for (let i = 0; i < 10; i++) {
      await addButton.click();
    }
    await expect(deleteButtons).toHaveCount(10);
    
    // Rapidly remove all elements
    while (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
    }
    
    // Verify all removed
    await expect(deleteButtons).toHaveCount(0);
  });
});

