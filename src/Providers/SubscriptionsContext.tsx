import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useEventBus } from "../Providers/EventBusContext";
import { 
    GET_NEWEST_MESSAGES_COMMAND,
    GET_NEWEST_MESSAGES_MANUAL_COMMAND,
    SUBSCRIBE_COMMAND, 
    SUBSCRIBE_COMMAND_RESULT_COMPONENT, 
    UNSUBSCRIBE_COMMAND, 
    UNSUBSCRIBE_COMMAND_RESULT} from "../Events";
import { SubscribeCommandResultDto } from "../Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { UnsubscribeCommandResultDto } from "../Dtos/SocketCommandResults/UnsubscribeCommandResultDto";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { Channel } from "../Domain/Channel";
import { getDataAsync, getItemFromStorage, setItemInStorage } from "../Utils";
import { CHANNELS, CURRENT_CHANNEL } from "../Constants";
import { GetUserSubscriptionsResult } from "../Dtos/GetUserSubscriptionsResult";
import { User } from "../Domain/User";
import config from "../Config";
import { useUser } from "./UserContext";
const getChannels=async(user:User):Promise<GetUserSubscriptionsResult>=>{
    var channels=await getDataAsync(`${config.baseHttpUrl}/get_subscriptions/${user.id}`);
    console.log(channels);
    return channels;
 };
interface SubscriptionContextType {
    subscribeToChannel: (channelName: string) => Promise<void>;
    unsubscribeFromChannel: (channel: Channel) => Promise<void>;
    currentChannel:Channel |null;
    channels: Channel[];
    openChannel:(channel:Channel)=>void;
    refreshChannels:()=>Promise<Channel[]>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const eventBus = useEventBus();
     const stableEventBus = useMemo(() => eventBus, []); 
    const {user}=useUser();
    const [channels,setChannels]=useState<Channel[]>(()=>{
            const storedChannels=getItemFromStorage<Channel[]>(CHANNELS);
            return storedChannels ?storedChannels: [];
        });
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
            const storedCurrentChannel = localStorage.getItem(CURRENT_CHANNEL);
            return storedCurrentChannel ? JSON.parse(storedCurrentChannel) : null;
          });

    useEffect(() => {
            if (channels.length === 1) {
                setCurrentChannel(prev => (prev?.id !== channels[0].id ? channels[0] : prev));  // ✅ Only update if necessary
            } else if (!channels.find(c => c.id === currentChannel?.id)) {
                setCurrentChannel(null);
            }
    }, [channels]); 
        
    useEffect(() => {
            let isMounted = true;  // ✅ Prevents unnecessary updates
        
            refreshChannels().then(() => {
                if (!isMounted) return; 
            });
        
            return () => { isMounted = false; };  // ✅ Cleanup function
    }); // ✅ Runs only when `user` changes
    useEffect(()=>{
            setItemInStorage(CHANNELS,channels);
            console.log(channels);
        },[channels]);
    
    useEffect(()=>{
            setItemInStorage(CURRENT_CHANNEL,currentChannel);
        },[currentChannel]);

    const refreshChannels = useCallback(async (): Promise<Channel[]> => {
            let previousChannels = channels; 
        
            try {
                const fetchedChannelsResult: GetUserSubscriptionsResult = await getChannels(user!);
                console.log("Stored Channels:", fetchedChannelsResult.subscriptions);
        
                if (!fetchedChannelsResult.subscriptions.length) {
                    return previousChannels; 
                }
        
                const updatedChannels = fetchedChannelsResult.subscriptions;
                setItemInStorage(CHANNELS, updatedChannels);
        
                setChannels(prev => {
                    if (prev.length === updatedChannels.length && prev.every((c, i) => c.id === updatedChannels[i].id)) {
                        return prev; 
                    }
                    return updatedChannels;
                });
        
                return updatedChannels;
            } catch (error) {
                console.error("❌ Error fetching channels:", error);
                setChannels(previousChannels);
                return previousChannels;
            }
        }, [user]);  
   
    const subscribeToChannel = async (channelName: string) => {
        try {
            console.log("Subscribing to:", channelName);
            const subscribeResult = await new Promise<SubscribeCommandResultDto>((resolve) => {
                const onSubscribeResult = (ev: CustomEvent) => {
                    console.log(`Subscription result: ${JSON.stringify(ev.detail)}`);
                    stableEventBus.unsubscribe(SUBSCRIBE_COMMAND_RESULT_COMPONENT, onSubscribeResult);
                    resolve(ev.detail as SubscribeCommandResultDto);
                };
                stableEventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_COMPONENT, onSubscribeResult);
                stableEventBus.publishCommand({ kind: SUBSCRIBE_COMMAND, topic: channelName } as SubscribeCommand);
            });

            processSubscribeResult(subscribeResult);
        } catch (error) {
            console.error("Subscription failed:", error);
        }
    };

    const processSubscribeResult = (subscribeResult: SubscribeCommandResultDto) => {
        if (subscribeResult.result !== "ok" && subscribeResult.result !== "already_subscribed") {
            console.error(`Could not subscribe to channel: ${subscribeResult.topic?.name}`);
            return;
        }

        if (subscribeResult.result === "already_subscribed") {
            console.log("Already subscribed to channel.");
            return;
        }

        const newChannel: Channel = {
            id: subscribeResult.topic!.id,
            name: subscribeResult.topic!.name,
        };

        if (!channels?.find((channel) => channel.id === newChannel.id)) {
            setChannels([...(channels ?? []), newChannel]); // ✅ Ensures we always spread an array
        }
    };

    const unsubscribeFromChannel = async (channel: Channel) => {
        try {
            console.log("Unsubscribing from:", channel.name);
            const unsubscribeResult = await new Promise<UnsubscribeCommandResultDto>((resolve) => {
                const onUnsubscribeResult = (ev: CustomEvent) => {
                    eventBus.unsubscribe(UNSUBSCRIBE_COMMAND_RESULT, onUnsubscribeResult);
                    resolve(ev.detail as UnsubscribeCommandResultDto);
                };
                eventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT, onUnsubscribeResult);
                eventBus.publishCommand({ kind: UNSUBSCRIBE_COMMAND, topic_id: Number(channel.id) } as UnsubscribeCommand);
            });

            processUnsubscribeResult(unsubscribeResult);
        } catch (error) {
            console.error("Unsubscription failed:", error);
        }
    };

    const processUnsubscribeResult = (unsubscribeResult: UnsubscribeCommandResultDto) => {
        if (unsubscribeResult.result === "not_joined") {
            console.warn("Cannot unsubscribe: not joined to the channel.");
            return;
        }

        if (unsubscribeResult.result !== "ok") {
            console.error("Could not unsubscribe from channel.");
            return;
        }
        setChannels((prev) => {
            if (unsubscribeResult.subscriptions.length === 0) {
                setCurrentChannel(null);
                return [];
            }

            if (currentChannel?.id === unsubscribeResult.topicId) {
                setCurrentChannel(unsubscribeResult.subscriptions[0]);
            }
            return unsubscribeResult.subscriptions;
        });
    };
    const openChannel=useCallback((channel:Channel) => {
        setCurrentChannel(channel);
        stableEventBus.publishEvent(GET_NEWEST_MESSAGES_MANUAL_COMMAND,{channelId:channel.id});
    },[]);

    return (
        <SubscriptionContext.Provider value={{
             subscribeToChannel,
              unsubscribeFromChannel ,
               currentChannel ,
               channels,
               openChannel,
                refreshChannels,
                }}>
            {children}
        </SubscriptionContext.Provider>
    );

};

export const useSubscriptions = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error("useSubscriptions must be used within a SubscriptionProvider");
    }
    return context;
};