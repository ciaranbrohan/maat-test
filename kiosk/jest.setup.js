const originalError = console.error.bind(console);
console.error = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('not wrapped in act') ||
    msg.includes('not configured to support act')
  ) return;
  originalError(...args);
};
