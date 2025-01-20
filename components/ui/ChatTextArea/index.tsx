import React, { MutableRefObject, useState } from "react";
import { useConversationStore } from "@/store/conversation-store";
import { Message, MessageContent } from "@/types/message";

interface ConversationTextArea {
  onSubmit?: () => null; // for  passing on submit
  ref: MutableRefObject<HTMLTextAreaElement>; // For passing the reference
}

const ConversationTextArea: React.FC<ConversationTextArea> = ({
  onSubmit = () => console.log("submitting message..."),
  ref,
}) => {
  const { currentConversationId, addMessage } = useConversationStore();
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    onSubmit();

    const messageContent: MessageContent = {
      type: "text",
      content: input.trim(),
    };

    const newMessage: Message = {
      message_id: currentConversationId!,
      role: "user",
      contents: [messageContent],
      timestamp: new Date(),
    };

    addMessage(newMessage);
    setInput("");
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="select-none block w-full resize-none bg-inherit text-font border border-transparent ring-0 focus:ring-0
      focus:outline-none transition-shadow duration-300 focus:border-transparent
      ease-in-out overflow-y-auto px-3 pt-2 rounded-md 
      min-h-6"
        spellCheck
        rows={3}
        ref={ref}
      />
    </div>
  );
};

export default ConversationTextArea;
