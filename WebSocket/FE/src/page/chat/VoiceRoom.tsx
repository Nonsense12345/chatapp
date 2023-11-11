// import { useState } from "react";
interface VoiceRoomProps {
  UserName: string;
  Photo: string;
}

const VoiceRoom = ({ UserName, Photo }: VoiceRoomProps) => {
  // const [VoiceWebSocket, setVoiceWebSocket] = useState<WebSocket | null>(null);
  const readBlobAsBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8080/voicechat");
    ws.onopen = () => {
      console.log("Kết nối WebSocket đã mở.");

      startRecording(ws);
    };

    ws.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);
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
          console.log(base64audio);
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
      }, 1000);
    });
  };

  return (
    <div>
      <button
        onClick={() => {
          connectWebSocket();
        }}
      >
        Join Voice Chat Room
      </button>
    </div>
  );
};

export default VoiceRoom;
