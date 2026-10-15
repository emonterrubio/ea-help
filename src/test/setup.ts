import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// The DOM test environment does not implement scrolling.
window.scrollTo = (() => {}) as typeof window.scrollTo;
