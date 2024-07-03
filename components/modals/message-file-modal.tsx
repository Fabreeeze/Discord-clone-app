"use client";

import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios from "axios";
import qs from "query-string";

import {Dialog, DialogContent, DialogDescription,DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import {
    Form, 
    FormControl,
    FormField,
    FormItem,
    FormLabel,FormMessage
}
 from '@/components/ui/form';

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";


import { FileUpload } from "../file-upload";
import { Router } from "express";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
    
    fileUrl: z.string().min(1, {
        message: "Please add an Attachment!."
    })
});

export const MessageFileModal = () => {

    const { isOpen,onClose,type, data} = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type === "messageFile";

    const { apiUrl , query} = data;

    const form  = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            fileUrl:"",
        }
    })

    const handleClose = () => {
        form.reset();
        onClose();
    }

    const isLoading = form.formState.isSubmitting;

    const onSubmitt = async( values: z.infer<typeof formSchema>) => {
        // console.log("submitted vals =",values);

        try{

            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query,
            });

            await axios.post(url,{
                ...values,
                content:values.fileUrl,
            });

            form.reset();

            router.refresh();
            handleClose();
        }
        catch (err){
            console.log(err);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription>
                        Send a file as message!!!
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitt)} 
                    className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField control={form.control} name="fileUrl" 
                                render={ ( { field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload 
                                                endpoint = "messageFile"
                                                //server image is in core.ts file in app/api
                                                onChange = {field.onChange} 
                                                value = {field.value}
                                            />  
                                        </FormControl>
                                    </FormItem>
                                )}

                                />
                            </div>
                          
                        </div>


                        <DialogFooter className="bg-gray-100 px-6 py-4">

                            <Button variant="primary" disabled={isLoading} >
                                Send!
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

        </Dialog>
    );
}