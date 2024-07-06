
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
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
        const { messageId , serverId ,channelId } = req.query;
        // console.log("works till here");
        const { content } =req.body;
        // console.log('\n\n\n\n\n\n\n\n\n\n\n\nReceived content:', content);
        
        // error was i had imported currentProfile() instead of currentProfilePages()
        // which is needed for this 'pages' method of folder arrangement for socket.io

        if(!profile){
            return res.status(401).json({error:"Unauthorized"});
        }
        if(!serverId){
            return res.status(400).json({error:"Server ID Missing"});
        }
        if(!channelId){
            return res.status(400).json({error:"Channel ID Missing"});
        }

        const server = await db.server.findFirst({
            where:{
                id: serverId as string,
                members:{
                    some:{
                        profileId:profile.id,
                    }
                }
            },
            include:{
                members:true,
            }
        })

        if(!server){
            return res.status(404).json({error:"Server not Found!"});
        }

        const channel = await db.channel.findFirst({
            where:{
                id:channelId as string,
                serverId: serverId as string,
            },
        });

        if(!channel){
            return res.status(404).json({error:"Channel not Found!"});
        }

        const member = server.members.find( (member) => member.profileId === profile.id);

        if(!member){
            return res.status(404).json({error:"Member not Found"});
        }

        let message = await db.message.findFirst({
            where:{
                id: messageId as string,
                channelId: channelId as string,
            },
            include:{
                member:{
                    include:{
                        profile:true,
                    }
                }
            }
        });

        if(!message || message.delete){
            return res.status(404).json({error:"Message not Found!"});
        }

        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isModerator || isAdmin || isMessageOwner;

        if(!canModify){
            return res.status(401).json({error:"Unauthorized"});
        }

        if( req.method === "DELETE"){
            message = await db.message.update({
                where:{
                    id:messageId as string,
                },
                data:{
                    fileUrl:null,
                    content: "this message has been deleted",
                    // placing this as content is equivalent to deleting 
                    delete:true,
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
            message = await db.message.update({
                where:{
                    id:messageId as string,
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

        const updateKey = `chat:${channelId}:messages:update`;

        res?.socket?.server?.io?.emit(updateKey,message);

        return res.status(200).json(message);
    }
    catch(err){
        console.log("[MESSAGE_ID]",err);
        return res.status(500).json({error:"Internal Error"});
    }
}