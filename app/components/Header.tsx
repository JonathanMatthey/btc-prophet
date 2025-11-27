export function Header() {
  return (
    <header className="text-center mb-8">
      <h1 className="text-5xl font-bold tracking-tight mb-2" aria-label="BTC Prophet price prediction game">
        BTC{' '}
        <span
          className="font-bold"
          style={{
            background: 'linear-gradient(90deg, #0066FF 0%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Prophet
        </span>
      </h1>
      <p className="text-gray-400 text-sm">Make a single guess on BTC/USD over the next 60 seconds.</p>
    </header>
  );
}

