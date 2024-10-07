
Video Overlay and Streaming Service
This application allows users to manage text and image overlays on video streams, as well as start and stop streaming from RTSP sources. It uses Flask as the backend framework and MongoDB for data storage.

Features
Start and stop streaming from an RTSP URL
Add, update, delete, and retrieve text and image overlays
Serve HLS playlist and segment files for streaming
Cross-Origin Resource Sharing (CORS) support for API requests
Technologies Used
Python
Flask
Flask-MongoEngine
FFmpeg for video processing
MongoDB Atlas for database storage
Cloudinary for image uploads
Installation
Prerequisites
Python 3.x
Pip (Python package manager)
FFmpeg installed and accessible via command line
Setup
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/repo-name.git
cd repo-name
Create a virtual environment (optional but recommended):

bash
Copy code
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
Install required packages:

bash
Copy code
pip install Flask flask-mongoengine flask-cors
Set up MongoDB connection:

Replace the MongoDB connection string in the app.py file with your own connection string.
Run the application:

bash
Copy code
python app.py
The application will be available at http://localhost:8080.

API Documentation
Base URL
arduino
Copy code
http://localhost:8080
Endpoints
Health Check
GET /
Response: "Connected to MongoDB Atlas with MongoEngine"
HTTP Code: 200 OK
Start Streaming
POST /start-stream
Request Body:
json
Copy code
{
    "url": "rtsp://example.com/stream"
}
Response:
json
Copy code
{
    "message": "Streaming started successfully",
    "url": "http://127.0.0.1:8080/stream.m3u8"
}
HTTP Codes:
200 OK: Streaming started successfully.
400 Bad Request: No URL provided.
500 Internal Server Error: Error starting streaming.
Stop Streaming
POST /stop-stream
Response:
json
Copy code
{
    "message": "Streaming stopped successfully"
}
HTTP Codes:
200 OK: Streaming stopped successfully.
400 Bad Request: No active streaming process.
Manage Overlays
Text Overlays:

Save:

Endpoint: /save_overlays (POST)
Response:
json
Copy code
{
    "id": "text_overlay_id",
    "text": "Overlay text",
    ...
}
HTTP Codes:
200 OK: Overlay saved successfully.
400 Bad Request: No data provided.
500 Internal Server Error: Error saving overlay.
Get:

Endpoint: /get_overlays (GET)
Response:
json
Copy code
[
    {
        "id": "text_overlay_id",
        ...
    }
]
HTTP Codes:
200 OK: Overlays retrieved successfully.
Update:

Endpoint: /update_overlays/<id> (PUT)
Response:
json
Copy code
{
    "id": "text_overlay_id",
    ...
}
HTTP Codes:
200 OK: Overlay updated successfully.
400 Bad Request: No data provided.
404 Not Found: Overlay not found.
Delete:

Endpoint: /delete_overlay/<id> (DELETE)
Response:
json
Copy code
{
    "message": "Overlay deleted successfully"
}
HTTP Codes:
200 OK: Overlay deleted successfully.
404 Not Found: Overlay not found.
Image Overlays:

Save:

Endpoint: /save_image_overlay (POST)
Response:
json
Copy code
{
    "id": "image_overlay_id",
    ...
}
HTTP Codes:
201 Created: Overlay saved successfully.
400 Bad Request: No data provided.
500 Internal Server Error: Error saving overlay.
Get:

Endpoint: /get_image_overlays (GET)
Response:
json
Copy code
[
    {
        "id": "image_overlay_id",
        ...
    }
]
HTTP Codes:
200 OK: Image overlays retrieved successfully.
Update:

Endpoint: /update_image_overlay/<id> (PUT)
Response:
json
Copy code
{
    "id": "image_overlay_id",
    ...
}
HTTP Codes:
200 OK: Overlay updated successfully.
400 Bad Request: No data provided.
404 Not Found: Image overlay not found.
Delete:

Endpoint: /delete_image_overlay/<id> (DELETE)
Response:
json
Copy code
{
    "message": "Image overlay deleted successfully"
}
HTTP Codes:
200 OK: Image overlay deleted successfully.
404 Not Found: Image overlay not found.
Additional Notes
Ensure that FFmpeg is correctly installed and accessible in your system PATH.
Adjust the output directory settings and the FFmpeg command in the code as necessary for your environment.
If you're using Cloudinary for image uploads, make sure to replace the placeholders with your actual Cloudinary credentials.
