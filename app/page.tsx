'use client';
import { useState,useEffect,useRef } from "react";
import { ConnectionProvider,useWallet,WalletProvider} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletMultiButton,WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css'; 
import MainSection from "./component/main";

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <>
    <ConnectionProvider endpoint={'https://solana-devnet.g.alchemy.com/v2/a8DcczcXqLc4JZ1GHX3hQ'}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>

          <MainSection/>

        </WalletModalProvider>
      </WalletProvider>    
    </ConnectionProvider>  
  </>
}