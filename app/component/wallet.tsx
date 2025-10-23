'use client'
import { useEffect,useState,useRef } from "react";
import { WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { useConnection,useWallet } from "@solana/wallet-adapter-react";
import { ed25519 } from "@noble/curves/ed25519.js";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import SendIcon from "../icons/send";
import CancelIcon from "../icons/cancel";
import Tokens from "./tokens";
import { useSendTokenHook } from "../store/token-form";
import { useSendSolHook } from "../store/sol-form";
import {Toaster,toast} from 'sonner';
import { ClipLoader } from "react-spinners";

export default function Wallet(){
    
    const {connection}=useConnection();
    const wallet=useWallet();
    const [width,setWidth]=useState<number>(1536);
    const [balance,setBalance]=useState<number>(0);
    const walletRef = useRef<HTMLDivElement>(null);
    const amountRef=useRef<HTMLInputElement>(null);
    const toRef=useRef<HTMLInputElement>(null);
    const sendAmountRef=useRef<HTMLInputElement>(null);
    const [authenticated,setAuthenticated]=useState<boolean>(false);
    const {sendSolForm,setSendSolForm}=useSendSolHook();
    const {sendTokenForm,setSendTokenForm}=useSendTokenHook();
    const [airdropLoader,setAirdropLoader]=useState<boolean>(false);
    const [loader,setLoader]=useState<boolean>(false);

    useEffect(()=>{
        const handleScreenResize=()=>{
        const wdth=window.innerWidth;
            setWidth(wdth);
        }
        handleScreenResize();
        window.addEventListener('resize',handleScreenResize);
        return ()=>{window.removeEventListener('resize',handleScreenResize)}
    },[])

    useEffect(()=>{
        async function getBalance() {
            if (wallet.publicKey && connection) {
                try {
                    const balance = await connection.getBalance(wallet.publicKey);
                    setBalance(balance / LAMPORTS_PER_SOL);
                } catch (error) {
                    console.error("Error fetching balance:", error);
                }
            } else {
                setBalance(0); 
            }
        }
        getBalance()
    },[wallet.publicKey,connection])

    const handleClick = () => {
        const walletBtn = walletRef.current?.querySelector("button");
        walletBtn?.click();
    };

    async function airdrop(){
        if (!wallet.publicKey || !amountRef.current || isNaN(Number(amountRef.current.value)) || amountRef.current.value==='0' || amountRef.current.value==='') {
            toast("Invalid amount or wallet not connected.");
            return;
        }
        setAirdropLoader(true);
        try {
            const amount=Number(amountRef.current?.value)
            await connection.requestAirdrop(wallet.publicKey!, amount * 1_000_000_000);
            const balance = await connection.getBalance(wallet.publicKey!);
            setBalance(balance/LAMPORTS_PER_SOL);
            if(amountRef.current) amountRef.current.value='0';
            setAirdropLoader(false);
            toast('Airdrop successful');
        } catch (err) {
            setAirdropLoader(false);
            toast('Error while requesting SOL')
            console.error("Airdrop error:", err);
        }
    }

    async function sendSol(){
        const to=toRef.current?.value.trim();
        const amount=Number(sendAmountRef.current?.value.trim());    
        const transaction=new Transaction();
        if(to==wallet.publicKey?.toBase58()){
            toast(`You can't send token to your account `);
            return;
        }
        setLoader(true);
        try{
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey:wallet.publicKey!,
                    toPubkey:new PublicKey(to!),
                    lamports:amount*LAMPORTS_PER_SOL
                })
            )
            await wallet.sendTransaction(transaction, connection);
            toast("Sent " + amount + " SOL to " + to);
            const balance = await connection.getBalance(wallet.publicKey!);
            setBalance(balance/LAMPORTS_PER_SOL);
            setSendSolForm(false);
            setLoader(false);
        }catch(e){
            setLoader(false);
            let msg: string;
            if (e instanceof Error) {
                msg = e.message;
            } else {
                try {
                    msg = String(e);
                } catch {
                    msg = "Unknown error";
                }
            }

            if (
                msg.includes("User rejected") ||
                msg.includes("User declined") ||
                msg.includes("rejected the request") ||
                msg.includes("cancel") ||
                msg.includes("denied")
            ) {
                toast("Transaction cancelled");
                return;
            }

            toast("Error while sending SOL");
        }
    }

    async function signMessage() {
        try {
            if (!wallet?.signMessage || !wallet?.publicKey) {
                toast('Wallet or required properties not found');
                return;
            }

            const message = new TextEncoder().encode(
                `${window.location.host} wants you to sign in with your Solana account:\n${wallet.publicKey.toBase58()}\n\nPlease sign in.`
            );

            let signature;
            try{
                signature=await wallet.signMessage(message);
            } 
            catch(e){
                toast('error while authentication');
                return;
            }

            if (!wallet.publicKey) {
                toast('Public key not found');
                return;
            }

            if (!ed25519.verify(signature, message, wallet.publicKey.toBytes())) {
                toast('Signature verification failed');
                return;
            }

            setAuthenticated(true);
            toast('Authentication successful');
        } catch (error) {
            toast('Authentication failed');
            console.error('Sign message error:', error);
        }
    }

    return <div className={`flex flex-col w-full h-full bg-white ${width>768 ? 'px-16 gap-5' : 'px-5 gap-3'} `}>
        <Toaster/>
        {authenticated && sendSolForm &&
            <div className={`z-50 p-[1.5px] rounded-lg absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 ${width>=470 ? 'w-[465px]' : 'w-[95%]'} bg-[radial-gradient(circle_at_top_left,_#41F8B0_35%,_#C2ADF8_100%)] h-auto shadow-md`}>
                <div className="w-full h-full flex flex-col rounded-md p-5 bg-white gap-3">
                    <div onClick={()=>setSendSolForm(false)} className="absolute right-3 top-2 cursor-pointer rounded-xl hover:bg-green-100"><CancelIcon/></div>
                    <div className="w-full text-center poppins-medium text-[28px] text-zinc-800/90 tracking-tighter">Send Transaction</div>
                    <div className="flex flex-col w-full p-3 border border-zinc-200/30 bg-zinc-50 backdrop-blur-lg rounded-xl shadow-md">
                        <p className=" text-zinc-500 poppins-semibold text-[16px] tracking-tighter">From</p>
                        <p className=" text-zinc-700 poppins-light text-[14px] truncate">{wallet.publicKey?.toBase58()}</p>
                    </div>
                    <div className="flex flex-col w-full py-1.5">
                        <p className="poppins-semibold text-zinc-500 text-[16px] tracking-tighter">To Address</p>
                        <input ref={toRef} type="text" placeholder="Enter Address" className="bg-white border border-zinc-300 px-3 py-1.5 w-full rounded-md text-zinc-500 placeholder:text-zinc-500 text-[14px] poppins-medium focus:outline-0 "/>
                    </div>
                    <div className="flex flex-col w-full py-1.5">
                        <p className="poppins-semibold text-zinc-500 text-[16px] tracking-tighter">Amount</p>
                        <input ref={sendAmountRef} type="number" placeholder=" Amount" className="bg-white border border-zinc-300 px-3 py-1.5 w-full rounded-md text-zinc-500 placeholder:text-zinc-500 text-[14px] poppins-medium focus:outline-0 "/>
                    </div>
                    {loader && <ClipLoader className="self-center"/>}
                    {!loader && 
                        <div className="flex w-full items-center justif-between px-5 gap-5 pt-1.5">
                            <div onClick={()=>setSendSolForm(false)} className="text-center w-1/2 py-1.5 text-[16px] poppins-medium text-zinc-700 border border-zinc-700 rounded-md transition-transform duration-150 active:scale-95 cursor-pointer ">Cancel</div>
                            <div onClick={sendSol} className="text-center w-1/2 py-1.5 text-[16px] poppins-medium bg-zinc-800/90 border border-zinc-800/70 text-white rounded-md transition-transform duration-150 active:scale-95 cursor-pointer ">Send</div>
                        </div>
                    }
                </div>
            </div>
        }

        <div className={`flex items-center justify-between ${authenticated && (sendSolForm || sendTokenForm) ? 'pointer-events-none backdrop-blur-2xl opacity-30' : 'opacity-100'}`}>
            <div className={`cursor-default flex items-center`}>
                <img src="/logo.png" alt="" className={`${width>768 ? 'size-8' : 'size-7'}`}/>
                <p className={`poppins-medium text-black tracking-tighter translate-y-0.5 ${width>768 ? 'text-[25px]' : 'text-[20px]'}`}>AiroSOL</p>
            </div>
            <div ref={walletRef} style={{ display: "none" }}>
                <WalletDisconnectButton />
            </div>
            <div onClick={handleClick} className={`cursor-pointer ${width>768 ? 'px-6 py-2 text-[16px]' : 'py-1.5 px-7 text-[14px]' } text-white bg-red-500 hover:bg-red-600 rounded-md poppins-medium transition-transform duration-150 active:scale-95`}>Disconnect</div>
        </div>

        <div className={`w-full h-auto flex flex-col gap-5 `}>

            <div className={`rounded-lg p-[1.3px] pb-[1.5px] h-auto w-full bg-[radial-gradient(circle_at_top_left,_#41F8B0_35%,_#C2ADF8_100%)] `}>
                <div className={`rounded-md w-full h-full bg-white`}>
                    <div className={`rounded-md w-full h-full bg-white gap-5 flex flex-col ${width>768 ? 'p-7' : 'p-5'} ${authenticated && (sendSolForm || sendTokenForm) ? 'pointer-events-none backdrop-blur-2xl opacity-30' : 'opacity-100'}`}>
                        <div className={`flex items-center ${authenticated ? 'justify-between' : 'justify-start'} `}>
                            <img src="/sol.png" alt="" className="h-10 w-40 "/>
                            {authenticated && 
                                <div onClick={()=>setSendSolForm(true)} className="flex gap-2 transition-transform duration-150 active:scale-95 hover:scale-105 cursor-pointer px-5 py-2 w-fit text-white poppins-medium rounded-md bg-[radial-gradient(circle_at_bottom_left,_#815EEF_2%,_#26F6A6_100%)] border border-[#26F6A6] hover:shadow-md hover:shadow-green-200">
                                    <SendIcon color="#ffffff" size='24px'/>
                                    Send SOL
                                </div>
                            }
                        </div>
                        <div className="flex flex-col self-start gap-1">
                            <div className="flex gap-5 items-center">
                                <p className="text-zinc-800/90 poppins-medium tracking-tight text-[24px]">Balance</p>
                            </div>
                            <div className="text-[48px] poppins-medium tracking-tighter text-zinc-800/90 leading-[48px]">{`${balance} SOL`}</div>
                        </div>
                        <div className="flex gap-5 items-center">
                            {airdropLoader && <ClipLoader/>}
                            {!airdropLoader && <input ref={amountRef} type="number" step='0.01' min='0'  className="border border-[#252432]/50 rounded-md w-36 px-5 py-2 focus:outline-0 placeholder:text-[#252432]/70 raleway-medium text-[17px] text-[#252432]/70 tracking-tight" placeholder="Amount"/>}
                            {!airdropLoader && <div onClick={airdrop} className="transition-transform duration-150 active:scale-95 cursor-pointer px-5 py-2 text-white poppins-medium tracking-tight rounded-md bg-zinc-800/90 hover:bg-zinc-700/70  text-[17px]">Request Airdrop</div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`rounded-lg p-[1.5px] h-auto w-full bg-[radial-gradient(circle_at_top_left,_#41F8B0_35%,_#C2ADF8_100%)]`}>
                <div className={`rounded-md w-full h-full bg-white flex flex-col items-center ${width>768 ? 'p-5 py-7' : 'p-5'}`}>
                    
                    {!authenticated && <div className="flex flex-col gap-1 items-center">
                        <p className="text-zinc-800/90 poppins-medium tracking-tighter text-[28px]">You must authenticate to send tokens</p>
                        <div onClick={signMessage} className="transition-transform duration-150 active:scale-95 cursor-pointer px-5 py-2 w-fit text-white poppins-medium rounded-md bg-zinc-800/90 text-[17px]">Authenticate</div>
                    </div>}
                    
                    {/* after authentication show all the tokens here */}
                    {authenticated && 
                        <Tokens/>
                    }
                </div>
            </div>

        </div>

    </div>
}