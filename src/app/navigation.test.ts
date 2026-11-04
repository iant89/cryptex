import { ALL_NAV_ITEMS, NAV_GROUPS, findNavItem } from './navigation';

describe('navigation (SPEC §4)', () => {
  it('has the 8 groups in spec order', () => {
    expect(NAV_GROUPS.map((g) => g.label)).toEqual([
      'Overview', 'Exchange', 'Wallets', 'Blockchain', 'Development', 'Operations', 'Analytics', 'Simulation',
    ]);
  });

  it('has 39 entries with unique ids and paths', () => {
    expect(ALL_NAV_ITEMS).toHaveLength(39);
    expect(new Set(ALL_NAV_ITEMS.map((i) => i.id)).size).toBe(39);
    expect(new Set(ALL_NAV_ITEMS.map((i) => i.path)).size).toBe(39);
  });

  it('finds items by path, ignoring a trailing slash', () => {
    expect(findNavItem('/wallets/hot')?.item.label).toBe('Hot Wallets');
    expect(findNavItem('/wallets/hot/')?.group.label).toBe('Wallets');
    expect(findNavItem('/nope')).toBeUndefined();
  });
});
