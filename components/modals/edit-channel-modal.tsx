"use client";
import qs from "query-string";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios from "axios";

import {Dialog, DialogContent, DialogFooter,
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


import { Router } from "express";
import { useRouter, useParams } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ChannelType } from "@prisma/client";
import { SelectTriggerProps, SelectValueProps } from "@radix-ui/react-select";


const formSchema = z.object({
    name: z.string().min(1,{
            message:"Please add a channel name."
        }
    ).refine(
        name => name !== 'general',
        {
            message: "channel name cannot be 'general'."
        }
    ),
    type:  z.nativeEnum(ChannelType),
});

export const EditChannelModal = () => {

    const {isOpen , onClose, type ,data}= useModal();

    const router = useRouter(); 
    const params = useParams();
    const isModalOpen = isOpen && type === "editChannel";
    const { server, channel } = data;

    const form  = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name:"",
            type: channel?.type || ChannelType.TEXT,
        }
    })

    useEffect( () => {
        if( channel ){
            form.setValue("name" , channel.name );
            form.setValue("type" , channel.type );
        }
    },[form , channel ])

    const isLoading = form.formState.isSubmitting;

    const onSubmitt = async( values: z.infer<typeof formSchema>) => {
        // console.log("submitted vals =",values);

        try{
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query:{
                    serverId: server?.id
                }
            })
            console.log("Request URL:", url);

            await axios.patch(url,values);
            // we dont pass a hardcoded url but instead pass a stringified returned url from
            // above coz we need to specify and find the server where the channel is to be created
            // For creating channels we just passed a hardcoded url coz it is created in base storage(sort of) of a user's profile
            form.reset();

            router.refresh();

            onClose();

        }
        catch (err){
            console.log(err);
        }
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Edit Channel
                    </DialogTitle>
                    
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitt)} 
                    className="space-y-8">
                        <div className="space-y-8 px-6">          
                            
                            <FormField 
                            control={form.control}
                            name="name"
                            render = { ( { field }) => (
                                <FormItem>
                                    <FormLabel
                                    className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                        Channel Name   
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading}
                                        className="bg-zinc-300/50 border-0
                                        focus-visible:ring-0 text-black
                                        focus-visible:ring-offset-0"
                                        placeholder="Enter Channel Name"
                                        {...field}>
                                        </Input>
                                    </FormControl>
                                    <FormMessage></FormMessage>
                                </FormItem>
                            )}>

                            </FormField>

                            <FormField 
                            control = {form.control} name = "type"
                            render = {( { field}) => (
                                <FormItem>
                                    <FormLabel> Channel Type </FormLabel>
                                    <Select
                                        disabled = {isLoading}
                                        onValueChange = {field.onChange}
                                        defaultValue = {field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger
                                            className = "bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none"
                                        >   
                                        <SelectValue placeholder = "Select a channel type"/>
                                        
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ChannelType).map((type)=> (
                                            <SelectItem
                                                key={type}
                                                value={type}
                                                className="capitalize"
                                            >
                                                {type.toLowerCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                </FormItem>

                                )}
                            > 
                                 
                            </FormField>

                        </div>

                        <DialogFooter className="bg-gray-100 px-6 py-4">

                            <Button variant="primary" disabled={isLoading} >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

        </Dialog>
    );
}