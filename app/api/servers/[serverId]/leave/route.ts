import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req:Request,
    {params}: {params: {serverId: string }}
){
    try{
        const profile = await currentProfile();
        if( !profile ){
            return new NextResponse("Unauthorized", {status:401});
        }
        if(!params.serverId){
            return new NextResponse("Server ID missing", {status:400});
        }

        const server = await db.server.update({
            where:{
                id:params.serverId,
                profileId:{
                    not: profile.id
                    // admin cannot leave server
                },
                members:{
                    some:{
                        profileId:profile.id,
                        // only members belonging to server 
                        // can actually put this leave server request
                    }
                }
            },
            data:{
                members:{
                    // data provided here means profile.id 
                    // is some members id and not admins
                    deleteMany:{
                        profileId:profile.id
                    }
                }
            }
        });

        return NextResponse.json(server);
    }
    catch(err){
        console.log("[SERVER_ID_LEAVE]",err);
        return new NextResponse("Internal Error", {status:500});
    }
}