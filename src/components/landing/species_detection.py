from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import base64
import numpy as np
import cv2
from PIL import Image
import io
import os
import shutil
import gdown

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for demo

MODEL_PATH = "yolov8x.pt"

if not os.path.exists(MODEL_PATH):
    print("Downloading YOLOv8 model...")
    # Extract the file ID from your Google Drive link
    url = "https://drive.google.com/uc?id=1mvzR6zqNoyA8-jHtti1y4Y5gUm9WLlRO"
    gdown.download(url, MODEL_PATH, quiet=False)

model = YOLO(MODEL_PATH)

# Add evolutionary information dictionary
EVOLUTION_INFO = {
    'person': 'Homo sapiens evolved around 300,000 years ago from earlier hominids. Key features: bipedalism, large brain capacity.',
    'dog': 'Evolved from wolves around 15,000-40,000 years ago through domestication. Common ancestor with wolves ~27,000 years ago.',
    'cat': 'Domestic cats evolved from African wildcats ~9,000 years ago. Family Felidae originated ~25 million years ago.',
    'bird': 'Evolved from theropod dinosaurs ~150 million years ago. Key features: feathers, hollow bones, warm-blooded.',
    'horse': 'Modern horses evolved from Eohippus ~55 million years ago. Key changes: increased size, single toe.',
    'cow': 'Domesticated from wild aurochs ~10,500 years ago. Part of the Bovidae family that emerged ~20 million years ago.',
    # Add more animals as needed
}

@app.route('/detect', methods=['POST'])
def detect():
    try:
        # Get image data from request
        data = request.get_json()
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        image = Image.open(io.BytesIO(image_bytes))
        image_np = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Run detection
        results = model(image_np)
        
        # Process results
        detections = []
        for r in results[0]:
            box = r.boxes[0]
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            name = model.names[cls]
            
            x1, y1, x2, y2 = map(float, box.xyxy[0])
            
            # Add evolutionary information if available
            evolution_data = EVOLUTION_INFO.get(name.lower(), 'Evolutionary history not available.')
            
            detections.append({
                'bbox': [x1, y1, x2-x1, y2-y1],
                'class': name,
                'score': conf,
                'evolution': evolution_data
            })
        
        return jsonify(detections)
    except Exception as e:
        print(f"Error during detection: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
