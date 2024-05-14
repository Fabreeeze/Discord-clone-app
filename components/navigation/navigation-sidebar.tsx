import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import {db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";

export const NavigationSidebar = async () => {
    //since sidebar is a component of the server, which takes time to load
    //we make it as async function

    const profile = await currentProfile();
    if( !profile ){
        return redirect("/");
    }
    const servers = await db.server.findMany({
        where:{
            members:{
                some:{
                    profileId:profile.id
                }
            }
        }
    });
    return (
        <div className="space-y-4 flex flex-col items-center
        h-full text-primary w-full dark:bg-[#1e1f22]
        py-3">
            < NavigationAction />
            <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700
            rounded-md w-10 mx-auto"></Separator>
            <ScrollArea className="flex-1 w-full">
                {servers.map( (server) => (
                    <div key={server.id} className="mb-4">
                        {/* {server.name} */}
                        <NavigationItem
                        id={server.id}
                        name={server.name}
                        imageUrl={server.imageUrl}>

                        </NavigationItem>
                    </div>
                ))
            }
            </ScrollArea>
        </div>
    )
}