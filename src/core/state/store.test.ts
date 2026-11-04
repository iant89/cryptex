import { describe, expect, it, vi } from 'vitest';
import { createStore, select } from './store';

describe('createStore', () => {
  it('get/set/subscribe', () => {
    const s = createStore({ n: 0 });
    const l = vi.fn();
    const off = s.subscribe(l);
    s.setState({ n: 1 });
    s.setState((p) => ({ n: p.n + 1 }));
    expect(s.getState()).toEqual({ n: 2 });
    expect(l).toHaveBeenCalledTimes(2);
    const same = s.getState();
    s.setState(same);
    expect(l).toHaveBeenCalledTimes(2);
    off();
    s.setState({ n: 3 });
    expect(l).toHaveBeenCalledTimes(2);
  });
  it('batch emits one notification (nested too), and none if unchanged', () => {
    const s = createStore(0);
    const l = vi.fn();
    s.subscribe(l);
    s.batch(() => { s.setState(1); s.batch(() => s.setState(2)); s.setState(3); });
    expect(l).toHaveBeenCalledTimes(1);
    s.batch(() => {});
    expect(l).toHaveBeenCalledTimes(1);
    expect(() => s.batch(() => { s.setState(4); throw new Error('x'); })).toThrow();
    expect(l).toHaveBeenCalledTimes(2);
  });
  it('select memoizes by state identity', () => {
    const s = createStore({ a: 1 });
    const fn = vi.fn((x: { a: number }) => x.a * 2);
    const get = select(s, fn);
    expect(get()).toBe(2);
    expect(get()).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);
    s.setState({ a: 2 });
    expect(get()).toBe(4);
  });
});
