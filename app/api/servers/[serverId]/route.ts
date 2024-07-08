import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/prisma";
import { Server } from "lucide-react";
import { NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function PATCH(
    req:Request,
    {params}: {params : {serverId : string}}
){
    try{
        const profile = await currentProfile();
        const { name, imageUrl} = await req.json();
        // we get the data to be updated from the incoming requst and parse it as a json

        if( !profile ){
            return new NextResponse("Unauthorised", {status:401});
        }

        const server = await db.server.update({
            where:{
                id:params.serverId,
                profileId: profile.id
                // we add profileid to ensure tht only admin can modify server 
            },
            data:{
                name:name,
                imageUrl:imageUrl
            }
        })

        return NextResponse.json(server);
    }
    catch (err){
        console.log("[SERVER_ID_PATCH]",err);
        return new NextResponse("Internal error", {status:500});
    }
}



// this file is for edit server/ server setting post function route






// this below code is for deleting a server 

export async function DELETE(
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
        console.log("jeered serevrid = ",params.serverId);
        const server = await db.server.delete({
            where:{
                id: params.serverId,
                profileId:profile.id,
            }
        });
        console.log("response = ",server);

        return NextResponse.json(server);
    }
    catch(err){
        console.log("[SERVER_ID_DELETE]",err);
        return new NextResponse("Internal Error 500", {status:500});
    }
}