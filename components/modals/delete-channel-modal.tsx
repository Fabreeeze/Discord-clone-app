"use client";

import qs from "query-string";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios, { Axios } from "axios";

import {Dialog, DialogContent, DialogDescription,DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";


import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";



export const DeleteChannelModal = () => {

    const {onOpen , isOpen , onClose, type,data}= useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type === "deleteChannel";
    const {server,channel} = data;

    const [isLoading, setIsLoading] = useState(false);

   
    const onClick = async () =>{
        try{
            setIsLoading(true);

            const url = qs.stringifyUrl({
                url:`/api/channels/${channel?.id}`,
                query:{
                    serverId: server?.id
                }
            })
            await axios.delete(url);

            onClose();
            router.refresh();
            router.push(`/server/${server?.id}`);
        }
        catch(err){
            console.log(err);
        }
        finally{
            setIsLoading(false);
        }
    }
   

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Channel!!
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500" >
                        Are you sure you want to permanently delete <span
                            className="font-semibold text-indigo-500">#{channel?.name}</span> ?
                    </DialogDescription >
                </DialogHeader>

                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className=" flex items-center justify-between w-full">
                        <Button 
                        disabled={isLoading}
                        onClick={onClose}
                        variant="ghost"
                         >
                            Cancel
                    
                        </Button>
                        
                        <Button 
                        disabled={isLoading}
                        onClick={onClick}
                        variant="primary">

                            Confirm
                        
                        </Button>

                    </div>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}