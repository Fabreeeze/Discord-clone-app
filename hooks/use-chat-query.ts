import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps{
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
}: ChatQueryProps) => {

    const {isConnected} = useSocket();

    // pageParam is kind of our cursor
    const fetchMessages = async({ pageParam = undefined  }) => {
        const url = qs.stringifyUrl({
            url:apiUrl,
            query:{
                cursor: pageParam,
                [paramKey] : paramValue,
            }, 
        }, {skipNull : true});

        const res = await fetch(url);
        return res.json();
    };
    
    
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: isConnected ? false : 1000,
    });
    // above line tells that do polling only if 
    // socket.io is not connected, and polling 
    // hapens at 1000ms interval
    
     return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
     };
};
