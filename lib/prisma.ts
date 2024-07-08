import {PrismaClient} from "@prisma/client";

declare global{
    var prisma: PrismaClient | undefined ;
}

export const db = globalThis.prisma || new PrismaClient();

if( process.env.NODE_ENV !== "production"){
    globalThis.prisma = db
}

// what exactly this export and if block codes do are that globalThis isnt affected by hot reload
// so if we have just exported out new PrismaClient() on every save or Refres, we would have had so many open 
// connections, this code ensures new connection made only if there is no other connection available