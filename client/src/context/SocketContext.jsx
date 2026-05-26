import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);

  const { userInfo,addMessage, addChannelInChannelList, addContactsInDMList } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      console.log("userInfo:", userInfo);           // ← add here
      console.log("userInfo.id:", userInfo.id);     // ← add here
      console.log("userInfo._id:", userInfo._id);
      socket.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: userInfo.id,
        },
      });

      socket.current.on("connect", () => {
        console.log("Connected:", socket.current.id);
      });

      const handleRecieveMessage=(message)=>{
        const {selectedChatData, selectedChatType} = useAppStore.getState();
        addContactsInDMList(message); 
        if(selectedChatType!==undefined && (selectedChatData._id=== message.sender._id || selectedChatData._id === message.recipient._id)){
            console.log("message recieveg",message);
            addMessage(message);
            

        }

      }
      const handleRecieveChannelMessage = (message)=>{
        const { selectedChatData, selectedChatType, addMessage} = useAppStore.getState();
        addChannelInChannelList(message);
        if(selectedChatType!==undefined && selectedChatData._id === message.channelId){
          addMessage(message);
        }
      }


      socket.current.on("recieveMessage",handleRecieveMessage);
      socket.current.on("recieve-channel-message",handleRecieveChannelMessage);
      socket.current.on("disconnect", () => {
        console.log("Disconnected");
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};