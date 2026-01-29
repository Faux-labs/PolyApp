"use client";

import { useState, useEffect } from 'react';

type ViewState = 'feed' | 'categories' | 'category_feed' | 'portfolio' | 'trades';

const CATEGORIES = [
  { name: "Crypto", color: "bg-orange-300" },
  { name: "Politics", color: "bg-blue-300" },
  { name: "Sports", color: "bg-green-300" },
  { name: "Business", color: "bg-yellow-300" },
  { name: "Pop Culture", color: "bg-pink-300" },
  { name: "Science", color: "bg-purple-300" },
];

export default function Home() {
  const [view, setView] = useState<ViewState>('categories'); // Default to categories/markets view as requested implicitly? Or keep feed? Let's default to 'feed' for now but Portfolio button switches.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [buyState, setBuyState] = useState<{ market: string, option: 'YES' | 'NO', price: number } | null>(null);
  const [walletStatus, setWalletStatus] = useState<'idle' | 'creating' | 'created' | 'failed' | 'success_screen'>('idle');

  useEffect(() => {
    // Import SDK to listen to MainButton clicks
    import('@telegram-apps/sdk').then((sdk) => {
      // Ensure SDK is initialized
      try {
        sdk.init();
      } catch (err) {
        // SDK might already be initialized by Provider, which is fine
        console.log("SDK Init check in page:", err);
      }

      const handleMainButtonClick = () => {
        // If in buy mode, maybe confirm buy? For now, stick to 'trades' view on main button click
        // Or we could make MainButton the "CONFIRM BUY" button if buyState is active.
        // Let's keep it simple: View Trades.
        if (!buyState) {
          setView('trades');
        }
      };

      // Use clean onClick/offClick methods
      sdk.mainButton.onClick(handleMainButtonClick);

      return () => {
        sdk.mainButton.offClick(handleMainButtonClick);
      };
    }).catch(err => console.error("Failed to load SDK in page:", err));
  }, [buyState]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setView('category_feed');
  };

  const initiateBuy = (market: string, option: 'YES' | 'NO', percent: number) => {
    // Price is roughly the percentage as cents (e.g. 64% = $0.64)
    setBuyState({
      market,
      option,
      price: percent / 100
    });
  };

  const handleWalletClick = () => {
    console.log("Current Wallet Status:", walletStatus);
    if (walletStatus === 'idle') {
      console.log("Starting wallet creation...");
      setWalletStatus('creating');

      // Simulate API call
      setTimeout(() => {
        console.log("Wallet created, showing success...");
        setWalletStatus('success_screen');

        setTimeout(() => {
          console.log("Wallet flow complete.");
          setWalletStatus('created');
        }, 1500);
      }, 2000);
    } else if (walletStatus === 'created') {
      console.log("Navigating to portfolio...");
      setView('portfolio');
    } else {
      console.log("Wallet click ignored in status:", walletStatus);
    }
  };

  const renderContent = () => {
    if (buyState) {
      return (
        <div className="space-y-6 pb-24">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setBuyState(null)} className="font-bold underline">&lt; BACK</button>
            <h2 className="text-xl font-black uppercase text-white bg-black px-2">CONFIRM ORDER</h2>
          </div>

          <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase mb-4">{buyState.market}</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-gray-500">OPTION</span>
                <span className={`font-black text-xl px-2 border-2 border-black ${buyState.option === 'YES' ? 'bg-green-400' : 'bg-red-400'}`}>{buyState.option}</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-gray-500">PRICE</span>
                <span className="font-black text-xl">${buyState.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-gray-500">SHARES</span>
                <input type="number" className="font-black text-xl w-24 text-right bg-gray-100 border-2 border-black p-1" defaultValue={10} />
              </div>
            </div>

            <button className="w-full mt-6 bg-black text-white p-4 font-black text-xl border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-all uppercase" onClick={() => {
              alert("Order Placed!"); // Mock action
              setBuyState(null);
            }}>
              BUY {buyState.option}
            </button>
          </section>
        </div>
      )
    }

    switch (view) {
      case 'categories':
        return (
          <div className="grid grid-cols-2 gap-4 pb-24">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`border-4 border-black ${cat.color} p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer aspect-square flex items-center justify-center`}
              >
                <span className="text-xl font-black italic uppercase">{cat.name}</span>
              </button>
            ))}
          </div>
        );
      case 'category_feed':
        return (
          <div className="space-y-6 pb-24">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setView('categories')} className="font-bold underline">&lt; BACK</button>
              <h2 className="text-xl font-black uppercase text-white bg-black px-2">{selectedCategory}</h2>
            </div>
            {Array.from({ length: 15 }).map((_, i) => (
              <MarketCard key={i} index={i} category={selectedCategory} onBuy={initiateBuy} />
            ))}
          </div>
        );
      case 'portfolio':
        if (walletStatus !== 'created') {
          return (
            <div className="flex flex-col items-center justify-center space-y-4 pt-12 pb-24">
              <div className="text-6xl">🔒</div>
              <h2 className="text-2xl font-black italic text-center px-8">WALLET LOCKED</h2>
              <p className="font-bold text-center px-8">Create a Gnosis Safe wallet to access your portfolio and trades.</p>
              <button type="button" onClick={handleWalletClick} className="bg-cyan-300 border-4 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                CREATE WALLET
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-6 pb-24">
            {/* PnL Summary */}
            <section className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black italic mb-4">YOUR PERFORMANCE</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-100 p-2 border-2 border-black">
                  <p className="text-xs font-bold text-gray-500">INVESTED</p>
                  <p className="text-lg font-black">$500.00</p>
                </div>
                <div className="bg-green-300 p-2 border-2 border-black">
                  <p className="text-xs font-bold text-black">NET PNL</p>
                  <p className="text-lg font-black text-green-900">+$124.50</p>
                </div>
              </div>
              <div className="mt-4 bg-black text-white p-2 text-center font-bold font-mono">
                TOTAL VALUE: $624.50
              </div>
            </section>

            <h3 className="text-lg font-black uppercase bg-yellow-300 inline-block px-2 border-2 border-black">Active Positions</h3>

            {/* Portfolio Items */}
            <PortfolioItemCard
              question="Will Bitcoin hit $100k in Jan?"
              position="YES"
              shares={400}
              avgPrice={0.45}
              currentPrice={0.64}
            />
            <PortfolioItemCard
              question="Will Elon Musk buy TikTok?"
              position="NO"
              shares={150}
              avgPrice={0.80}
              currentPrice={0.95}
            />
            <PortfolioItemCard
              question="Will GTA VI trailer 2 drop?"
              position="YES"
              shares={200}
              avgPrice={0.50}
              currentPrice={0.10}
            />
          </div>
        );
      case 'trades':
        if (walletStatus !== 'created') {
          // Re-use same lock screen or similar
          return (
            <div className="flex flex-col items-center justify-center space-y-4 pt-12 pb-24">
              <div className="text-6xl">🔒</div>
              <h2 className="text-2xl font-black italic text-center px-8">TRADES LOCKED</h2>
              <p className="font-bold text-center px-8">Create a Gnosis Safe wallet to view your history.</p>
            </div>
          );
        }
        return (
          <div className="space-y-6 pb-24">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setView('categories')} className="font-bold underline">&lt; BACK</button>
              <h2 className="text-xl font-black uppercase text-white bg-black px-2">RECENT TRADES</h2>
            </div>

            {getTransactions().map((tx, i) => (
              <TransactionCard key={i} tx={tx} />
            ))}
          </div>
        );
      case 'feed':
      default:
        // Default infinite feed
        return (
          <div className="space-y-6 pb-24">
            {Array.from({ length: 20 }).map((_, i) => (
              <MarketCard key={i} index={i} onBuy={initiateBuy} />
            ))}
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-yellow-400 p-4 font-mono text-black">
      {/* Overlay for wallet creation */}
      {walletStatus === 'creating' && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-3xl font-black italic text-white animate-pulse">CREATING GNOSIS SAFE WALLET...</h2>
        </div>
      )}
      {walletStatus === 'success_screen' && (
        <div className="fixed inset-0 z-[9999] bg-green-400 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-4xl font-black italic text-black mb-4">SUCCESS!</h2>
          <p className="text-xl font-bold border-4 border-black p-2 bg-white">WALLET DISCOVERED</p>
        </div>
      )}

      {/* Header */}
      <header className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 flex justify-between items-center relative">
        <div>
          <h1 className="text-2xl font-black italic">POLY-EMPIRE</h1>
          <p className="text-sm font-bold">Level 1: Novice Predictor</p>
        </div>
        <button
          onClick={handleWalletClick}
          disabled={walletStatus === 'creating' || walletStatus === 'success_screen'}
          className={`${walletStatus === 'created' ? 'bg-green-400' : 'bg-cyan-300'} border-4 border-black px-2 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer`}
        >
          {walletStatus === 'created' ? 'WALLET' : 'CREATE WALLET'}
        </button>
      </header>

      {renderContent()}

      <footer className="fixed bottom-4 left-4 right-4 grid grid-cols-2 gap-4">
        <button
          onClick={() => setView('categories')}
          className={`border-4 border-black ${view === 'categories' ? 'bg-black text-white' : 'bg-white'} p-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer ${walletStatus !== 'created' ? 'col-span-2' : ''}`}
        >
          MARKETS
        </button>
        {walletStatus === 'created' && (
          <button
            onClick={() => setView('portfolio')}
            className={`border-4 border-black ${view === 'portfolio' ? 'bg-black text-white' : 'bg-white'} p-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer`}
          >
            PORTFOLIO
          </button>
        )}
      </footer>
    </main>
  );
}

function PortfolioItemCard({
  question,
  position,
  shares,
  avgPrice,
  currentPrice
}: {
  question: string,
  position: "YES" | "NO",
  shares: number,
  avgPrice: number,
  currentPrice: number
}) {
  const isProfit = currentPrice >= avgPrice;
  const pnlPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
  const value = shares * currentPrice;

  return (
    <section className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
      <h2 className="text-sm font-black uppercase mb-2 truncate">{question}</h2>

      <div className="flex justify-between items-end mb-2">
        <div>
          <span className={`text-xs font-bold px-1 border border-black ${position === 'YES' ? 'bg-green-400' : 'bg-red-400'}`}>
            {position}
          </span>
          <span className="text-xs font-bold ml-2 text-gray-500">
            {shares} shares @ ${avgPrice.toFixed(2)}
          </span>
        </div>
        <div className={`text-lg font-black ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
          {isProfit ? '+' : ''}{pnlPercent.toFixed(1)}%
        </div>
      </div>

      <div className="border-t-2 border-black pt-2 flex justify-between items-center bg-gray-50">
        <span className="text-xs font-bold text-gray-500 uppercase px-2">Current Value</span>
        <span className="font-black font-mono px-2">${value.toFixed(2)}</span>
      </div>
    </section>
  );
}

function TransactionCard({ tx }: { tx: { type: string, market: string, shares: number, price: number, date: string } }) {
  const isBuy = tx.type === 'BUY';
  return (
    <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-black px-1 border border-black ${isBuy ? 'bg-green-300' : 'bg-red-300'}`}>
            {tx.type}
          </span>
          <span className="text-xs font-bold text-gray-400">{tx.date}</span>
        </div>
        <h3 className="text-sm font-bold truncate max-w-[200px]">{tx.market}</h3>
        <p className="text-xs font-mono mt-1">
          {tx.shares} shares @ ${tx.price.toFixed(2)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-black text-lg">-${(tx.shares * tx.price).toFixed(2)}</p>
      </div>
    </div>
  );
}

function getTransactions() {
  return [
    { type: 'BUY', market: "Will Bitcoin hit $100k in Jan?", shares: 400, price: 0.45, date: "2024-01-12 14:30" },
    { type: 'BUY', market: "Will Elon Musk buy TikTok?", shares: 150, price: 0.80, date: "2024-01-11 09:15" },
    { type: 'BUY', market: "Will GTA VI trailer 2 drop?", shares: 200, price: 0.50, date: "2024-01-10 18:45" },
  ];
}

function MarketCard({ index, category, onBuy }: { index: number, category?: string | null, onBuy?: (market: string, option: 'YES' | 'NO', price: number) => void }) {
  const data = getMarketData(index, category);
  return (
    <section className="border-4 border-black bg-cyan-300 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
      <h2 className="text-lg font-black uppercase mb-2">{data.question}</h2>
      <div className="flex justify-between font-bold">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBuy?.(data.question, 'YES', data.yes);
          }}
          className="bg-green-400 border-2 border-black px-2 hover:bg-green-500 active:bg-green-600 transition-colors"
        >
          YES: {data.yes}%
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBuy?.(data.question, 'NO', 100 - data.yes);
          }}
          className="bg-red-400 border-2 border-black px-2 hover:bg-red-500 active:bg-red-600 transition-colors"
        >
          NO: {100 - data.yes}%
        </button>
      </div>
    </section>
  );
}

function getMarketData(index: number, category?: string | null) {
  const genericMarkets = [
    "Will Bitcoin hit $100k in Jan?",
    "Will Solana flip BNB by Q2?",
    "Will Elon Musk buy TikTok?",
    "Will GPT-5 release before July?",
    "Will Ethereum Gas drop below 5 gwei?",
    "Will Apple launch a foldable iPhone?",
    "Will the Fed cut rates in March?",
    "Will GTA VI trailer 2 drop this week?",
    "Will TypeScript add native types?",
    "Will React 20 remove hooks?",
  ];

  const categoryMarkets: Record<string, string[]> = {
    "Crypto": [
      "Will BTC break ATH this week?", "ETH to $10k by EOY?", "Solana ETF approval?", "Dogecoin to $1?", "Binance to list PEPE?"
    ],
    "Politics": [
      "Who will win 2024 Election?", "New tax bill passes?", "Approval rating up?", "Cabinet reshuffle?"
    ],
    "Sports": [
      "Lakers to win finals?", "Mbappe triggers clause?", "F1 Champion 2025?", "Superbowl winner?"
    ],
    "Business": [
      "OpenAI IPO in 2025?", "NVIDIA hits $4T cap?", "Twitter rebrands back to Bird?", "Tesla recalls cybertruck?"
    ],
    "Pop Culture": [
      "Taylor Swift album drop?", "Next James Bond announced?", "Oscar Best Picture?", "Met Gala theme?"
    ],
    "Science": [
      "Fusion breakthrough confirmed?", "Mars colony date set?", "Cancer value approved?", "AGI achieved?"
    ]
  };

  let pool = genericMarkets;
  if (category && categoryMarkets[category]) {
    pool = categoryMarkets[category];
  }

  // Deterministic pseudo-random based on index
  const question = pool[index % pool.length];
  const yes = 30 + (index * 7) % 60; // Random-ish percentage between 30 and 90

  return { question, yes };
}