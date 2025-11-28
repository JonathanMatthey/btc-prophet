import { render, screen } from '@testing-library/react';
import { ScoreCard } from '../ScoreCard';

describe('ScoreCard', () => {
  it('renders score of 0', () => {
    render(<ScoreCard score={0} />);

    expect(screen.getByText('Your Score')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('points')).toBeInTheDocument();
  });

  it('renders positive score', () => {
    render(<ScoreCard score={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders negative score', () => {
    render(<ScoreCard score={-5} />);

    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<ScoreCard score={10} />);

    const section = screen.getByRole('status');
    expect(section).toHaveAttribute('aria-label', 'Your current score');
  });
});

