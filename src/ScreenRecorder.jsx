import React, { useRef, useState } from "react";

export default function ScreenRecorder() {
  const screenStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    try {
      // 1️⃣ Capture screen (with possible system audio)
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // system audio only if allowed
      });

      // 2️⃣ Capture microphone audio
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 3️⃣ Merge all audio tracks safely (NO ECHO, NO CORRUPTION)
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();

      // mic audio
      const micSource = audioContext.createMediaStreamSource(
        micStreamRef.current
      );
      micSource.connect(dest);

      // system audio (if available)
      if (screenStreamRef.current.getAudioTracks().length > 0) {
        const sysSource = audioContext.createMediaStreamSource(
          screenStreamRef.current
        );
        sysSource.connect(dest);
      }

      // 4️⃣ Final stream = screen video + merged audio
      const finalStream = new MediaStream([
        ...screenStreamRef.current.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      // 5️⃣ Start recorder
      mediaRecorderRef.current = new MediaRecorder(finalStream, {
        mimeType: "video/webm; codecs=vp9",
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) =>
        chunksRef.current.push(e.data);

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "screen-voice-recording.webm";
        a.click();
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();

    screenStreamRef.current.getTracks().forEach((t) => t.stop());
    micStreamRef.current.getTracks().forEach((t) => t.stop());
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-4">
      <h1 className="text-xl font-bold">Screen + Voice Recorder</h1>

      {!recording ? (
        <button
          onClick={startRecording}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow"
        >
          Stop Recording
        </button>
      )}
    </div>
  );
}

