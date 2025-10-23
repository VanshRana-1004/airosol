'use client';
import { useEffect, useState, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAllTokensForWallet } from "../utils/fetch-token";
import SendIcon from "../icons/send";
import CancelIcon from "../icons/cancel";
import { useSendTokenHook } from "../store/token-form";
import { useSendSolHook } from "../store/sol-form";
import { PublicKey } from "@solana/web3.js";
import { sendSPLToken } from "../utils/send-token";
import { Toaster,toast } from "sonner";
import { ClipLoader } from "react-spinners";

export default function Tokens(){
    
    const wallet=useWallet();
    const {connection} = useConnection();
    const {sendTokenForm,setSendTokenForm}=useSendTokenHook();
    const {sendSolForm,setSendSolForm}=useSendSolHook();
    const [width,setWidth]=useState<number>(1536)
    const toRef=useRef<HTMLInputElement>(null);
    const sendAmountRef=useRef<HTMLInputElement>(null);
    const mintAddressRef=useRef<PublicKey>(null);
    const typeRef=useRef<string>(null);
    const [loader,setLoader]=useState<boolean>(true);
    const [sendLoader,setSendLoader]=useState<boolean>(false);

    const [tokens,setTokens]=useState<
        Array<{
            mint : string,
            balance : {},
            decimals : {},
            programType : string,
            name : string,
            symbol : string,
            image : string | undefined
        }>
    >([]);

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
        const fetchTokens=async ()=>{
            if(wallet.publicKey){
                await getAllTokensForWallet(wallet.publicKey).then((res)=>{
                    setTokens(res);
                });
            }   
            else{
                setTokens([]);
            }
            setLoader(false);
        }
        fetchTokens();
    },[wallet.publicKey])
    
    async function sendTokens(){
        const to=toRef.current?.value.trim();
        const amount=Number(sendAmountRef.current?.value.trim());
        let recipientPublicKey : PublicKey;
        try{
            recipientPublicKey=new PublicKey(to!);
        }catch(e){
            toast('Recipient Public Key error');
            return;
        }
        if(!wallet.publicKey){
            toast('No public key');
            return;
        }
        setSendLoader(true);
        try{
            const signature=await sendSPLToken({
                senderPublicKey : wallet.publicKey,
                recipientPublicKey,
                mintAddress : mintAddressRef.current!,
                amount,
                connection,
                wallet,
                type : typeRef.current!
            })
            toast('Sent tokens successfully' );
            if(wallet.publicKey){
                await getAllTokensForWallet(wallet.publicKey).then((res)=>{
                    setTokens(res);
                });
            }   
            else{
                setTokens([]);
            }
            close();
        }catch(e){
            toast('error while sending token.');
            close();
        }
        setSendLoader(false);
    }
     
    function close(){
        if(sendAmountRef.current?.value) sendAmountRef.current.value='0';
        if(toRef.current?.value) toRef.current.value='';
        mintAddressRef.current=null;
        typeRef.current=null;
        setSendTokenForm(false);
    } 

    return <div className="w-full h-auto flex flex-col items-center justify-center gap-5 px-4 py-3">
        <Toaster/>
        {sendTokenForm && 
        <div className={`z-50 p-[1.5px] rounded-lg absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 ${width>=470 ? 'w-[465px]' : 'w-[95%]'} bg-[radial-gradient(circle_at_top_left,_#41F8B0_35%,_#C2ADF8_100%)] h-auto shadow-md`}>
            <div className="w-full h-full flex flex-col rounded-md p-5 bg-white gap-3">
                <div onClick={close} className="absolute right-3 top-2 cursor-pointer rounded-xl hover:bg-green-100"><CancelIcon/></div>
                <div className="w-full text-center poppins-medium text-[28px] text-zinc-800/90 tracking-tighter">Send Token</div>
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
                {sendLoader && <ClipLoader className="self-center"/>}
                {!sendLoader && <div className="flex w-full items-center justif-around px-5 gap-5 pt-1.5">
                    <div onClick={close} className="text-center w-1/2 py-1.5 text-[16px] poppins-medium text-zinc-700 border border-zinc-700 rounded-md transition-transform duration-150 active:scale-95 cursor-pointer ">Cancel</div>
                    <div onClick={sendTokens} className="text-center w-1/2 py-1.5 text-[16px] poppins-medium bg-zinc-800/90 border border-zinc-800/70 text-white rounded-md transition-transform duration-150 active:scale-95 cursor-pointer ">Send</div>
                </div>}    
            </div>
        </div>}
        {loader 
            ? 
            <ClipLoader/> 
            :
            tokens.length===0
            ?
            <p className="text-[24px] poppins-medium text-zinc-700 tracking-tighter">You have no extra tokens</p>
            :
            <div className={`flex flex-col w-full gap-5 ${sendTokenForm || sendSolForm ? 'pointer-events-none backdrop-blur-2xl opacity-30' : 'opacity-100'}`}>
                <p className="text-[24px] poppins-medium text-zinc-700 tracking-tighter ">Your Tokens</p>
                {tokens.map((token,ind)=>(
                    <div key={token.mint} className="p-5 px-7 rounded-lg border-2 border-zinc-200 backdrop-blur-2xl bg-zinc-50 shadow-md  flex items-center justify-between">
                        <div className="flex items-center gap-7">
                            {token.image ? <img src={token.image} alt={token.name} className="w-14 h-14 rounded-full border border-zinc-300" /> : <div className="w-14 h-14 bg-gray-200 rounded-full border border-zinc-300" />}
                            <div className="flex flex-col">
                                <span className="poppins-semibold text-[17px] tracking-tight text-zinc-800">{token.name}</span>
                                <span className="poppins-medium text-[16px] tracking-tight text-zinc-800">{token.balance ? `${token.balance} - ${token.symbol}` : ''}</span>
                            </div>
                        </div>
                        <div onClick={()=>{
                            setSendTokenForm(true);
                            mintAddressRef.current = new PublicKey(token.mint);
                            typeRef.current=token.programType;
                        }} className="p-1.5 rounded-full hover:bg-zinc-300 cursor-pointer "><SendIcon color="#3F3F46" size="28px"/></div>                        
                    </div>
                ))}
            </div>
        }

    </div>
}