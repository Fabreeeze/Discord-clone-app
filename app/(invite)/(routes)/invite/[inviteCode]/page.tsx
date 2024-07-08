import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/prisma";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps{
    params:{
        inviteCode:string
    };
};




const InviteCodePage = async({
    params
}: InviteCodePageProps) => {

    const profile = await currentProfile();

    if(!profile){
        return redirectToSignIn();
    }

    if( !params.inviteCode){
        return redirect('/');
    }

    //to check if person using server invite code is already inside server
    const existingServer = await db.server.findFirst({
        where:{
            inviteCode:params.inviteCode,
            members:{
                some:{
                    profileId:profile.id,
                }
            }

        }
    });
     
    if( existingServer){
        return redirect(`/servers/${existingServer.id}`);
    }

    const server = await db.server.update({
        where:{
            inviteCode:params.inviteCode,
        },
        data:{
            members:{
                create:[
                    {
                        profileId:profile.id
                    }
                ]
            }
        }
    })

    //now redirect user to newly joined server on adding them to the server
    if( server ){
        return redirect(`/servers/${server.id}`);
    }

    return ( 
        // <div>
        //     Hello invite here

        // </div>
        null
     );
}
 
export default InviteCodePage;