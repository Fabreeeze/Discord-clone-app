"use client";

import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import axios, { Axios } from "axios";

import {Dialog, DialogContent, DialogDescription,DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuTrigger,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, Gavel, Loader2, MoreVertical, RefreshCw, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react" 
import { useState } from "react";
import { ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import { MemberRole } from "@prisma/client";



export const MembersModal = () => {

    const {onOpen , isOpen , onClose, type,data}= useModal();

    const [loadingId, setLoadingId] = useState("");
    // this is use to check and display if ids are loaded like in settings of member role   

    const isModalOpen = isOpen && type === "members";
    const {server} = data as {server: ServerWithMembersWithProfiles}
    // we do this data type redefining because we need to do server.members somewhere in below code  

    


    const roleIconMap = {
        "GUEST":null,
        "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500"/>,
        "ADMIN": <ShieldAlert className="h-4 w-4 text-rose-500"/>

    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black  overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                       Manage Members
                    </DialogTitle>
                    <DialogDescription
                        className="text-center text-zinc-500"
                    >
                        {server?.members?.length} Members
                    </DialogDescription>

                </DialogHeader>
                {/* <div className="p-6">
                    Hello members
                </div> */}
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {server?.members?.map( (member) => {
                        
                        return(
                            // learnt something new
                            // in js, in return statements the paranthesis or the returned statment 
                            //  should start in the same like as the return statment, else it considers it as a 
                            // undefined return type

                            // console.log("iiiii")
                            // console.log("server= ",server);
                            // console.log("member=",member);
                            // console.log("member.profile==== ", member.profile);
                        <div key={member.id} className="flex items-center  gap-x-2 mb-6">
                            <UserAvatar src={member.profile.imageUrl}/>
                            <div className="flex flex-col gap-y-1">
                                <div className="text-xs font-semibold flex items-center gap-x-1">
                                    {member.profile.name}
                                    {roleIconMap[member.role]}
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {member.profile.email}
                                </p>
                                
                            </div>    
                            {server.profileId !== member.profileId && loadingId !== member.id && (
                                // we do this not equal coz we need to modify members other than us 
                                <div className="ml-auto">
                                    <DropdownMenu >
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="h-4 w-4 text-zinc-500"></MoreVertical>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="left">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="flex items-center">
                                                    <ShieldQuestion className="h-4 w-4 mr-2"></ShieldQuestion>
                                                    <span>Role</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem >
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Guest
                                                            {member.role === "GUEST" && (
                                                                <Check className="h-4 w-4 ml-auto"/>
                                                                // display a tick if member already guest
                                                            )}
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem >
                                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                                            Moderator
                                                            {member.role === "Moderator" && (
                                                                <Check className="h-4 w-4 ml-auto"/>
                                                                // display a tick if member already guest
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem>
                                                <Gavel className="h-4 w-4 mr-2"></Gavel>
                                                Kick
                                            </DropdownMenuItem>

                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                            )}
                            {   loadingId === member.id && (
                                    <Loader2 className="animate-spin h-4 w-4 ml-auto text-zinc-500" />
                                )
                            }
                        </div>
                        )
                    }
                    )}
                </ScrollArea>

            </DialogContent>

        </Dialog>
    );
}