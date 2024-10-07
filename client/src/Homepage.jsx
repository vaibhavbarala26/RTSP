import React, { useState } from 'react'
import HLSPlayer from './VideoPlayer'

const Homepage = () => {
    const [url , setLink] = useState("")
    const [streamurl , setStremurl] = useState("")
    const [streamstart , setStreamstart] = useState(false)
    const [overlaytext , setOverlaytext] = useState("")
    const handlesubmit = async(e)=>{
        e.preventDefault();
    
        fetch('http://localhost:8080/start-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({url}),  // Send the RTSP URL in the request body
        })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            setStremurl(data.url)
            console.log(data);
            alert('Streaming started successfully with URL: ' + data.url);
            setLink("")
          } else {
            alert('Error: ' + data.error);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    
    }
    const handlestream = async ()=>{
      setStreamstart(false)
      const res = await fetch("http://localhost:8080/stop-stream" , {
        method:"POST",
        headers: {
          'Content-Type': 'application/json',
        },
        
      })
      if(res.ok){
        
      }
    }
  return (
    <div className='flex flex-col justify-center gap-10'>
        <div className='flex flex-row justify-center'>
      <h1 className='text-5xl p-3 '>Live Stream</h1>
      </div>
      <div className='  flex flex-row ' >
      <form action="" onSubmit={handlesubmit} className='w-[100%]   flex flex-row justify-center gap-1'>
        <input type="text" placeholder='Enter the url here' value={url} onChange={(e)=>(setLink(e.target.value))}  className='p-3 w-4/5 border-2'/>
        <button className='bg-black text-white p-3'>Stream</button>
      </form>
      </div>
      {streamstart ? (<>
      <div className=' flex flex-col justify-center gap-3'>
        <div className='flex flex-row justify-center' ><button onClick={()=>(handlestream())} className='bg-black text-white p-3 rounded-full'>Stop Stream</button></div>
        <HLSPlayer streamurl ={streamurl}></HLSPlayer>
       
        </div>
        </>) : (<>
        <div className='flex flex-row justify-center '>
        <button className='bg-black text-white p-3 rounded-full' onClick={()=>(setStreamstart(true))}>Start Stream</button>
        </div>
        </>)}
    
    </div>
  )
}

export default Homepage
