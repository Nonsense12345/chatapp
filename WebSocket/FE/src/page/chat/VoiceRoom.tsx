import { useState } from "react";

interface VoiceRoomProps {
  UserName: string;
  Photo: string;
}
const VoiceRoom = ({ UserName, Photo }: VoiceRoomProps) => {
  const [VoiceWebSocket, setVoiceWebSocket] = useState<WebSocket | null>(null);
  const audioContext = new window.AudioContext();

  const connectAndRecord = () => {
    const ws = new WebSocket("ws://localhost:8080/voicechat");

    ws.onopen = () => {
      console.log("Kết nối WebSocket đã mở.");
      startRecording();
    };

    ws.onmessage = async function (event) {
     

      try {
        const data = JSON.parse(event.data);
        const audioData = atob(data.audioblob.split(",")[1]);
        const audioArray = new Uint8Array(audioData.length);

        for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
  }

        const audioBlob = new Blob([audioArray.buffer], { type: 'audio/ogg' });

        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
          audio.play();
      } catch (e) {
        console.error("Error parsing message data:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("Lỗi WebSocket: ", error);
    };

    ws.onclose = () => {
      console.log("Kết nối WebSocket đã đóng.");
    };

    setVoiceWebSocket(ws);
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (
          VoiceWebSocket &&
          event.data.size > 0 &&
          VoiceWebSocket.readyState === WebSocket.OPEN
        ) {
          let reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = () => {
            const base64audio = reader.result;
            VoiceWebSocket.send(
              JSON.stringify({
                username: UserName,
                photo: Photo,
                audioblob: base64audio,
              })          
         
          );
        }
      };
      mediaRecorder.start(100);
    });
  };

  return (
    <div>
      <button onClick={connectAndRecord}>Join Voice Chat Room</button>
    </div>
  );
};

export default VoiceRoom;
