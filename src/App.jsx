import { Route,Routes } from "react-router-dom"
import Home from "./Home"
import Contact from "./Contact"
import VideoRecorder from "./VideoRecorder"
import ScreenRecorder from "./ScreenRecorder"
import ScreenCamAudioRecorder from "./ScreenCamAudioRecorder"
import DrawingCanvas from "./DrawningCanvas"

function App() {
  return (
    <>
    <Routes> 
      <Route path="/home" element={<Home/>} />  
      <Route path="/contact" element={<Contact />} />
      <Route path="/videorecorder" element={<VideoRecorder/>}  />
      <Route path="/screenrecorder" element={<ScreenRecorder/>} />
      <Route path="/screencamrecorder" element={<ScreenCamAudioRecorder/>} />
      <Route path="/drawning" element={<DrawingCanvas/>} />
    </Routes>
    </>

    
  )
}

export default App
