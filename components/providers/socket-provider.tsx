"use client";

import React , {
    
    createContext, 
    useContext,
    useEffect,
    useState
} from "react";

import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
    socket : any | null;
    isConnected : boolean;
}

//  default value of context instance is an object of values socket=null and isconnected false
const SocketContext = createContext<SocketContextType>({
    socket:null,
    isConnected:false,
});

// exporting a hook
 export const useSocket = () => {
    return useContext(SocketContext);
 };


 export const SocketProvider = ({
     children,
    } : { children : React.ReactNode}
) => {
        const [socket, setSocket] = useState<any | null>(null);
        const [isConnected, setIsConnected] = useState<boolean>(false);

        useEffect( () => {
            const socketInstance  = new (ClientIO as any)(process.env.NEXT_PUBLIC_SITE_URL!, {
                path:"/api/socket/io",
                addTrailingSlash : false,
            });
            // this next public site url is localhost by default in developement, so we dont pass any address rn, we pass when we deploy
        
            socketInstance.on("connect" , () => {
                setIsConnected(true);
            });

            socketInstance.on("disconnect" , ()=>{
                setIsConnected(false);
            })

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            }


        },[]);

        return (

            <SocketContext.Provider value={{socket , isConnected }} >
                {children}
            </SocketContext.Provider>
        );
    }