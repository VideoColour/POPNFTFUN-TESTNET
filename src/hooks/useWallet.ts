import { useActiveWallet, useActiveAccount, useActiveWalletConnectionStatus, useActiveWalletChain } from "thirdweb/react";

export function useWallet() {
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const chain = useActiveWalletChain();

  return {
    isWalletConnected: connectionStatus === 'connected',
    wallet,
    account,
    address: account?.address,
    connectionStatus,
    chain,
  };
}
