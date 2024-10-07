// HLSPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Rnd } from 'react-rnd';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import ReactQuill from 'react-quill';
import './App.css'; // Ensure this file contains the necessary styles

const HLSPlayer = ({ streamurl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Store the HLS instance
  const [videoSize, setVideoSize] = useState({ width: 800, height: 450 });
  const [textOpacity, setTextOpacity] = useState(100); // Full opacity
  const [textSize, setTextSize] = useState(12);
  const [overlayText, setOverlayText] = useState("<p>Sample Texts</p>");
  const [textOverlays, setTextOverlays] = useState([]);
  const [imageSrcs, setImageSrcs] = useState([]); // Store overlay images
  const [textPosition, setTextPosition] = useState({ x: 20, y: 20 });
  const [imagePositions, setImagePositions] = useState([{ x: 100, y: 100 }]); // Store image positions
  const [textBgColor, setTextBgColor] = useState('rgba(0, 0, 0, 0.5)'); // Background color for text overlays
  const [textColor, setTextColor] = useState('#ffffff'); // Text color
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const [imagesize , setimagesize] = useState({ width: 150, height: 150 })
  // Load Cloudinary script for image uploads
  
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = () => {
        console.log('Cloudinary script loaded.');
        setCloudinaryLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Cloudinary script.');
        alert('Failed to load image upload service.');
      };
      document.body.appendChild(script);

      // Cleanup on unmount
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setCloudinaryLoaded(true);
    }
  }, []);

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      hlsRef.current = new Hls();
      hlsRef.current.loadSource(streamurl);
      hlsRef.current.attachMedia(video);
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play(); // Start playing when the manifest is parsed
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamurl;
      video.addEventListener('loadedmetadata', () => {
        video.play(); // Play when metadata is loaded
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy(); // Cleanup HLS instance
      }
    };
  }, [streamurl]);

  // Handle position updates for text overlays
  const handleTextStop = (e, d) => {
    setTextPosition({ x: d.x, y: d.y });
  };

  // Handle position updates for image overlays
  const handleImageStop = (index, e, d, id) => {
    const newPositions = [...imagePositions];
    newPositions[index] = { x: d.x, y: d.y };
    setImagePositions(newPositions);
  
    // Call the API to persist the new image position
    handleimagemove(id, d.x, d.y);
  };
  

  // Reset positions of text and image overlays
  const resetPositions = () => {
    setTextPosition({ x: 20, y: 20 });
    setImagePositions([{ x: 100, y: 100 }]); // Reset image positions
  };

  // Open Cloudinary upload widget
  const openWidget = () => {
    if (cloudinaryLoaded && window.cloudinary) {
        const widget = window.cloudinary.createUploadWidget({
            cloudName: 'dhvaguxhd', // Your Cloudinary cloud name
            uploadPreset: 'xaegit3n', // Your upload preset
            sources: ['local', 'url', 'camera'],
            multiple: true, // Allow multiple uploads
            cropping: false,
            showUploadMoreButton: false,
            defaultSource: 'local',
            maxImageFileSize: 5000000, // 5MB
        }, async (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Done! Here is the image info: ', result.info);
                setImageSrcs(prev => [...prev, result.info.secure_url]); // Add new image URL to state
                
                // Example of dynamic position, modify as needed
                const newImagePosition = { x: 100, y: 100 }; // Set dynamically if needed
                setImagePositions(prev => [...prev, newImagePosition]); // Add new image position
                
                // Call saveImageOverlay with parameters
                await saveImageOverlay(result.info.secure_url, newImagePosition);
            }
        });
        widget.open();
    } else {
        console.error('Cloudinary is not loaded.');
        alert('Image upload service is not available. Please try again later.');
    }
};

// Function to save the image overlay
const saveImageOverlay = async (src, position) => {
    try {
        const response = await fetch("http://localhost:8080/save_image_overlay", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sizeh: imagesize.height,
                sizew: imagesize.width,
                positionx: position.x,
                positiony: position.y,
                src: src
            })
        });

        if (!response.ok) {
            // Handle response errors (4xx or 5xx)
            const errorData = await response.json();
            console.error("Error saving overlay:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Overlay saved successfully:", data);
    } catch (error) {
        console.error("Network error:", error);
    }
};
useEffect(()=>{
  const get = async()=>{
    const response = await fetch("http://localhost:8080/get_image_overlays" , {
      method:"GET",
      headers: {
        'Content-Type': 'application/json',
    },
    })
    if(response.ok){
      const res = await response.json()
      setImageSrcs(res)
     
      console.log(imageSrcs);
      
      
     }
  }
  get()
},[imagePositions , imagesize ]) 

  // Ensure overlays stay within video container when video size changes
  useEffect(() => {
    // Adjust text and image positions if they exceed new video size
    if (textPosition.x + textSize > videoSize.width) {
      setTextPosition(prev => ({
        ...prev,
        x: Math.max(0, videoSize.width - textSize)
      }));
    }
    if (textPosition.y + textSize > videoSize.height) {
      setTextPosition(prev => ({
        ...prev,
        y: Math.max(0, videoSize.height - textSize)
      }));
    }

    imageSrcs.forEach((src, index) => {
      if (src.positionx[index] + 150 > videoSize.width) { // 150 is the default image width
        setImagePositions(prev => {
          const newPositions = [...prev];
          newPositions[index] = { ...newPositions[index], x: Math.max(0, videoSize.width - 150) };
          return newPositions;
        });
      }
      if (src.positiony[index] + 150 > videoSize.height) { // 150 is the default image height
        setImagePositions(prev => {
          const newPositions = [...prev];
          newPositions[index] = { ...newPositions[index], y: Math.max(0, videoSize.height - 150) };
          return newPositions;
        });
      }
    });
  }, [videoSize, textPosition, imagePositions, imageSrcs]);

  const overlayStyle = {
    opacity: textOpacity / 100, // Convert to a fraction
    fontSize: `${textSize}px`, // Set the font size
    color: textColor, // Set the text color
  };
  const update = (id)=>{
    const newOverlay = {
      text: overlayText,
      positionx: textPosition.x,
      positiony: textPosition.y,
      sizew: 200,
      sizeh: 200, // Corrected the key to sizeh
      opacity: textOpacity,
      bg_color: textBgColor, // Corrected the key to bg_color
      text_color: textColor, // Corrected the key to text_color
    };
    const update = async ()=>{
      const response = await fetch(`http://localhost:8080/update_overlays/${id}`, {
        method:"PUT",
        body:JSON.stringify(newOverlay)
      })
      .then(res=>res.json())
      .then(data=>console.log(data))
    }
  
  }
  
  useEffect(()=>{
    const get = async()=>{
      const res = await fetch("http://localhost:8080/get_overlays" , {
        method:"GET",
        headers:{
          "Content-Type":"application/json"
        }
      })
      .then(res=>res.json())
      .then((data)=>{setTextOverlays(data);
        console.log(data);
        
      }
      
      )
    }

    get()
  }, [overlayText, textBgColor, textOpacity, textPosition, textColor, textSize])
  const handleAddTextOverlay = () => {
    const newOverlay = {
      text: overlayText,
      positionx: textPosition.x,
      positiony: textPosition.y,
      sizew: 200,
      sizeh: 200, // Corrected the key to sizeh
      opacity: textOpacity,
      bg_color: textBgColor, // Corrected the key to bg_color
      text_color: textColor, // Corrected the key to text_color
    };
    console.log(newOverlay);
    
    saveOverlays(newOverlay); // Pass newOverlay to saveOverlays
    setOverlayText(""); // Clear the input field after adding
};

// Save overlay data to the server
const saveOverlays = async (overlayData) => { // Accept overlayData as a parameter
    try {
        const response = await fetch('http://localhost:8080/save_overlays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(overlayData), // Use overlayData here
        });

        if (!response.ok) {
            const errorData = await response.json(); // Get error data if available
            throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || ''}`);
        }

        const result = await response.json();
        console.log('Overlays saved successfully:', result);
    } catch (error) {
        console.error('Error saving overlays:', error);
    }
};
const handlemove = (a , b , c)=>{
  console.log(a);
  console.log(b , c);
  const newOverlay = {

    positionx: b,
    positiony:c,
 // Corrected the key to sizeh
   // Corrected the key to text_color
  };
  const update = async ()=>{
    const response = await fetch(`http://localhost:8080/update_overlays/${a}`, {
      method:"PUT",
      body:JSON.stringify(newOverlay),
      headers: {
        'Content-Type': 'application/json',
    },
    })
    .then(res=>res.json())
    .then(data=>console.log(data))
  }
  update()

}
const handlesize = (a , b , c , d , e)=>{
  console.log(a);
  console.log(b , c);
  const newOverlay = {

    positionx: b,
    positiony:c,
    sizeh:e,
    sizew:d,
 // Corrected the key to sizeh
   // Corrected the key to text_color
  };
  const update = async ()=>{
    const response = await fetch(`http://localhost:8080/update_overlays/${a}`, {
      method:"PUT",
      body:JSON.stringify(newOverlay),
      headers: {
        'Content-Type': 'application/json',
    },
    })
    .then(res=>res.json())
    .then(data=>console.log(data))
  }
  update()

}
const handleEditOverlay = async (id) => {
  // Create a new array with the updated overlay text
  const updatedOverlays = textOverlays.map((overlay) => {
    if (overlay.id === id) {
      return { ...overlay, text: overlayText }; // Update the text
    }
    return overlay; // Return the overlay unchanged
  });

  // Update the state with the new overlays
  setTextOverlays(updatedOverlays);

  // Prepare the new overlay data to send to the server
  const newOverlay = {
    text: overlayText,
  };

  try {
    const response = await fetch(`http://localhost:8080/update_overlays/${id}`, {
      method: "PUT",
      body: JSON.stringify(newOverlay),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle non-200 responses
      const errorData = await response.json();
      throw new Error(`Failed to update overlay: ${errorData.error}`);
    }

    const data = await response.json();
    console.log('Update Successful:', data); // Log the success response
  } catch (error) {
    console.error('Error updating overlay on server:', error); // Log any errors
  }
};
const handleDeleteOverlay = async (id) => {
  // Update the local state by filtering out the deleted overlay
  const updatedOverlays = textOverlays.filter((overlay) => overlay.id !== id);

  // Update the state with the new array
  setTextOverlays(updatedOverlays);

  try {
    const response = await fetch(`http://localhost:8080/delete_overlay/${id}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle non-200 responses
      const errorData = await response.json();
      throw new Error(`Failed to delete overlay: ${errorData.error}`);
    }

    const data = await response.json();
    console.log('Delete Successful:', data); // Log the success response
  } catch (error) {
    console.error('Error deleting overlay on server:', error); // Log any errors
  }
};
const  handleDeleteimageOverlay = async (id)=>{
  const updatedimagesrcs = imageSrcs.filter((overall)=>overall.id !== id)
  setImageSrcs(updatedimagesrcs)
  const response = await fetch(`http://localhost:8080/delete_image_overlay/${id}`,{
    method:"DELETE",
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    // Handle non-200 responses
    const errorData = await response.json();
    throw new Error(`Failed to delete overlay: ${errorData.error}`);
  }

  const data = await response.json();
  console.log('Delete Successful:', data);
}
const handleImageResize = async (id, newOverlay) => {
  try {
    const response = await fetch(`http://localhost:8080/update_image_overlay/${id}`, {
      method: "PUT",
      body: JSON.stringify(newOverlay),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log("Resize successful:", data);
  } catch (error) {
    console.error("Resize failed:", error);
  }
};
const handleimagemove = async (id, x, y) => {
  try {
    const response = await fetch(`http://localhost:8080/update_image_overlay/${id}`, {
      method: "PUT",
      body: JSON.stringify({ positionx: x, positiony: y }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log("Move successful:", data);
  } catch (error) {
    console.error("Move failed:", error);
  }
};

  return (
    <div className="hls-player-container flex flex-col md:flex-row gap-5 items-center justify-center mb-10">
      {/* Resizable Video Player */}
      <ResizableBox
        width={videoSize.width}
        height={videoSize.height}
        onResize={(event, { size }) => setVideoSize(size)}
        minConstraints={[300, 200]}
        maxConstraints={[1200, 800]}
        resizeHandles={['se']}
        className="video-resizable-box"
      >
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            controls
            className="w-full h-full"
          />

          {/* Render Text Overlays */}
          {textOverlays.map((overlay, index) => (
            <Rnd
              key={index}
              bounds="parent"
              position={{x:overlay.positionx, y:overlay.positiony}}
              size={{width:overlay.sizew , height:overlay.sizeh}}
              onDragStop={(e, d) => {
                const newOverlays = [...textOverlays];
                newOverlays[index].positionx = d.x; // Update the position in the new overlay state
                newOverlays[index].positiony = d.y; // Update the position in the new overlay state
                setTextOverlays(newOverlays);
                handlemove(overlay.id, d.x, d.y); // Update position on the server
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const newOverlays = [...textOverlays];
                const overlayId = overlay.id; // Retrieve the overlay ID
                
                // Calculate the new size and position
                const newWidth = ref.offsetWidth;
                const newHeight = ref.offsetHeight;
              console.log(ref);
          
                newOverlays[index].sizew = newWidth; // Update width on resize
                newOverlays[index].sizeh = newHeight; // Update height on resize
                newOverlays[index].positionx = position.x; // Update position after resize
                newOverlays[index].positiony = position.y; // Update position after resize
              
                setTextOverlays(prevOverlays => {
                  const newOverlays = [...prevOverlays];
                  newOverlays[index] = {
                    ...newOverlays[index],
                    sizew: newWidth,
                    sizeh: newHeight,
                    positionx: position.x,
                    positiony: position.y,
                  };
                  return newOverlays; // Return the updated array
                });
                
                // Call the handlesize function to update the server with the new dimensions and position
                handlesize(overlayId, position.x, position.y, newWidth, newHeight);
              }}
              className="z-20 absolute p-2 cursor-move rounded shadow-lg overflow-hidden"
            >
              <div
                className="w-full h-full overflow-hidden p-2"
                style={{
                  ...overlayStyle,
                  // Use the background color from the overlay
                }}
                dangerouslySetInnerHTML={{ __html: overlay.text }}
              />
            </Rnd>
          ))}

          {/* Draggable and resizable image overlays */}
          {imageSrcs.length>0 && imageSrcs.map((src, index) => (
           <Rnd
           key={index}
           bounds="parent"
           position={{x:src.positionx , y:src.positiony}}
           size={{ height: src.sizeh, width: src.sizew }} // Default image size
           onDragStop={(e, d) => handleImageStop(index, e, d , src.id)}
           onResizeStop={(e, direction, ref, delta, position) => {
            const newOverlays = [...imageSrcs];
            const overlayId = src.id; // Retrieve the overlay ID
            
            // Calculate the new size and position
            const newWidth = ref.offsetWidth;
            const newHeight = ref.offsetHeight;
          console.log(ref.offsetHeight);
      
            newOverlays[index].sizew = newWidth; // Update width on resize
            newOverlays[index].sizeh = newHeight; // Update height on resize
            newOverlays[index].positionx = position.x; // Update position after resize
            newOverlays[index].positiony = position.y; // Update position after resize
          
            setImageSrcs(prevOverlays => {
              const newOverlays = [...prevOverlays];
              newOverlays[index] = {
                ...newOverlays[index],
                sizew: newWidth,
                sizeh: newHeight,
                positionx: position.x,
                positiony: position.y,
              };
              return newOverlays; // Return the updated array
            });
             // Call handleImageResize with the updated size
             handleImageResize(src.id, {
               sizew: newWidth,
               sizeh: newHeight,
               
             });
           }}
           className="absolute z-10"
           enableResizing={true} // Allow resizing
         >
              <img src={src.src} alt={`Overlay ${index}`} className="w-full h-full object-cover" />
            </Rnd>
          ))}
        </div>
      </ResizableBox>

      {/* Control Panel */}
      <div className="control-panel flex flex-col gap-4">
        <div className='flex flex-row gap-6'>
          <button onClick={openWidget} className="bg-black text-white p-2 rounded">Upload Image</button>
        
          <button onClick={handleAddTextOverlay} className='bg-black text-white p-2 rounded'>Add Text Overlay</button>
        </div>
        <div className='flex flex-col'>
          <div className='flex flex-col w-1/2 '>
            <label>Opacity</label>
            <input type="range" min={0} max={100} step={5} value={textOpacity} onChange={(e) => (setTextOpacity(e.target.value))} />
          </div>
          <label>Overlay Text:</label>
          <ReactQuill value={overlayText} onChange={setOverlayText} />
        </div>
        <div className='flex flex-col gap-5'>
          <div>
            <h1 className='font-bold py-2'>Text overlays</h1>
  {textOverlays.map((text, index) => (
    <div key={index} className='flex border-2  flex-row gap-2 items-center justify-between p-2 rounded'>
      <h1 dangerouslySetInnerHTML={{ __html: text.text }} />
      <div className='flex gap-2 '>
        <button 
          className='p-2 rounded-lg bg-black text-white' 
          onClick={() => handleDeleteOverlay(text.id)} // Function to handle deletion
        >
          Delete
        </button>
        <button 
          className=' p-2 rounded-lg bg-black text-white' 
          onClick={() => handleEditOverlay(text.id)} // Function to handle editing
        >
          Edit
        </button>
      </div>
    </div>
  ))}
  </div>
  <div>
  <h1 className='font-bold py-2'>Image overlays</h1>
  {imageSrcs.map((text, index) => (
    <div key={index} className='flex border-2 flex-row gap-2 items-center justify-between p-2 rounded'>
     <img src={text.src} alt="" className='h-10' />
      <div className='flex gap-2 '>
        <button 
          className='p-2 rounded-lg bg-black text-white' 
          onClick={() => handleDeleteimageOverlay(text.id)} // Function to handle deletion
        >
          Delete
        </button>
        <button 
          className=' p-2 rounded-lg bg-black text-white' 
          onClick={() => handleEditimageOverlay(text.id)} // Function to handle editing
        >
          Edit
        </button>
      </div>
    </div>
  ))}
  </div>
</div>

      </div>
    </div>
  );
};

export default HLSPlayer;









