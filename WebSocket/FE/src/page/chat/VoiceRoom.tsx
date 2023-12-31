import { useState, useRef } from "react";
import { toast } from "react-toastify";
interface VoiceRoomProps {
  UserName: string;
  Photo: string;
}
interface User {
  username: string;
  photo: string;
}
const VoiceRoom = ({ UserName, Photo }: VoiceRoomProps) => {
  const [open, setOpen] = useState(false);
  const userRef = useRef<User[]>([]);
  const [user, SetUser] = useState<User[]>([]);
  const VoiceWebSocket = useRef<WebSocket>(
    new WebSocket("wss://chat.catim.pp.ua/voicechat")
  );

  const togglePopup = () => {
    // const [isClose, setIsClose] = useState(false);
    setOpen(!open);
  };
  const closePopup = () => {
    setOpen(false);
  };

  const readBlobAsBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  const connectWebSocket = () => {
    const ws = VoiceWebSocket.current;
    if (ws.OPEN) {
      console.log("SIUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
    }
    ws.onopen = () => {
      console.log("Kết nối WebSocket đã mở.");

      startRecording(ws);
    };
    ws.onclose = () => {
      toast.warn("Closed Voicechat !");
    };
    ws.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);

        if (!userRef.current?.some((item) => item.username == data.username)) {
          const newUser = {
            username: data.username,
            photo: data.photo,
          };

          userRef.current = [...userRef.current, newUser];
          SetUser(userRef.current);
          console.log(userRef.current);
        }

        const audioBlob = new Blob(
          [
            new Uint8Array(
              atob(data.audioblob.split(",")[1])
                .split("")
                .map((c) => c.charCodeAt(0))
            ),
          ],
          { type: "audio/webm; codecs=opus" }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (e) {
        console.error("Error playing audio:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("Lỗi WebSocket: ", error);
    };

    ws.onclose = () => {
      console.log("Kết nối WebSocket đã đóng.");
    };
  };

  const startRecording = (ws: WebSocket) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket không mở.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      let audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/webm;codecs=opus",
        });
        try {
          const base64audio = await readBlobAsBase64(audioBlob);
          ws.send(
            JSON.stringify({
              username: UserName,
              photo: Photo,
              audioblob: base64audio,
            })
          );
          //  console.log(base64audio);
        } catch (error) {
          console.error("Error reading blob as base64:", error);
        }
        audioChunks = [];
      };

      setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        } else {
          mediaRecorder.start();
        }
      }, 3000);
    });
  };
  const handleCloseWs = () => {
    VoiceWebSocket.current.close();
    closePopup();
  };
  return (
    <div className="mt-[10px] text-[1.2em]">
      <div
        onClick={() => {
          connectWebSocket();
          togglePopup();
        }}
      >
        Join Voice Chat
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-screen w-full z-50"
          id="popupContainer"
        >
          <div className="relative top-20 mx-auto p-5 border  shadow-lg rounded-md bg-white w-4/5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Voice Room</h3>
            </div>

            <div className="mt-2">
              <p className="text-gray-700">User</p>
              <ul>
                {user.map((item) => (
                  <div key={item.username} className="flex items-center mt-2">
                    <img
                      src={item.photo}
                      alt="User"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>
                      <h2 className="text-gray-700">{item.username}</h2>
                    </span>
                    {user[user.length - 1].username == item.username && (
                      <div
                        className={`w-3 h-3 bg-green-500 rounded-full ml-2 animate-pulse`}
                      />
                    )}
                  </div>
                ))}
              </ul>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:opacity-80"
                onClick={() => handleCloseWs()}
              >
                Stop VoiceChat
              </button>
              <button
                onClick={closePopup}
                className="px-4 py-2 ml-2 bg-gray-300 text-black rounded hover:bg-gray-500 close-popup"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRoom;
