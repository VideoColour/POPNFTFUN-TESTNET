import { createThirdwebClient } from "thirdweb";
import { ethers } from "ethers";

const meldTestnet = {
  name: "Meld Testnet",
  chainId: 222000222, 
  rpc: ["https://testnet-rpc.meld.com"],
  nativeCurrency: {
    name: "MELD",
    symbol: "MELD",
    decimals: 18, 
    tokenAddress: "0x22200025a5bC2C7dA9C8Ed6c051A58E12EfA7501", 
    icon: "https://avatars.githubusercontent.com/u/53253566?s=200&v=4",
  },
  blockExplorers: [
    {
      name: "Meld Explorer",
      url: "https://testnet.meldscan.io",
    },
  ],
  testnet: true,
  chain: "meld-testnet",
  shortName: "MELD",
  slug: "meld-testnet",
};

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID as string,
  secretKey: process.env.TW_SECRET_KEY as string,
});

export { meldTestnet };

// Ensure that the private key is securely stored and not exposed in client-side code
export const privateKey = process.env.PRIVATE_KEY; // Ensure this is set in your environment
export const provider = new ethers.JsonRpcProvider("https://testnet-rpc.meld.com");
