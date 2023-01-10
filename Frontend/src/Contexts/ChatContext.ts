import { createContext } from "react";

interface IMessage{
    sender: string;
    content: string;
    timestamp: string;
}

interface IRoom{
    messages: IMessage[];
    name: string;
    joinedusers: string[];
    lastmessage: IMessage;
}

export interface IChatData {
    rooms: IRoom[];
    messages: string[];



    test: string;






    // addMessage: (message: string) => void;
  }
  
  const defaultValue: IChatData = {
      rooms: [],
    messages: [],
    test: '',












    // addMessage: (message) => {
    //     console.log("addMessage function called");
    //   },
  };

export const ChatContext = createContext(defaultValue);