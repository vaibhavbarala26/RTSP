import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VideoPlayer from './VideoPlayer'
import HLSPlayer from './VideoPlayer'
import VideoOverlay from './File'
import Homepage from './homepage'

function App() {
  const [count, setCount] = useState(0)
const rtspUrl = "rtsp://8.devline.ru:9784/cameras/6/streaming/sub?authorization=Basic%20YWRtaW46&audio=0"
  return (
    <>
         <Homepage></Homepage>
    </>
  )
}

export default App
