import { auth } from "@clerk/nextjs";


import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function
//this above line is default writte in from uploadthing site

const handleAuth = () => {
    const {userId} = auth();
    if( !userId )
        throw new Error('Unauthorized!');
    return {userId: userId};

}
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  
    serverImage: f( { image: { maxFileSize:"4MB" , maxFileCount:1}})
        .middleware( () => handleAuth())
        .onUploadComplete( () => {}) , 
    messageFile: f(  ["image","pdf"])
            .middleware( () => handleAuth())
            .onUploadComplete( () => {}),
        // now for uploading attachments in messages

} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;