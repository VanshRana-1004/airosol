'use client'
import { useState,useEffect,useRef } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Landing(){

    const [width,setWidth]=useState<number>(1536);
    const walletRef = useRef<HTMLDivElement>(null);
    const wallets=[
        {
            name : 'Phantom',
            img : './phantom.png'
        },
        {
            name : 'Bagpack',
            img : './bagpack.png'
        },
        {
            name : 'Metamask',
            img : './metamask.png'
        },
        {
            name : 'Solflare',
            img : './solflare.png'
        },
    ]

    const handleClick = () => {
        const walletBtn = walletRef.current?.querySelector("button");
        walletBtn?.click();
    };
        
    useEffect(()=>{
        const handleScreenResize=()=>{
        const wdth=window.innerWidth;
            setWidth(wdth);
        }
        handleScreenResize();
        window.addEventListener('resize',handleScreenResize);
        return ()=>{window.removeEventListener('resize',handleScreenResize)}
    },[])

    return <div
          className="flex flex-col items-center justify-around pt-40 pb-15 w-screen h-screen bg-white bg-center"
          style={{
            backgroundImage: `url(${width >= 470 ? '/dt.png' : '/mobile.png'})`,
          }}
        >
        
        <div className={`cursor-default absolute flex items-center top-5  ${width > 768 ? 'left-16' : 'left-5'}`}>
          <img src="/logo.png" alt="" className={`${width>768 ? 'size-8' : 'size-7'}`}/>
          <p className={`poppins-medium text-black tracking-tighter translate-y-0.5 ${width>768 ? 'text-[25px]' : 'text-[20px]'}`}>AiroSOL</p>
        </div>

        <div className="flex flex-col text-[#252432] -translate-y-10 gap-0 items-center">
          <div className={`cursor-default flex flex-col items-center justify-center raleway-medium tracking-tighter ${width>768 ? ' text-[94px] leading-22' : width>500 ? 'text-[50px] leading-15' : 'leading-10 text-[38px]'}`}>
            <p>Seamless Airdrops.</p>
            <p> Effortless Transfers.</p>
          </div>
          <p className={`cursor-default leading-5 text-wrap text-center px-5 tracking-tighter ${width>768 ? 'raleway-medium text-[20px]' : 'raleway-regular text-[16px]'}`}>Send, receive, and manage SOL directly from your wallet - fast, secure, and decentralized.</p>
          <div onClick={handleClick} className={`cursor-pointer translate-y-5 ${width>768 ? 'px-10 py-3 text-[16px]' : 'w-[135px] h-[38px] text-[11px]'} bg-[#252432] hover:bg-gray-700 text-white text-center raleway-medium rounded-xl flex items-center justify-center transition-transform duration-150 active:scale-95`}>Select Wallet</div>
          <div ref={walletRef} style={{ display: "none" }}>
            <WalletMultiButton />
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center w-full">
          <p className={`cursor-default text-[#000000] tracking-tight ${width>768 ? 'raleway-semibold text-[20px]' : 'raleway-bold text-[16px]'}`}>Supports</p>
          <div className={`cursor-default gap-5 ${width>768 ? 'w-[60%] flex items-center justify-around p-3 py-2' : 'w-[80%] grid grid-cols-2 p-5'} rounded-2xl border border-white/10 bg-white/10 shadow-2xl`}>

            {wallets.map((wallet,ind)=>(
              <div key={ind} className="flex gap-1 items-center">
                <img src={wallet.img} alt="" className={`size-8`} />
                <p className={`inter-medium text-[#252432] tracking-tight ${width>768 ? 'text-[19px]' : 'text-[16px]'}`}>{wallet.name}</p>
              </div>
            ))}

          </div>
        </div>

    </div>
}