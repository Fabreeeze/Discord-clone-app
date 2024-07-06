import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
    addKey: string;
    updateKey:string;
    queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

export const useChatSocket = ({
    addKey,
    updateKey,
    queryKey,
}: ChatSocketProps) => {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    useEffect( () => {
        if( !socket ){
            return;
        }
        // console.log("\n\n\n\n\n\n addkey=",addKey,"\nupdateKey= ",updateKey,"\nqueryKey=",queryKey,"\nsocket=",socket
        //     ,"\nqueryClient=",queryClient
        // )

        // now we create a socket method to delete or update message in real time
        socket.on(updateKey, (message:MessageWithMemberWithProfile) => {
            queryClient.setQueryData<MessageWithMemberWithProfile[]>([queryKey], (oldData: any) => {
                if( !oldData || !oldData.pages ||oldData.pages.length === 0 ){
                    return oldData;
                    // ie if oldData(data to be modified/deleted) is already emmpty
                    // we dont have to perform any functions , just return empty back
                }

                
                const newData = oldData.pages.map( (page:any) => {
                    return {
                        ...page,
                        items: page.items.map( (item: MessageWithMemberWithProfile) => {
                            if( item.id === message.id){
                                return message;
                                // when both ids are equal means this is the item(message in database)
                                // that we need to edit or delete( we delete by kinda editing only here in our clone app)
                                // so both methods(edit and delete ) tend to be same
                            }
                            return item;
                            // else if not equal we just let the old value be returned
                        }),
                    };
                });

                return {
                    ...oldData,
                    pages: newData,
                };
            });
        });
        // this above socket was for edit/delete

        // this below socket is for adding new messsages in chat
        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData<MessageWithMemberWithProfile[]>([queryKey] , (oldData:any) => {
                if( !oldData || !oldData.pages ||oldData.pages.length === 0 ){
                    return {
                        pages:[
                            {
                            items: [message],
                            nextCursor:null,
                            },
                        ],
                    };  
                    // if oldData( messages ) is empty, just render the new
                    // entered message into the page as a new message array
                }

                const newData = [...oldData.pages];
                
                newData[0] = {
                    ...newData[0],
                    items:[
                        message,
                        ...newData[0].items,
                    ],
                }
                // const newData = oldData.pages.map((page: any) => ({
                //     ...page,
                //     items: [message, ...page.items],
                // }));
                // aappend new message to end of old data

                return {
                    ...oldData,
                    pages: newData,
                }
            })
        })


        return () => {
            socket.off(addKey);
            socket.off(updateKey);
        }

    },[queryClient, addKey, queryKey, socket, updateKey] 
    // we add the necessary variables to dependency array    
    )
}