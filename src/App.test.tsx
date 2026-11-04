import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the placeholder with the simulation-only notice', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Cryptex' })).toBeInTheDocument();
  expect(screen.getByText(/simulation only/i)).toBeInTheDocument();
});
