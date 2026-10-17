import { EmojiClickData, PickerProps } from "emoji-picker-react";
import dynamic from "next/dynamic";
import { ChangeEvent, SubmitEvent, useState } from "react";
import { Send, ImageIcon, Smile } from "lucide-react";
const EmojiPicker = dynamic(
  () =>
    import("emoji-picker-react").then(
      (mod) => mod.default as React.FC<PickerProps>,
    ),
  {
    ssr: false,
  },
);

type Props = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: (e: SubmitEvent<HTMLFormElement>) => void;
};

export const ChatInput = ({ message, setMessage, onSendMessage }: Props) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading image:", file.name);
    }
  };
  return (
    <form
      onSubmit={onSendMessage}
      className="border-t border-t-gray-200 bg-white px-3 py-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 relative"
    >
      <label className="shrink-0 cursor-pointer p-2 hover:bg-gray-100 rounded-md">
        <ImageIcon className="w-5 h-5" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </label>

      <div className="sm:relative shrink-0">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          aria-label="Add emoji"
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <Smile className="w-5 h-5 text-gray-600" />
        </button>

        {showEmoji && (
          <div className="absolute bottom-full mb-2 left-2 right-2 z-50 sm:left-0 sm:right-auto sm:w-[350px]">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height="min(400px, 55vh)"
            />
          </div>
        )}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 min-w-0 px-4 py-2 text-sm border outline-none border-gray-200 rounded-full"
      />

      <button
        type="submit"
        className="shrink-0 bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded-full"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
