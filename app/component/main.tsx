'use client';
import { useWallet } from "@solana/wallet-adapter-react"
import Landing from "./landing";
import Wallet from "./wallet";
export default function MainSection() {
  const { connected,publicKey } = useWallet();
  return (
    <div className="w-screen h-screen">
      {!connected 
        ? 
          <Landing/>
        :
        <Wallet/>
      }
    </div>
  );
}