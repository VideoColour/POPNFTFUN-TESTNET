import { Account } from "thirdweb/dist/types/wallets/interfaces/wallet";
import { SignableMessage } from "viem";

export interface ExtendedAccount extends Omit<Account, 'signMessage'> {
  signMessage: ({ message }: { message: SignableMessage }) => Promise<`0x${string}`>;
}
