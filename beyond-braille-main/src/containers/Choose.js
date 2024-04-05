import React, { useState, useEffect } from "react";
import "./Choose.scss"
import { Link } from "react-router-dom";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";
import { useNavigate } from "react-router-dom";

const Choose = () =>{
    const navigate = useNavigate();
    const [value, setValue] = useState("");
    const { speak, speaking, cancel } = useSpeechSynthesis();
    const { listen, stop } = useSpeechRecognition({
        onResult: (result) => {
          console.log(result);
          setValue(result);
        },
    });

    useEffect(() => {
        if(value === "object detector"){
            speak({ text: "You have chosen object detector", queue: false });
            stop();
            navigate("/assessment/object-detection");

        }
        else if(value === "handwriting recognizer"|| value == "handwriting recogniser"){
            speak({ text: "You have chosen handwriting recognizer", queue: false });
            stop();
            navigate("/assessment/ocr");
        }
    }, [value])

    return(
        <div className="Choose">
            <h3>Take your pick</h3>
            <div>
            <button onClick={()=>{
                speak({ text: "You have chosen object detector", queue: false });
                stop();
                navigate("/assessment/object-detection");
            }}>Object Detector</button>
            <button onClick={()=>{
                speak({ text: "You have chosen object detector", queue: false });
                stop();
                navigate("/assessment/ocr");
            }}>Handwriting recognizer</button>
            </div>
            <button className="voice-button" onClick={()=>{
                speak({ text: "Choose object detector or handwriting recognizer", queue: false });
                listen();
            }}>Start voice recognition</button>
        </div>
    )
}

export default Choose;