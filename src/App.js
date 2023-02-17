import React from "react";
import * as proc from "face-api.js";
import { useState, useRef, useEffect } from "react";
// import useWindowDimensions from "./useWindowDimensions";

function App() {
  // const { width, height } = useWindowDimensions();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  const width = 640;
  const height = 480;
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        proc.nets.tinyFaceDetector.loadFromUri("/models"),
        proc.nets.faceLandmark68Net.loadFromUri("/models"),
        proc.nets.faceRecognitionNet.loadFromUri("/models"),
        proc.nets.faceExpressionNet.loadFromUri("/models"),
      ]).then(setModelsLoaded(true));
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: width })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = proc.createCanvasFromMedia(
          videoRef.current
        );
        const displaySize = {
          width: width,
          height: height,
        };

        proc.matchDimensions(canvasRef.current, displaySize);

        const detections = await proc
          .detectAllFaces(videoRef.current, new proc.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = proc.resizeResults(detections, displaySize);
        canvasRef &&
          canvasRef.current &&
          canvasRef.current.getContext("2d").clearRect(0, 0, width, height);
        canvasRef &&
          canvasRef.current &&
          proc.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef &&
          canvasRef.current &&
          proc.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef &&
          canvasRef.current &&
          proc.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 1);
  };

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  };

  return (
    <div className="flex h-screen w-auto items-center justify-center bg-neutral-800">
      <div className="bg-stone-900 rounded-xl">
        <div
          className="bg-stone-900 rounded-full"
          style={{ textAlign: "center", padding: "10px" }}
        >
          {captureVideo && modelsLoaded ? (
            <button
              onClick={closeWebcam}
              className="cursor-pointer bg-cyan-900 text-white text-xl font-bold  font-serif rounded-lg pt-5 pb-5 pl-5 pr-5"
            >
              Close Webcam
            </button>
          ) : (
            <button
              onClick={startVideo}
              className="cursor-pointer bg-yellow-900 text-white text-xl font-bold rounded-lg pt-5 pb-5 pl-5 pr-5"
            >
              Start Face Model Processing
            </button>
          )}
        </div>
        {captureVideo ? (
          modelsLoaded ? (
            <div className="bg-stone-900">
              <div
                className="bg-stone-900"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px",
                }}
              >
                <video
                  ref={videoRef}
                  height={height}
                  width={width}
                  onPlay={handleVideoOnPlay}
                  style={{ borderRadius: "10px" }}
                />
                <canvas ref={canvasRef} style={{ position: "absolute" }} />
              </div>
            </div>
          ) : (
            <div className="bg-stone-900">loading...</div>
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;
