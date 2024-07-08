import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiResponseServerIo } from "@/types";
import { error } from "console";
import { NextApiRequest } from "next";
import { db } from "@/lib/prisma";


 export default async function handler (
    req: NextApiRequest,
    res: NextApiResponseServerIo,
) {
    if( req.method !== "POST"){
        return res.status(405).json({error:"Method not allowed" });
    }

    try{
        const profile = await currentProfilePages( req );
        const { content, fileUrl } = req.body;
        const { conversationId } =req.query;
        
        if( !profile ){
            return res.status(401).json({ error : "Unauthorised"});
        }
        
        if( !conversationId ){
            return res.status(401).json({ error : "Conversation ID missing"});
        }
        if( !content ){
            return res.status(401).json({ error : "Content Missing"});
        }

        
        const conversation = await db.conversation.findFirst({
            where:{
                id: conversationId as string,
                OR:[
                    {
                        memberOne:{
                            profileId: profile.id,
                        }
                    },
                    {
                        memberTwo:{
                            profileId:profile.id,
                        }
                    },
                ]
            },
            include:{
                memberOne:{
                    include:{
                        profile:true,
                    }
                },
                memberTwo:{
                    include:{
                        profile: true,
                    }
                },
            },
        });
        
        if(!conversation){
            return res.status(404).json({message:"Conversation Not Found"});
        }

        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        if( !member ){
            return res.status(404).json({message: "Member not found"});
        }

        const message = await db.directMessage.create({
            data:{
                content, 
                fileUrl,
                conversationId: conversationId as string,
                memberId: member.id,
            },
            include:{
                member:{
                    include:{
                        profile:true,
                    }
                }
            }
        });

        const channelKey = `chat:${conversationId}:messages`;
        // we do this to immediately emit a socket.io for all the active connections,
        // we do this by creating the above channelKey
        // we are gonna watch this channelKey later too when we create a hook to look for 
        // active messages
        res?.socket?.server?.io?.emit(channelKey , message);

        return res.status(200).json(message);

    }
    catch(err){
        console.log("[DIRECT_MESSAGES_POST]",err);
        return res.status(500).json({message : "Internal Error"});
    }
}

