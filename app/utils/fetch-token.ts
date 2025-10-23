import { Connection,PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getTokenMetadata } from '@solana/spl-token';

const connection=new Connection('https://solana-devnet.g.alchemy.com/v2/a8DcczcXqLc4JZ1GHX3hQ')

export async function getAllTokensForWallet(publicKey : PublicKey){
    
    const splTokens=await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {programId:TOKEN_PROGRAM_ID}
    );

    const token22Accounts=await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {programId:TOKEN_2022_PROGRAM_ID}
    );

    const allTokens : {
        mint : string,
        balance : {},
        decimals : {},
        programType : string,
        name : string,
        symbol : string,
        image : string | undefined,
        uri : string | null
    }[]=[];

    // Process SPL Tokens (older style - no metadata extensions)
    for (const tokenAccount of splTokens.value){
        const data=tokenAccount.account.data.parsed.info;
        allTokens.push({
            mint : data.mint,
            balance : data.tokenAmount.uiAmount,
            decimals : data.tokenAmount.decimals,
            programType : 'SPL Token',
            name : 'Unknown Token',
            symbol : 'UNKNOWN',
            image : '/image.png',
            uri : null 
        })
    }

    // Process Token-22 (check for metadata extension)
    for(const tokenAccount of token22Accounts.value){
        const data =tokenAccount.account.data.parsed.info;
        const mintAddress=new PublicKey(data.mint);
        let name = 'Unknown Token';
        let symbol = 'UNKNOWN';
        let image = null;
        let uri = null;

        try{
            const metadata=await getTokenMetadata(
                connection,
                mintAddress,
                'confirmed',
                TOKEN_2022_PROGRAM_ID
            );

            if(metadata){
                name = metadata.name || 'Unknown Token';
                symbol = metadata.symbol || 'UNKNOWN';
                uri = metadata.uri || null;

                if(metadata.uri){
                    try{
                        const response = await fetch(metadata.uri);
                        const jsonMetadata = await response.json();
                        image = jsonMetadata.image || null;
                    }catch(e){
                        console.warn(`Failed to fetch JSON metadata from URI: ${metadata.uri}`);
                    }
                }
            }
        }catch(e){ 
            console.warn(`Token-22 metadata not found for ${mintAddress.toBase58()}:`,e);
        }

        allTokens.push({
            mint : data.mint,
            balance : data.tokenAmount.uiAmount,
            decimals : data.tokenAmount.decimals,
            programType : 'Token-22',
            name,
            symbol,
            image,
            uri
        })
    }
    
    return allTokens;

}