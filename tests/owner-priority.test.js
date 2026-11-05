import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCheckoutPath, ownerLabels, ownerLabelsFor, ownerCounts } from '../src/scripts/shared/owner-priority.js';

test('checkout paths are cart, bag, basket, checkout, payment and billing', () => {
  assert.equal(isCheckoutPath('https://shop.example/checkout'), true);
  assert.equal(isCheckoutPath('https://shop.example/cart/'), true);
  assert.equal(isCheckoutPath('https://shop.example/products/hat'), false);
  assert.equal(isCheckoutPath('https://shop.example/blog/checkout-tips'), false);
  assert.equal(isCheckoutPath('https://shop.example/pages/cart-policy'), false);
});

test('alt text, unlabeled fields and unnamed buttons are lawsuit-common', () => {
  assert.deepEqual(ownerLabels({ id: 'image-alt', title: 'Images must have alternate text', impact: 'critical', wcag: [{ sc: '1.1.1' }] }, 'https://shop.example/'), ['lawsuit-common']);
  assert.deepEqual(ownerLabels({ id: 'label', title: 'Form fields have no label', impact: 'critical', wcag: [{ sc: '3.3.2' }] }, 'https://shop.example/contact'), ['lawsuit-common']);
  assert.deepEqual(ownerLabels({ id: 'button-name', title: 'Buttons must have discernible text', impact: 'critical', wcag: [{ sc: '4.1.2' }] }, 'https://shop.example/'), ['lawsuit-common']);
  assert.deepEqual(ownerLabels({ id: 'heading-order', title: 'Heading levels should only increase by one', impact: 'moderate', wcag: [{ sc: '1.3.1' }] }, 'https://shop.example/'), ['best-practice']);
});

test('the same barriers on a checkout URL also block checkout', () => {
  assert.deepEqual(
    ownerLabels({ id: 'label', title: 'Form field has no label', impact: 'critical', wcag: [{ sc: '1.3.1', name: 'Info and Relationships' }] }, 'https://shop.example/checkout'),
    ['blocks-checkout', 'lawsuit-common'],
  );
  assert.deepEqual(
    ownerLabels({ id: 'color-contrast', title: 'Elements must meet minimum color contrast', impact: 'serious', wcag: [{ sc: '1.4.3' }] }, 'https://shop.example/cart'),
    ['blocks-checkout'],
  );
});

test('a shared issue is blocks-checkout when any affected page is checkout', () => {
  const issue = { id: 'button-name', title: 'Buttons must have discernible text', impact: 'critical' };
  assert.deepEqual(ownerLabelsFor(issue, ['https://shop.example/', 'https://shop.example/checkout']), ['blocks-checkout', 'lawsuit-common']);
});

test('owner counts sum affected elements and can overlap', () => {
  const counts = ownerCounts(
    [
      { id: 'image-alt', title: 'Images must have alternate text', impact: 'critical', count: 4, wcag: [{ sc: '1.1.1' }] },
      { id: 'heading-order', title: 'Heading order', impact: 'moderate', count: 2, wcag: [{ sc: '1.3.1' }] },
    ],
    'https://shop.example/products/hat',
  );
  assert.deepEqual(counts, { lawsuitCommon: 4, blocksCheckout: 0, bestPractice: 2 });
});
