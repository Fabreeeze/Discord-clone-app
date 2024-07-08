import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { DirectMessage, Message } from "@prisma/client";
import { db } from "@/lib/prisma";



const MESSAGES_BATCH = 10;
// no. of messages loaded/fetched at a time

export async function GET(
    req: Request
) {
    try{
        const profile = await currentProfile();
        const {searchParams} = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const conversationId = searchParams.get("conversationId");
        
        if( !profile ){
            return new NextResponse("Unauthorized", { status: 401});
        }
        if( !conversationId ){
            return new NextResponse("Conversation Id missing", { status: 400});
        }

        let messages : DirectMessage[] = [];

        if( cursor ){   
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                // skip 1 so as to not receive same message again and again
                cursor:{
                    id: cursor,

                },
                where:{
                    conversationId,
                },
                include:{
                    member:{
                        include:{
                            profile:true,
                        },
                    },
                },
                // we include profile so as to render details of message like sender,  receiver etc 
                orderBy:{
                    createdAt:"desc",
                }    
            });
        }
        else{
            messages = await db.directMessage.findMany({
                take:MESSAGES_BATCH,
                where:{
                    conversationId,
                },
                include:{
                    member:{
                        include:{
                            profile:true,
                        }
                    }
                },
                orderBy:{
                    createdAt:"desc",
                }
            });
        }

        let nextCursor = null; 
        if( messages.length === MESSAGES_BATCH ){
            nextCursor = messages[MESSAGES_BATCH-1].id;
        }
        // for else nextCursor remains null, meaning that
        // all messages are fetched as current fetched messages are
        // less than specified MESSAGE_BATCH size

        return NextResponse.json({
            items: messages,
            nextCursor
        });
    }
    catch(err){
        console.log("[DIRECT_MESSAGE]",err);
        return new NextResponse("Internal Error" , {status:500});
    }
}