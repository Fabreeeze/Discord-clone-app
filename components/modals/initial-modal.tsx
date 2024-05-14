"use client";

import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios from "axios";

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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";


import { FileUpload } from "../file-upload";
import { Router } from "express";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1,{
            message:"Please add a server name."
        }
    ),
    imageUrl: z.string().min(1, {
        message: "Please add a serverpic."
    })
});

export const InitialModal = () => {

    const [isMounted, setIsMounted ] = useState(false);

    const router = useRouter();

    useEffect( () => {
        setIsMounted(true);
    }, [])
    // to solve hydration errors ^^


    const form  = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name:"",
            imageUrl:"",
        }
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmitt = async( values: z.infer<typeof formSchema>) => {
        // console.log("submitted vals =",values);

        try{
            await axios.post("/api/servers",values);

            form.reset();

            router.refresh();

            window.location.reload();
        }
        catch (err){
            console.log(err);
        }
    }


    if( !isMounted)
        return null;
    // for hydration error^

    return (
        <Dialog open={true}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Customise Server
                    </DialogTitle>
                    <DialogDescription>
                        Giver your server a personality with a name and image.
                        You can always change it later
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitt)} 
                    className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField control={form.control} name="imageUrl" 
                                render={ ( { field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload 
                                                endpoint = "serverImage"
                                                //server image is in core.ts file in app/api
                                                onChange = {field.onChange}
                                                value = {field.value}
                                            />  
                                        </FormControl>
                                    </FormItem>
                                )}

                                />
                            </div>
                            
                            <FormField 
                            control={form.control}
                            name="name"
                            render = { ( { field }) => (
                                <FormItem>
                                    <FormLabel
                                    className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                        Server Name   
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading}
                                        className="bg-zinc-300/50 border-0
                                        focus-visible:ring-0 text-black
                                        focus-visible:ring-offset-0"
                                        placeholder="Enter Server Name"
                                        {...field}>
                                        </Input>
                                    </FormControl>
                                    <FormMessage></FormMessage>
                                </FormItem>
                            )}>

                            </FormField>
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">

                            <Button variant="primary" disabled={isLoading} >
                                Create Server
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

        </Dialog>
    );
}