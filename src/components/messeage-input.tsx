import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSign, PlusCircle, Smile, Sticker } from "lucide-react";
import { useState } from "react";

export default function MessageInput({ onSend }: { onSend: (message: string) => void }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div className="px-4 pb-6">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#b5bac1]"
        >
          <PlusCircle className="w-5 h-5" />
        </Button>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message your friend..."
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSend()}
          className="pl-12 pr-32 py-8 bg-[#383a40] border-none text-[#dcddde] placeholder:text-[#96989d] rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-[#b5bac1]">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Sticker className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Smile className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AtSign className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
