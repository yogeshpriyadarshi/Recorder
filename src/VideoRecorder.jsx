import React, { useEffect, useRef, useState } from "react";

export default function VideoRecorder() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState("");

  // Initialize camera
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  useEffect(() => {
    initCamera();

    return () => {
      // Cleanup on unmount
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Start recording
  const startRecording = () => {
    const stream = streamRef.current;
    const recorder = new MediaRecorder(stream);

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedVideoURL(url);
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    recorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="p-4 space-y-3">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-64 rounded shadow"
      />

      <div className="space-x-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop Recording
          </button>
        )}
      </div>

      {/* Show recorded video */}
      {recordedVideoURL && (
        <div>
          <h3 className="font-semibold">Recorded Video:</h3>
          <video src={recordedVideoURL} controls className="w-64 mt-2" />

          <a
            href={recordedVideoURL}
            download="video.webm"
            className="block mt-2 text-blue-600 underline"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}
