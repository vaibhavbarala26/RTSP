# Video Overlay and Streaming Service

This application allows users to manage text and image overlays on video streams, as well as start and stop streaming from RTSP sources. It uses Flask as the backend framework and MongoDB for data storage.

## Features
- Start and stop streaming from an RTSP URL
- Add, update, delete, and retrieve text and image overlays
- Serve HLS playlist and segment files for streaming
- Cross-Origin Resource Sharing (CORS) support for API requests

## Technologies Used
- Python
- Flask
- Flask-MongoEngine
- FFmpeg for video processing
- MongoDB Atlas for database storage
- Cloudinary for image uploads

## Installation

### Prerequisites
- Python 3.x
- Pip (Python package manager)
- FFmpeg installed and accessible via command line

### Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/repo-name.git
   cd repo-name
