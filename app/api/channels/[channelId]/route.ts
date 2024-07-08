import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function DELETE (
    req:Request,
    {params} : {params : { channelId : string }}
){
    try{
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");
        if( !profile ){
            return new NextResponse("Unauthorized" , { status:401} );
        }
        if( !serverId ){
            return new NextResponse("Server Id Missing" , {status: 400 });
        }
        if( !params.channelId ){
            return new NextResponse("Channel Id Missing" , {status:400});
        }

        const server = await db.server.update({
            where:{
                id:serverId,
                members:{
                    some:{
                        profileId: profile.id,
                        role:{
                            in:[ MemberRole.ADMIN, MemberRole.MODERATOR ],
                        }
                    }
                }
            },
            data:{
                channels:{
                    delete:{
                        id:params.channelId,
                        name:{
                            not:"general",
                        }
                    }
                }
            }
        });
        
        return NextResponse.json(server);
    }
    catch(err){
        console.log("[CHANNEL_ID_DELETE]",err);
        return new NextResponse("Internal Error ", {status: 500});
    }
}





export async function PATCH (
    req:Request,
    {params} : {params : { channelId : string }}
){
    try{
        const profile = await currentProfile();
        const { name , type } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");
        if( !profile ){
            return new NextResponse("Unauthorized" , { status:401} );
        }
        if( !serverId ){
            return new NextResponse("Server Id Missing" , {status: 400 });
        }
        if( !params.channelId ){
            return new NextResponse("Channel Id Missing" , {status:400});
        }
        if( name  === 'general' ){
            return new NextResponse("Name cannot be 'general' ", {status:400});
        }
        // edited name data should not be general, like we cant rename a channel as 'general'

        const server = await db.server.update({
            where:{
                id:serverId,
                members:{
                    some:{
                        profileId: profile.id,
                        role:{
                            in:[ MemberRole.ADMIN, MemberRole.MODERATOR ],
                        }
                        // here we specify which user can modify and in which server
                    }
                }
            },
            data:{
                channels:{
                    update:{
                        where:{
                            id:params.channelId,
                            NOT:{
                                name:"general" , 
                            }
                        },
                        // here we specify which channel to modify
                        data:{
                            name,
                            type,
                        }
                        // here we pass the edited data 
                    }
                }
            }
        });
        
        return NextResponse.json(server);
    }
    catch(err){
        console.log("[CHANNEL_ID_PATCH]",err);
        return new NextResponse("Internal Error ", {status: 500});
    }
}