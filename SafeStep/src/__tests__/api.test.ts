import BASE_URL from '../services/api';

describe('api - BASE_URL', () => {
  it('exporta uma string', () => {
    expect(typeof BASE_URL).toBe('string');
  });

  it('começa com http', () => {
    expect(BASE_URL).toMatch(/^https?:\/\//);
  });

  it('contém a porta 3000', () => {
    expect(BASE_URL).toContain(':3000');
  });

  it('não termina com barra', () => {
    expect(BASE_URL.endsWith('/')).toBe(false);
  });
});
