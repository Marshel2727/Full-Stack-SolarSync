import { describe, expect, it } from 'vitest';
import { afterAuthentication } from './auth-navigation';

describe('post-login destinations', () => {
  it('keeps administrators in their workspace', () => {
    expect(afterAuthentication('admin', '/installation-request')).toBe('/admin');
  });
  it('takes new customers to their account home by default', () => {
    expect(afterAuthentication('customer', null)).toBe('/dashboard');
  });
  it('returns customers to the requested survey form including calculator context', () => {
    expect(afterAuthentication('customer', '/installation-request?fromCalc=true&package=demo-plts-01'))
      .toBe('/installation-request?fromCalc=true&package=demo-plts-01');
  });
  it.each(['https://evil.example', '//evil.example', '/admin', '/\\evil.example', 'javascript:alert(1)'])('rejects an unsafe or unrelated destination: %s', next => {
    expect(afterAuthentication('customer', next)).toBe('/dashboard');
  });
});
