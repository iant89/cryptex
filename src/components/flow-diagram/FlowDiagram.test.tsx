import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowDiagram } from './FlowDiagram';
import { rowFlashHighlight } from '../row-flash/rowFlash';

it('renders nodes as buttons and edges with pending/live state', async () => {
  const onSelect = vi.fn();
  const { container } = render(
    <FlowDiagram
      aria-label="Flow"
      columns={2}
      lanes={1}
      nodes={[
        { id: 'a', col: 0, lane: 0, label: 'Node A', content: 'A', onSelect },
        { id: 'b', col: 1, lane: 0, label: 'Node B', content: 'B', warning: true },
      ]}
      edges={[{ from: 'a', to: 'b', tone: 'success', pending: true, live: true }, { from: 'a', to: 'missing', tone: 'info' }]}
    />,
  );
  await userEvent.setup().click(screen.getByRole('button', { name: 'Node A' }));
  expect(onSelect).toHaveBeenCalledOnce();
  const edge = container.querySelector('[data-edge="a->b"]');
  expect(edge).toHaveAttribute('data-pending', 'true');
  expect(edge?.querySelector('circle')).not.toBeNull();
  expect(container.querySelectorAll('[data-edge]')).toHaveLength(1);
});

it('flashes only new rows', () => {
  expect(rowFlashHighlight({ isNew: true })).toBe('information');
  expect(rowFlashHighlight({})).toBeUndefined();
});
