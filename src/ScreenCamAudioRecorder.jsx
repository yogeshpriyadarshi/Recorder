import React, { useRef, useState } from "react";

export default function ScreenCamAudioRecorder() {
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const camStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);

  const waitForVideoReady = (video) =>
    new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

  const startPIPCanvas = (screenVideo, camVideo) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!recording) return;

      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

      const W = canvas.width * 0.22;
      const H = canvas.height * 0.22;

      ctx.drawImage(camVideo, canvas.width - W - 20, canvas.height - H - 20, W, H);

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  };

  const startRecording = async () => {
    try {
      // Camera (video + mic)
      camStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Screen (video only — audio disabled)
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Create hidden videos
      const screenVideo = document.createElement("video");
      screenVideo.srcObject = screenStreamRef.current;
      screenVideo.playsInline = true;
      screenVideo.muted = true;

      const camVideo = document.createElement("video");
      camVideo.srcObject = camStreamRef.current;
      camVideo.playsInline = true;
      camVideo.muted = true;

      // Wait until ready
      await waitForVideoReady(screenVideo);
      await waitForVideoReady(camVideo);

      await screenVideo.play();
      await camVideo.play();

      // Canvas setup
      const canvas = canvasRef.current;
      canvas.width = 1280;
      canvas.height = 720;

      setRecording(true);

      startPIPCanvas(screenVideo, camVideo);

      // Final video from canvas
      const canvasStream = canvas.captureStream(30);

      // MIC ONLY → Take microphone from camStream
      const micTrack = camStreamRef.current.getAudioTracks()[0];

      // Combined stream
      const finalStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        micTrack, // only mic audio
      ]);

      // MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(finalStream, {
        mimeType: "video/webm; codecs=vp8",
        videoBitsPerSecond: 5000000,
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.webm";
        a.click();
      };

      mediaRecorderRef.current.start(200);
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  const stopRecording = () => {
    setRecording(false);

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    [...camStreamRef.current.getTracks(), 
     ...screenStreamRef.current.getTracks()].forEach((t) => t.stop());
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-4">
      <h1 className="text-xl font-bold">Screen + Webcam + Mic Recorder</h1>

      <canvas ref={canvasRef} className="hidden" />

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
