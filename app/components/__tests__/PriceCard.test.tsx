import { render, screen } from '@testing-library/react';
import { PriceCard } from '../PriceCard';

describe('PriceCard', () => {
  it('renders price when provided', () => {
    render(<PriceCard price={50000} previousPrice={49000} />);

    expect(screen.getByText('BTC/USD')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('50,000.00')).toBeInTheDocument();
  });

  it('shows placeholder when no price', () => {
    render(<PriceCard price={null} previousPrice={null} />);

    expect(screen.getByText('BTC/USD')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('--,---.--')).toBeInTheDocument();
  });

  it('shows price change indicator', () => {
    render(<PriceCard price={51000} previousPrice={50000} />);

    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('+2.00%')).toBeInTheDocument();
  });
});

