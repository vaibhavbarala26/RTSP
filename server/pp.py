from flask import Flask, request, send_from_directory, jsonify
from flask_mongoengine import MongoEngine
from flask_cors import CORS
import subprocess
import os
from mongoengine import (
    Document,
    StringField,
    IntField,
    FloatField,
)
import datetime

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# MongoDB Atlas connection settings using MongoEngine
app.config['MONGODB_SETTINGS'] = {
    'db': 'mydatabase',  # Replace 'mydatabase' with your actual database name
    'host': 'mongodb+srv://22je1042:bXFctOw8bLgyLv7P@cluster0.pywyv.mongodb.net/mydatabase?retryWrites=true&w=majority',
    'retryWrites': True
}

db = MongoEngine(app)  # Initialize MongoEngine with the Flask app

# Text overlay schema definition
class TextOverlay(db.Document):
    """Represents a text overlay on the video."""
    text = StringField(required=True)  # Text content of the overlay
    positionx = FloatField(required=True)  # X position of the overlay
    positiony = FloatField(required=True)  # Y position of the overlay
    sizeh = FloatField(required=True)  # Height of the overlay
    sizew = FloatField(required=True)  # Width of the overlay
    opacity = IntField(required=True, min_value=0, max_value=100, default=100)  # Opacity of the overlay
    bg_color = StringField(default='rgba(0, 0, 0, 0.5)')  # Background color
    text_color = StringField(default='#ffffff')  # Text color
    created_at = FloatField(default=lambda: datetime.datetime.now().timestamp())  # Timestamp when created
    textsize = IntField(default=10)  # Default text size

    def to_json(self):
        """Convert overlay object to JSON format."""
        return {
            "id": str(self.id),  # Convert ObjectId to string
            "text": self.text,
            "positionx": self.positionx,
            "positiony": self.positiony,
            "sizeh": self.sizeh,
            "sizew": self.sizew,
            "opacity": self.opacity,
            "bg_color": self.bg_color,
            "text_color": self.text_color,
            "created_at": self.created_at
        }

# Image overlay schema definition
class ImageOverlay(db.Document):
    """Represents an image overlay on the video."""
    positionx = FloatField(required=True)  # X position of the overlay
    positiony = FloatField(required=True)  # Y position of the overlay
    sizew = FloatField(required=True)  # Width of the image
    sizeh = FloatField(required=True)  # Height of the image
    src = StringField(required=True)  # Source URL of the image
    created_at = FloatField(default=lambda: datetime.datetime.now().timestamp())  # Timestamp when created

    def to_jsonimage(self):
        """Convert overlay object to JSON format."""
        return {
            "id": str(self.id),  # Convert ObjectId to string
            "positionx": self.positionx,
            "positiony": self.positiony,
            "sizew": self.sizew,
            "sizeh": self.sizeh,
            "src": self.src,
            "created_at": self.created_at
        }

# Endpoint to save text overlays
@app.route('/save_overlays', methods=['POST'])
def save_overlays():
    """Save a new text overlay."""
    data = request.json
    textoverlay = TextOverlay(
        text=data.get("text"),
        positionx=data.get("positionx"),
        positiony=data.get("positiony"),
        sizew=data.get("sizew"),
        sizeh=data.get("sizeh"),
        opacity=data.get("opacity"),
        bg_color=data.get("bg_color"),
        text_color=data.get("text_color")
    )
    overlay = textoverlay.save()  # Save overlay to the database
    return jsonify(overlay.to_json()), 200  # Return the saved overlay in JSON format

# Endpoint to save image overlays

@app.route('/save_image_overlay', methods=['POST'])
def save_image_overlay():
    """Save a new image overlay."""
    data = request.json


    image_overlay = ImageOverlay(
        positionx=data.get("positionx"),
        positiony=data.get("positiony"),
        sizew=data.get("sizew"),
        sizeh=data.get("sizeh"),
        src=data.get("src")
    )

    try:
        overlay = image_overlay.save()  # Save overlay to the database
        return jsonify(overlay.to_jsonimage()), 201  # Return the saved overlay in JSON format
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return an error message if something goes wrong

# Endpoint to get all text overlays
@app.route("/get_overlays", methods=["GET"])
def get_overlays():
    """Fetch all text overlays."""
    overlays = TextOverlay.objects()  # Fetch all overlays from the collection
    return jsonify([overlay.to_json() for overlay in overlays]), 200

# Endpoint to get all image overlays
@app.route("/get_image_overlays", methods=["GET"])
def get_image_overlays():
    """Fetch all image overlays."""
    overlays = ImageOverlay.objects()  # Fetch all image overlays from the collection
    return jsonify([overlay.to_jsonimage() for overlay in overlays]), 200

# Endpoint to update text overlays
@app.route("/update_overlays/<id>", methods=["PUT"])
def update_overlay(id):
    """Update an existing text overlay."""
    data = request.json  # Get the request data
    
    if not data:
        return jsonify({"error": "No data provided"}), 400  # Handle empty data case

    try:
        overlay = TextOverlay.objects.get(id=id)  # Find the overlay by its id
        overlay.update(**data)  # Update the overlay with the provided data
        updated_overlay = TextOverlay.objects.get(id=id)  # Fetch the updated overlay

        return jsonify(updated_overlay.to_json()), 200  # Return the updated overlay in JSON format
    except TextOverlay.DoesNotExist:
        return jsonify({"error": "Overlay not found"}), 404  # Handle overlay not found case
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Catch other errors

# Endpoint to update image overlays
@app.route("/update_image_overlay/<id>", methods=["PUT"])
def update_image_overlay(id):
    """Update an existing image overlay."""
    data = request.json  # Get the request data
    
    if not data:
        return jsonify({"error": "No data provided"}), 400  # Handle empty data case

    try:
        overlay = ImageOverlay.objects.get(id=id)  # Find the overlay by its id
        overlay.update(**data)  # Update the overlay with the provided data
        updated_overlay = ImageOverlay.objects.get(id=id)  # Fetch the updated overlay

        return jsonify(updated_overlay.to_jsonimage()), 200  # Return the updated overlay in JSON format
    except ImageOverlay.DoesNotExist:
        return jsonify({"error": "Image overlay not found"}), 404  # Handle overlay not found case
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Catch other errors

# Endpoint to delete text overlays
@app.route("/delete_overlay/<id>", methods=["DELETE"])
def delete_overlay(id):
    """Delete an existing text overlay."""
    try:
        overlay = TextOverlay.objects.get(id=id)  # Find the overlay by its id
        overlay.delete()  # Delete the overlay
        return jsonify({"message": "Overlay deleted successfully"}), 200  # Success response
    except TextOverlay.DoesNotExist:
        return jsonify({"error": "Overlay not found"}), 404  # Handle overlay not found case
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Catch other errors

# Endpoint to delete image overlays
@app.route("/delete_image_overlay/<id>", methods=["DELETE"])
def delete_image_overlay(id):
    """Delete an existing image overlay."""
    try:
        overlay = ImageOverlay.objects.get(id=id)  # Find the overlay by its id
        overlay.delete()  # Delete the overlay
        return jsonify({"message": "Image overlay deleted successfully"}), 200  # Success response
    except ImageOverlay.DoesNotExist:
        return jsonify({"error": "Image overlay not found"}), 404  # Handle overlay not found case
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Catch other errors

OUTPUT_DIR = "output"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "stream.m3u8")
ffmpeg_process = None  # Global variable to store the FFmpeg process

@app.route("/")
def index():
    """Endpoint for health check."""
    return "Connected to MongoDB Atlas with MongoEngine"

@app.route("/stream.m3u8")
def stream_m3u8():
    """Serve the HLS playlist file."""
    return send_from_directory(OUTPUT_DIR, 'stream.m3u8')

@app.route("/<path:filename>")
def stream_ts(filename):
    """Serve HLS segment files."""
    if filename.endswith(".ts"):
        return send_from_directory(OUTPUT_DIR, filename)
    else:
        return '', 404  # Return 404 if file not found

@app.route("/start-stream", methods=["POST"])
def start_stream():
    """Start streaming from the provided RTSP URL."""
    global ffmpeg_process  # Access the global variable
    data = request.json
    url = data.get("url")  # Get the RTSP URL from the request
    
    if not url:
        return jsonify({"error": "No URL provided"}), 400  # Check for URL presence

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)  # Create output directory if it doesn't exist
    
    # Command to start streaming from the provided RTSP URL
    command = [
        "./ffmpeg-2024-10-02-git-358fdf3083-full_build/bin/ffmpeg.exe",
        "-rtsp_transport", "tcp",
        "-i", url,  # Use the URL from the request
        "-c:v", "libx264",  # Video codec
        "-hls_time", "2",  # HLS segment duration in seconds
        "-hls_list_size", "3",  # Keep only the latest 3 segments
        "-hls_flags", "delete_segments",  # Delete old segments
        OUTPUT_FILE  # Output file
    ]
    
    # Start the process
    ffmpeg_process = subprocess.Popen(command)
    
    # Check if the process is running
    if ffmpeg_process.poll() is None:
        hls_url = "http://127.0.0.1:8080/stream.m3u8"  # URL for the HLS stream
        return jsonify({"message": "Streaming started successfully", "url": hls_url}), 200
    else:
        return jsonify({"error": "Error starting streaming"}), 500  # Handle streaming errors

@app.route("/stop-stream", methods=["POST"])
def stop_stream():
    """Stop the streaming process."""
    global ffmpeg_process  # Access the global variable
    
    if ffmpeg_process and ffmpeg_process.poll() is None:
        ffmpeg_process.terminate()  # Terminate the FFmpeg process
        ffmpeg_process.wait()  # Wait for the process to terminate
        return jsonify({"message": "Streaming stopped successfully"}), 200
    else:
        return jsonify({"error": "No active streaming process"}), 400  # Handle if no process is running

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)