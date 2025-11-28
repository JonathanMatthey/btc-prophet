import { render, screen } from '@testing-library/react';
import { GameControls } from '../GameControls';

const baseTimer = { elapsed: 0, total: 60000 };

describe('GameControls', () => {
  it('shows idle state when there is no active guess or result', () => {
    render(
      <GameControls
        activeGuess={null}
        lastResult={null}
        timer={baseTimer}
        makeGuess={jest.fn()}
        continueGame={jest.fn()}
      />
    );

    expect(screen.getByText(/Make Your Prediction/i)).toBeInTheDocument();
  });

  it('shows pending state when there is an active guess', () => {
    render(
      <GameControls
        activeGuess={{
          playerId: 'test-player',
          direction: 'up',
          priceAtGuess: 30000,
          timestamp: Date.now(),
          resolved: false,
        }}
        lastResult={null}
        timer={baseTimer}
        makeGuess={jest.fn()}
        continueGame={jest.fn()}
      />
    );

    expect(screen.getByText(/Prediction Active/i)).toBeInTheDocument();
  });

  it('shows result state when there is a last result', () => {
    render(
      <GameControls
        activeGuess={null}
        lastResult={{
          won: true,
          fromPrice: 10000,
          toPrice: 11000,
          scoreChange: 1,
        }}
        timer={baseTimer}
        makeGuess={jest.fn()}
        continueGame={jest.fn()}
      />
    );

    expect(screen.getByText(/Continue Playing/i)).toBeInTheDocument();
  });
});
