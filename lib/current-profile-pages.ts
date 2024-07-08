import { NextApiRequest } from "next";
import { getAuth } from "@clerk/nextjs/server";

import { db } from "@/lib/prisma";

// we modify this auth from auth to getAuth anduse req as NextApiRequest 
// coz it wont work in pages folder and foles for 
// socket.io in messages functionalty
export const currentProfilePages = async( req: NextApiRequest) => {
    const {userId} = getAuth(req);

    if( !userId ){
        return null;
    }

    const profile =  await db.profile.findUnique({
        where: {
            userId
        }
    });
    return profile;
}