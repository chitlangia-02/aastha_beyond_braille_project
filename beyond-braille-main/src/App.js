import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importing the required components
import Board from "./containers/Board";
import Quiz from "./containers/Quiz";
import Header from "./components/Header";
import Landing from "./containers/Landing";
import ObjectDetection from "./containers/ObjectDetection";

// Importing the CSS File
import "./App.css";
import Ocr from "./containers/Ocr";
import Choose from "./containers/Choose";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/assessment/ocr" element={<Ocr />} />
          <Route path="/assessment/object-detection" element={<ObjectDetection />}/>
          <Route path="/assessment/board" element={<Board />} />
          <Route path="/assessment/quiz" element={<Quiz />} />
          <Route path="/assessment" element={<Choose />}/>
          <Route path="/" element={<Landing />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
