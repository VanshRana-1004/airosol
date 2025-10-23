import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import {Connection,PublicKey,Transaction} from '@solana/web3.js';

interface Props {
  senderPublicKey: PublicKey;
  recipientPublicKey: PublicKey;
  mintAddress: PublicKey;
  connection: Connection;
  amount: number;
  wallet: WalletContextState;
  type: string;
}

export async function sendSPLToken({senderPublicKey,recipientPublicKey,mintAddress,amount,connection,wallet,type} : Props){
    try{
        const transaction=new Transaction();
        const programId=type==='Token-22' ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
        const senderTokenAccount=await getAssociatedTokenAddress(
            mintAddress,
            senderPublicKey,
            false,
            programId
        )

        const senderAccountInfo=await connection.getAccountInfo(senderTokenAccount)
        if(!senderAccountInfo){
            throw new Error(`Sender's token account does not exist.`)
        }
      
        const recipientTokenAccount=await getAssociatedTokenAddress(
            mintAddress,
            recipientPublicKey,false,
            programId
        )
        const recipientAccountInfo = await connection.getAccountInfo(
            recipientTokenAccount
        );
        if (!recipientAccountInfo) {
           transaction.add(
                createAssociatedTokenAccountInstruction(
                    senderPublicKey, 
                    recipientTokenAccount,
                    recipientPublicKey,
                    mintAddress,
                    programId
                )
            );
        }

        const mintInfo=await getMint(
            connection,
            mintAddress,
            undefined,
            programId
        )

        const rawAmount = BigInt(amount * 10 ** mintInfo.decimals);

        transaction.add(
            createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                senderPublicKey,
                rawAmount,
                [],
                programId
            )
        )
        const signature = await wallet.sendTransaction(transaction, connection);
        return signature;
    }catch(e){
        console.error('[SPL send error] ',e);
        throw new Error('An error occured while sending the token.');
    }
}