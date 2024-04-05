import React,{useState, useEffect} from "react";
import { DetectDocumentTextCommand, TextractClient } from "@aws-sdk/client-textract";
import { useSpeechSynthesis } from "react-speech-kit";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Buffer } from "buffer";

import './Ocr.scss';

const Ocr = () => {
    const navigate = useNavigate();
    const objects = ["person", "cell phone", "apple", "cat", "bottle"];
    const [imageUrl, setImageUrl] = useState(null);
    const [src, setSrc] = useState("");
    const [data, setData] = useState([]);
    const [uniqueData, setUniqueData] = useState([])
    const [detected, setDetected] = useState([]);
    const [loading, setLoading] = useState(false);
    const { speak, speaking, cancel } = useSpeechSynthesis();

    const onSelectFile = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
          return;
        }

        setImageUrl(URL.createObjectURL(e.target.files[0]));
    
        const reader = new FileReader();
        const file = e.target.files[0];
    
        reader.onload = function (upload) {
          setSrc(upload?.target?.result);
        };
        reader.readAsDataURL(file);
    };

    const onRunOCR = async () => {
        setLoading(true);
        const client = new TextractClient({
          region: 'us-east-1',
          credentials: {
            accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
          },
        });
    
        // convert image to byte Uint8Array base 64
        const blob = Buffer.from(src.split(',')[1], 'base64');
    
        const params = {
          Document: {
            Bytes: blob,
          },
          FeatureTypes: ['TABLES', 'FORMS'],
        };
    
        const command = new DetectDocumentTextCommand(params);
        try {
          const data = await client.send(command);
          // process data.
          if (data?.Blocks) {
            setData(data.Blocks);
        }
        setLoading(false);
        } catch (error) {
          console.log('err', error);
          setLoading(false);
          // error handling.
        } 
    };

    useEffect(() => {
        var matchedObjects = []
        if (data?.length > 0) {
            const spokenWords = [];
            speak({ text: "We are reading the text", queue: false });
            data?.map((item) => {
                if (item.Text) {
                    if(item.Text.split(" ").length > 1){
                        item.Text.split(" ").map((word) => {
                            if (objects.includes(word.toLowerCase())) {
                                if(!matchedObjects.includes(word.toLowerCase()))
                                matchedObjects.push(word.toLowerCase());
                            }
                            if(!spokenWords.includes(word.toLowerCase())) {
                                speak({ text: word, queue: true });
                                spokenWords.push(word.toLowerCase());
                                setUniqueData(spokenWords);
                            }
                        })
                    } else{
                        if (objects.includes(item.Text.toLowerCase())) {
                            if(!matchedObjects.includes(item.Text.toLowerCase()))
                            matchedObjects.push(item.Text.toLowerCase());
                        }
                        if(!spokenWords.includes(item.Text.toLowerCase())){
                            speak({ text: item.Text, queue: true });
                            spokenWords.push(item.Text.toLowerCase());
                            setUniqueData(spokenWords);
                        }
                    }
                }
            });
        }
        if(matchedObjects.length > 0){
            setDetected(matchedObjects);
        }
    }, [data]);

    return (
        <div className="ocr">
            <h1>OCR</h1>
            <div className="input-container">
                <input
                    className="inputfile"
                    id="file"
                    type="file"
                    name="file"
                    onChange={onSelectFile}
                />
                {imageUrl != null &&
                    <img src={imageUrl} className="uploaded-img" alt="selected" />
                }
            </div>
            {src !== "" &&
                <button onClick={onRunOCR} className="ocr-button">
                    Run OCR
                </button>
            }
            <div className="result">
                {loading && <span>Loading...</span>}
                {!loading && uniqueData.length === 0 && <span>No data</span>}
                {!loading && uniqueData.length > 0 && <span className="result-title">Result:</span>}
                {uniqueData.map((item, index) => {
                    return (
                        <span key={index} style={{ margin: "2px", padding: "2px" }}>
                            {uniqueData[index]}
                        </span>
                    );
                    }
                )}
            </div>
            <div className="matched">
                    <p>Matched Objects: {detected?.map((item, index) => {
                        return (
                            <span key={index} style={{ margin: "2px", padding: "2px" }}>
                                {item} 
                            </span>
                        );
                    })}</p>
            </div>
            {detected.length > 0 && <button onClick={()=>{
                navigate("/assessment/quiz", { state: { detected } });
            }}>Move to quiz</button>}
        </div>
    );
}

export default Ocr;