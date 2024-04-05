// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";
import "./ObjectDetection.scss";
import { drawRect } from "../utilities/detection";
import { useNavigate } from "react-router-dom";

const ObjectDetection = () => {
  let navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { speak, speaking, cancel } = useSpeechSynthesis();
  const [loading, setLoading] = useState(true);
  const objects = ["person", "cell phone", "apple", "cat", "bottle"];

  const [value, setValue] = useState("");
  const [object, setObject] = useState("");
  const [detected, setDetected] = useState([]);
  const [intervalFunction, setIntervalFunction] = useState(0);

  const { listen, stop } = useSpeechRecognition({
    onResult: (result) => {
      console.log(result);
      setValue(result);
    },
  });

  const initListening = async () => {
    speak({ text: "We are listening to you", queue: false });
    listen();
  };

  // Main function
  const runCoco = async () => {
    console.log("loading model...");
    const net = await cocossd.load();
    console.log("Model loaded.");
    setIntervalFunction(
      setInterval(() => {
        detect(net);
      }, 10)
    );
  };

  const moveToNextSection = () => {
    stop();
    clearInterval(intervalFunction);
    navigate("/assessment/quiz", { state: { detected } });
  }

  const detect = async (net) => {
    if (
      typeof webcamRef?.current !== "undefined" &&
      webcamRef?.current !== null &&
      webcamRef?.current?.video?.readyState === 4
    ) {
      setLoading(false);
      const video = webcamRef?.current?.video;
      const videoWidth = webcamRef?.current?.video?.videoWidth;
      const videoHeight = webcamRef?.current?.video?.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const obj = await net?.detect(video);
      var object;
      
      if (obj.length > 0) {
        object = obj[0].class;
        if (!detected.includes(object) && objects.includes(object)) {
          detected.push(object);
          setDetected(detected);
        }
      }

      const ctx = canvasRef.current.getContext("2d");
      if (objects.includes(object)) {
        setObject(drawRect(obj, ctx, speak, speaking, cancel));
      }
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  useEffect(() => {
    switch (value) {
      case "read detected objects":
        speak({ text: detected.join(", "), queue: false });
        break;
      case "stop":
        moveToNextSection();
        break;
      default:
        break;
    }
  }, [value]);

  return (
    <div className="ObjectDetection">
      <div className="webcam-div">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </div>
      <div className="detected">
        <h4>Detected Items:</h4>
        <p>
          {detected.map((item, index) => (
            <span key={index}>{item}, </span>
          ))}
        </p>
      </div>
      <div className="button-section">
        <button
          onClick={() => {
            initListening();
          }}
          className="Landing-button"
        >
          Give Command
        </button>
        <button onClick={()=>{
          moveToNextSection();
        }}>Go to next section</button>
      </div>
      {loading && <h3>Loading</h3>}
    </div>
  );
};

export default ObjectDetection;
