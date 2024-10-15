import { defineChain } from "thirdweb";


export const meldTestnet = {
    id: 222000222, 
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
    testnet: true as const, 
    chain: "meld-testnet", 
    slug: "meld-testnet",
};




export const example_customChain1 = defineChain(0.001); 

