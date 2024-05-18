import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
    children,
    params,
}: {
    children:React.ReactNode;
    params: { serverId: string};
}) => {

    const profile = await currentProfile();

    if(!profile){
        return redirectToSignIn();
    }

    const server = await prisma?.server.findUnique({
        where:{
            id: params.serverId,
            // we use "serverId" here as the parent folder of this file is named [serverID]
            // if it was names [xyz] we would call params.xyz
            members:{
                some:{
                    profileId: profile.id
                }
            }

        }
    });

    if(!server)
        return redirect('/')

    return ( 
    <div className="h-full">
        <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
            <ServerSidebar serverId = {params.serverId}  />Server Channel Sidebar
        </div>
        <main className="h-full md:pl-60">
            {children}
        </main>
    </div> );
}
 
export default ServerIdLayout;