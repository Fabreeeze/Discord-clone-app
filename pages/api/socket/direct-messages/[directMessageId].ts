
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/prisma";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { error } from "console";
import { NextApiRequest } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo,
) {

    // console.log("\n\n\n\n\n\nreq.method === ",req.method,"\n\n\n\n\n")
    if( req.method !== "DELETE" && req.method !== "PATCH"){
        return res.status(405).json({error: "Method not allowed"});
    }

    try{
        const profile = await currentProfilePages(req);
        const { directMessageId , conversationId } = req.query;
        // console.log("works till here");
        const { content } =req.body;
        // console.log('\n\n\n\n\n\n\n\n\n\n\n\nReceived content:', content);
        
        // error was i had imported currentProfile() instead of currentProfilePages()
        // which is needed for this 'pages' method of folder arrangement for socket.io

        if(!profile){
            return res.status(401).json({error:"Unauthorized"});
        }
        if(!conversationId){
            return res.status(400).json({error:"Conversation ID Missing"});
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
                    }
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
                        profile:true,
                    }
                }
            },
        });

        if( !conversation ){
            return res.status(404).json({message:"Conversation Not Found!"});
        }


        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        if(!member){
            return res.status(404).json({error:"Member not Found"});
        }

        let directMessage = await db.directMessage.findFirst({
            where:{
                id: directMessageId as string,
                conversationId: conversationId as string,
            },
            include:{
                member:{
                    include:{
                        profile:true,
                    }
                }
            }
        });

        if(!directMessage || directMessage.deleted){
            return res.status(404).json({error:"Message not Found!"});
            // again it should be 'deleted' in prisma schema of directMessage, but i have 
            // made a type and is not high on priority to be changed right now :/

            // edit : it has now been fixed to 'deleted'
        }

        const isMessageOwner = directMessage.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isModerator || isAdmin || isMessageOwner;

        if(!canModify){
            return res.status(401).json({error:"Unauthorized"});
        }

        if( req.method === "DELETE"){
            directMessage = await db.directMessage.update({
                where:{
                    id:directMessageId as string,
                },
                data:{
                    fileUrl:null,
                    content: "this message has been deleted",
                    // placing this as content is equivalent to deleting 
                    deleted:true,
                    // delete should actually be "deleted"
                    // but i have accidently typed it as delete in the
                    // prisma schema and now to correct it i would have 
                    // to re-push the prisma schema and i wont do it 
                    // unless it is necessary for me :|

                },
                include:{
                    member:{
                        include:{
                            profile:true,
                        }
                    }
                },
            });
        }

        if( req.method === "PATCH"){
            if( !isMessageOwner){
                return res.status(401).json({error:"Unauthorized"});
            }
            // only the message owner/sender can edit message :)
            directMessage = await db.directMessage.update({
                where:{
                    id:directMessageId as string,
                },
                data:{
                    content,
                    // content is the new edited message
                },
                include:{
                    member:{
                        include:{
                            profile:true,
                        }
                    }
                },
            });
        }

        const updateKey = `chat:${conversationId}:messages:update`;

        res?.socket?.server?.io?.emit(updateKey,directMessage);

        return res.status(200).json(directMessage);
    }
    catch(err){
        console.log("[MESSAGE_ID]",err);
        return res.status(500).json({error:"Internal Error"});
    }
}