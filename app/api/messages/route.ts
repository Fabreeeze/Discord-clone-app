import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { Message } from "@prisma/client";
import { db } from "@/lib/db";



const MESSAGES_BATCH = 10;
// no. of messages loaded/fetched at a time

export async function GET(
    req: Request
) {
    try{
        const profile = await currentProfile();
        const {searchParams} = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");
        
        if( !profile ){
            return new NextResponse("Unauthorized", { status: 401});
        }
        if( !channelId ){
            return new NextResponse("Channel Id missing", { status: 400});
        }

        let messages : Message[] = [];

        if( cursor ){   
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                // skip 1 so as to not receive same message again and again
                cursor:{
                    id: cursor,

                },
                where:{
                    channelId,
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
                    createdAt:"asc",
                }    
            });
        }
        else{
            messages = await db.message.findMany({
                take:MESSAGES_BATCH,
                where:{
                    channelId,
                },
                include:{
                    member:{
                        include:{
                            profile:true,
                        }
                    }
                },
                orderBy:{
                    createdAt:"asc",
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
        console.log(err);
        return new NextResponse("Internal Error" , {status:500});
    }
}