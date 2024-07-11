// // 
// "use client";

// // Importing necessary libraries and components
// import { useRef, useState, useCallback } from "react";
// import { InputMessage } from "./input-message";
// import { scrollToBottom, initialMessage } from "@/lib/utils";
// import { ChatLine } from "./chat-line";
// import { ChatGPTMessage } from "@/types";

// // Function to update messages state
// const updateMessages = (message: ChatGPTMessage, setMessages: Function, containerRef: React.RefObject<HTMLDivElement>) => {
//   setMessages((previousMessages: ChatGPTMessage[]) => [...previousMessages, message]);
//   setTimeout(() => scrollToBottom(containerRef), 100);
// };

// const updateChatHistory = (question: string, answer: string, setChatHistory: Function) => {
//   setChatHistory((previousHistory: [string, string][]) => [
//     ...previousHistory,
//     [question, answer],
//   ]);
// };

// const updateStreamingAIContent = (streamingAIContent: string, setStreamingAIContent: Function, containerRef: React.RefObject<HTMLDivElement>) => {
//   setStreamingAIContent(streamingAIContent);
//   setTimeout(() => scrollToBottom(containerRef), 100);
// };

// // Main Chat component
// export function Chat() {
//   // Defining necessary states and variables
//   const endpoint = "/api/chat";
//   const [input, setInput] = useState("");
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessage);
//   const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
//   const [streamingAIContent, setStreamingAIContent] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Function to handle end of stream
//   const handleStreamEnd = useCallback(
//     (question: string, streamingAIContent: string, sourceDocuments: string) => {
//       const sources = JSON.parse(sourceDocuments);

//       // Add the streamed message as the AI response
//       // And clear the streamingAIContent state
//       updateMessages(
//         {
//           role: "assistant",
//           content: streamingAIContent,
//           sources,
//         },
//         setMessages,
//         containerRef
//       );
//       updateStreamingAIContent("", setStreamingAIContent, containerRef);
//       updateChatHistory(question, streamingAIContent, setChatHistory);
//     },
//     []
//   );

//   // Function to send message to API /api/chat endpoint
//   // Function to send user's question to the API and handle the response
//   const sendQuestion = useCallback(
//     async (question: string) => {
//       // Set loading state to true
//       setIsLoading(true);
//       // Update messages state with user's question
//       updateMessages({ role: "user", content: question }, setMessages, containerRef);

//       try {
//         // Make a POST request to the API with the question and chat history
//         const response = await fetch(endpoint, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             question,
//             chatHistory,
//           }),
//         });

//         // Get the reader from the response stream
//         const reader = response?.body?.getReader();
//         let streamingAIContent = "";
//         let tokensEnded = false;
//         let sourceDocuments = "";

//         // Read the response stream until it ends
//         while (true) {
//           const { done, value } = (await reader?.read()) || {};

//           // Break the loop if the stream has ended
//           if (done) {
//             break;
//           }

//           // Decode the stream value to text
//           const text = new TextDecoder().decode(value);
//           // Check if the tokens have ended
//           if (text === "tokens-ended" && !tokensEnded) {
//             tokensEnded = true;
//           } else if (tokensEnded) {
//             // If tokens have ended, the remaining text is source documents
//             sourceDocuments = text;
//           } else {
//             // If tokens have not ended, the text is part of the AI's response
//             streamingAIContent = streamingAIContent + text;
//             // Update the streaming AI content state
//             updateStreamingAIContent(streamingAIContent, setStreamingAIContent, containerRef);
//           }
//         }

//         // Handle the end of the stream
//         handleStreamEnd(question, streamingAIContent, sourceDocuments);
//       } catch (error) {
//         // Log any error that occurs during the process
//         console.log("Error occurred ", error);
//       } finally {
//         // Set loading state to false after the process ends
//         setIsLoading(false);
//       }
//     },
//     [chatHistory, handleStreamEnd]
//   );

//   // Setting placeholder text
//   let placeholder = "Type a message to start ...";

//   if (messages.length > 2) {
//     placeholder = "Type to continue your conversation";
//   }

//   // Rendering the chat component
//   return (
//     <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
//       <div className="p-6 overflow-auto" ref={containerRef}>
//         {messages.map(({ content, role, sources }, index) => (
//           <ChatLine
//             key={index}
//             role={role}
//             content={content}
//             sources={sources}
//           />
//         ))}
//         {streamingAIContent ? (
//           <ChatLine role={"assistant"} content={streamingAIContent} />
//         ) : (
//           <></>
//         )}
//       </div>

//       <InputMessage
//         input={input}
//         setInput={setInput}
//         sendMessage={sendQuestion}
//         placeholder={placeholder}
//         isLoading={isLoading}
//         containerRef={containerRef}
//       />
//     </div>
//   );
// }

"use client";

// Importing necessary libraries and components
import { useRef, useState, useEffect } from "react";
import { InputMessage } from "./input-message";
import { scrollToBottom, initialMessage } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { ChatGPTMessage } from "@/types";

// Main Chat component
export function Chat() {
  // Defining necessary states and variables
  const endpoint = "/api/chat";
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessage);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [streamingAIContent, setStreamingAIContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to update messages state
  const updateMessages = (message: ChatGPTMessage) => {
    setMessages((previousMessages) => [...previousMessages, message]);
  };

  // Function to update chat history state
  const updateChatHistory = (question: string, answer: string) => {
    setChatHistory((previousHistory) => [
      ...previousHistory,
      [question, answer],
    ]);
  };

  // Function to update streaming AI content state
  const updateStreamingAIContent = (streamingAIContent: string) => {
    setStreamingAIContent(streamingAIContent);
  };

  // Function to handle end of stream
  const handleStreamEnd = (
    question: string,
    streamingAIContent: string,
    sourceDocuments: string
  ) => {
    const sources = JSON.parse(sourceDocuments);

    // Add the streamed message as the AI response
    // And clear the streamingAIContent state
    updateMessages({
      role: "assistant",
      content: streamingAIContent,
      sources,
    });
    updateStreamingAIContent("");
    updateChatHistory(question, streamingAIContent);
  };

  // Function to send message to API /api/chat endpoint
  const sendQuestion = async (question: string) => {
    // Set loading state to true
    setIsLoading(true);
    // Update messages state with user's question
    updateMessages({ role: "user", content: question });

    try {
      // Make a POST request to the API with the question and chat history
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          chatHistory,
        }),
      });

      // Get the reader from the response stream
      const reader = response?.body?.getReader();
      let streamingAIContent = "";
      let tokensEnded = false;
      let sourceDocuments = "";

      // Read the response stream until it ends
      while (true) {
        const { done, value } = (await reader?.read()) || {};

        // Break the loop if the stream has ended
        if (done) {
          break;
        }

        // Decode the stream value to text
        const text = new TextDecoder().decode(value);
        // Check if the tokens have ended
        if (text === "tokens-ended" && !tokensEnded) {
          tokensEnded = true;
        } else if (tokensEnded) {
          // If tokens have ended, the remaining text is source documents
          sourceDocuments = text;
        } else {
          // If tokens have not ended, the text is part of the AI's response
          streamingAIContent = streamingAIContent + text;
          // Update the streaming AI content state
          updateStreamingAIContent(streamingAIContent);
        }
      }

      // Handle the end of the stream
      handleStreamEnd(question, streamingAIContent, sourceDocuments);
    } catch (error) {
      // Log any error that occurs during the process
      console.log("Error occurred", error);
    } finally {
      // Set loading state to false after the process ends
      setIsLoading(false);
    }
  };

  // Setting placeholder text
  let placeholder = "Type a message to start ...";

  if (messages.length > 2) {
    placeholder = "Type to continue your conversation";
  }

  // Use useEffect for scrolling to the bottom
  useEffect(() => {
    scrollToBottom(containerRef);
  }, [messages, streamingAIContent]);

  // Rendering the chat component
  return (
        <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
          <div className="p-6 overflow-auto" ref={containerRef}>
            {messages.map(({ content, role, sources }, index) => (
              <ChatLine
                key={index}
                role={role}
                content={content}
                sources={sources}
              />
            ))}
            {streamingAIContent ? (
              <ChatLine role={"assistant"} content={streamingAIContent} />
            ) : (
              <></>
            )}
          </div>
    
          <InputMessage
            input={input}
            setInput={setInput}
            sendMessage={sendQuestion}
            placeholder={placeholder}
            isLoading={isLoading}
            containerRef={containerRef}
          />
        </div>
      );
}
