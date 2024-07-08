import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    {params} : {params: { memberId: string}}
) {
    try{
        const profile = await currentProfile();
        const {searchParams} = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if( !profile ){
            return new NextResponse("Unauthorised" , {status:401});
        }
        if( !serverId ){
            return new NextResponse("Server Id Missing", {status:400});
        }
        if( !params.memberId ){
            return new NextResponse("Member Id Missing", {status:400});
        }

        const server = await db.server.update({
            where:{
                id: serverId,
                profileId : profile.id
            },
            data:{
                members:{
                    deleteMany:{
                        id: params.memberId,
                        profileId:{
                            not:profile.id
                        }
                    }
                }
            },
            include:{
                members:{
                    include:{
                        profile:true
                    },
                    orderBy:{
                        role: "asc"
                    }
                },
            },
        });

        return NextResponse.json(server);
    }
    catch(err){
        console.log("[MEMBERS_ID_DELETE]",err);
        return new NextResponse("Internal Server Error", {status:500});
    }
}


export async function PATCH(
    req:Request,
    {params} : {params : {memberId:string}}
) {
    try{
        const profile = await currentProfile();
        const {searchParams} = new URL(req.url);
        const {role} = await req.json();

        const serverId = searchParams.get("serverId");

        if(!profile){
            return new NextResponse("Unauthorized", {status:401});
        }

        if( !serverId ){
            return new NextResponse("ServerId Missing", {status:400});
        }

        if(!params.memberId){
            return new NextResponse("memeber id missing", {status:400});
        }

        const server = await db.server.update({
            where:{
                id:serverId,
                profileId:profile.id,
                // we add profile id to ensure only the current admin profile can modify this
            },
            //  now data to be modified/added new
            data:{
                members:{
                    update:{
                        where:{
                            id:params.memberId,
                            profileId:{
                                not:profile.id
                                // this check to ensure user dont change their own role
                                // this is basically that oly admin can chnage roles(specified above)
                                // and we dont want admin to change their own role, as a sever needs an admin
                            },
                        },
                        data:{
                            role
                        }
                        // updata the role (as the data provided to this function)
                    }
                }
            },

            // we also include the profiles of the members in the result response from the datavse 
            // server as we need it back on frontend side
            include:{
                members:{
                    include:{
                        profile:true, 

                    },
                    orderBy:{
                        role:"asc"
                    }
                }
            }
        })
    
        return NextResponse.json(server);
    }
    catch(err){
        console.log("[MEMBERS_ID_PATCH]",err);
        return new NextResponse("Internal Server Error", {status:500});
    }
}