import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

describe('Header', () => {
  it('renders the title', () => {
    render(<Header />);

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Prophet')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Header />);

    expect(screen.getByText(/Make a single guess on BTC\/USD/i)).toBeInTheDocument();
  });

  it('has correct aria label on title', () => {
    render(<Header />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveAttribute('aria-label', 'BTC Prophet price prediction game');
  });
});

