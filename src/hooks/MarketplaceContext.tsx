import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface MarketplaceProviderProps {
  chainId: string;
  contractAddress: string;
  children: ReactNode;
  fetchListings: () => Promise<any>;
}

const MarketplaceContext = createContext({});

const MarketplaceProvider = ({ children, chainId, contractAddress }: MarketplaceProviderProps) => {
  const [marketplaceState, setMarketplaceState] = useState({});

  useEffect(() => {
    // You can use chainId and contractAddress here to fetch and set state as needed
    console.log("Chain ID:", chainId);
    console.log("Contract Address:", contractAddress);
    // Fetch and set state logic here
  }, [chainId, contractAddress]);

  return (
    <MarketplaceContext.Provider value={{ marketplaceState, setMarketplaceState }}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export { MarketplaceProvider };