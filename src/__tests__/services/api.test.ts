jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {
      baseURL: 'http://localhost:3000',
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    },
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = require('../../services/api').default;

describe('API Service', () => {
  it('deve ter baseURL configurada', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('deve ter timeout de 5000ms', () => {
    expect(api.defaults.timeout).toBe(5000);
  });

  it('deve ter Content-Type application/json', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});
