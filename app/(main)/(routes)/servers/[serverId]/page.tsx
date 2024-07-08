import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/prisma";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";


interface ServerIdPageProps{
    params:{
        serverId: string;
    }
}

const ServerIdPage = async ({
    params
} : ServerIdPageProps) => {

    const profile = await currentProfile();
    
    if( !profile ){
        return redirectToSignIn();
    }

    const server = await db.server.findUnique({
        where:{
            id:params.serverId,
            members:{
                some:{
                    profileId:profile.id,
                }
            }
        },
        include:{
            channels:{
                where:{
                    name:"general",
                },
                orderBy:{
                    createdAt:"asc"
                }
            }
        }
    })

    const initialChannel = server?.channels[0];

    if( initialChannel?.name !== "general"){
        return null;
    }
    // console.log("server id = ",params.serverId);
    // console.log("channel id = ", initialChannel?.id);

    return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`);
    // this redirects to a servers general channel on clicking a server
    
}
 
export default ServerIdPage;