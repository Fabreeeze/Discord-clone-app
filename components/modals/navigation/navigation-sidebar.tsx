import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import {db } from "@/lib/db";

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
    })
    return (
        <div className="space-y-4 flex flex-col items-center
        h-full text-primary w-full dark:bg-[#1e1f22]
        py-3">
            Navigation Sidebar
        </div>
    )
}