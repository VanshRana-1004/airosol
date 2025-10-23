import { create } from 'zustand';

export const useSendTokenHook=create<{
    sendTokenForm : boolean,
    setSendTokenForm : (val : boolean) => void
}>(set=>({
    sendTokenForm : false,
    setSendTokenForm : (val)=>{
        set({sendTokenForm : val})
    }
}))