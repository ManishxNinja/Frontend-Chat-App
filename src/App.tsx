import {
  useEffect,
  useRef,
  useState,
} from "react";

function App() {
  const [Group, setGroup] = useState(" ");
  const [message, setMessage] = useState(" ");
  const [typingTimeout, setTypingTimeout] = useState<null | number>(null);
  const [mess, setMess] = useState<null | string[]>(null);
  const ws = useRef<null | WebSocket>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.current.onmessage = (event) => {
      setMess((prevMess) => [...(prevMess || []), event.data]);
    };

    // Clean up WebSocket connection on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  function handleMessage(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }

  async function handleGroup(event: React.ChangeEvent<HTMLInputElement>) {
    setGroup(event.target.value);
    const groupName = event.target.value;

    // Clear previous timeout if it exists
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to send the message after 2 seconds
    const newTimeout = setTimeout(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "join",
            roomId: groupName,
          })
        );
        console.log("Group name sent to WebSocket:", groupName);
      } else {
        console.error("WebSocket is not open.");
      }
    }, 10000);

    setTypingTimeout(newTimeout);
  }

  async function handleClick() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat",
          roomId: Group,
          message: message,
        })
      );
      console.log("Message sent:", message);
      // Optionally, clear the input fields
      setMessage(" ");
    } else {
      console.error("WebSocket is not open.");
    }
  }

  return (
    <div className="bg-slate-800 h-[100vh] flex items-center justify-center">
      <div className="bg-black flex flex-col min-w-[450px] max-w-[450px] min-h-[600px] max-h-[600px] rounded-xl">
        <div className="flex flex-1 flex-col mt-2 mr-1 mb-1 overflow-y-scroll">
          {mess && mess.map((event, index) => (
            <div key={index} className="flex items-center justify-start w-full">
              <div className="flex items-center gap-1 max-w-[80%] text-white m-1 ml-5">
                <p className="bg-slate-200 w-full rounded p-1 text-gray-800 break-words overflow-hidden">
                  {event}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 items-center mb-2">
          <input
            onChange={handleGroup}
            placeholder="Group"
            className={` ${
              Group == " " ? "border-2 border-red-500" : null
            } rounded ml-2 max-w-28 p-1`}
          ></input>
          <input
            value={message}
            onChange={handleMessage}
            placeholder="Message"
            className={`${
              message == " " ? "border-2 border-red-500" : null
            } rounded m-1 min-w-60 p-1`}
          ></input>
          <button
            onClick={handleClick}
            className={` ${
              message == " " || Group == " " ? "bg-slate-500" : null
            } cursor-pointer  bg-yellow-300 rounded px-4 py-1 max-h-10`}
            disabled={message == " " || Group == " "}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
