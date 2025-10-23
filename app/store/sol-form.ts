import { create } from 'zustand';

export const useSendSolHook=create<{
    sendSolForm : boolean,
    setSendSolForm : (val : boolean) => void
}>(set=>({
    sendSolForm : false,
    setSendSolForm : (val)=>{
        set({sendSolForm : val})
    }
}))