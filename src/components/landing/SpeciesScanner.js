import React, { useEffect, useRef, useState } from 'react';
import './SpeciesScanner.css';

const SpeciesScanner = () => {
  const API_URL = 'https://YOUR_USERNAME.pythonanywhere.com';  // Your PythonAnywhere URL
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentOrganism, setCurrentOrganism] = useState(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState(null);

  useEffect(() => {
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const detectSpecies = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      // Capture video frame
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 640, 640);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Send to Python backend
      const response = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const detections = await response.json();
      
      // Draw detections
      const mainCtx = canvasRef.current.getContext('2d');
      mainCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      mainCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      detections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        
        mainCtx.strokeStyle = '#00ff00';
        mainCtx.lineWidth = 2;
        mainCtx.strokeRect(x, y, width, height);
        
        mainCtx.fillStyle = '#00ff00';
        mainCtx.font = '16px Arial';
        mainCtx.fillText(
          `${detection.class} (${Math.round(detection.score * 100)}%)`,
          x, y > 10 ? y - 5 : 10
        );
      });

      // Update current organism
      if (detections.length > 0) {
        const bestDetection = detections.reduce((prev, current) => 
          (current.score > prev.score) ? current : prev
        );
        setCurrentOrganism({
          name: bestDetection.class,
          confidence: bestDetection.score,
          evolution: bestDetection.evolution // Assuming the backend provides this information
        });
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    requestAnimationFrame(detectSpecies);
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream; // Store stream reference for cleanup
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const handleVideoPlay = () => {
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    detectSpecies();
  };

  const takeSnapshot = async () => {
    setIsScanning(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 640, 640);
      
      const imageData = canvas.toDataURL('image/jpeg');
      
      const response = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const detections = await response.json();
      
      if (detections.length > 0) {
        const bestDetection = detections.reduce((prev, current) => 
          (current.score > prev.score) ? current : prev
        );
        setEvolutionResult({
          name: bestDetection.class,
          confidence: bestDetection.score,
          evolution: bestDetection.evolution
        });
      }
    } catch (error) {
      console.error('Snapshot error:', error);
    }
    setIsScanning(false);
  };

  return (
    <div className="species-scanner">
      <h2>Species Scanner (TensorFlow)</h2>
      {currentOrganism && (
        <div className="detected-organism">
          <h3>{currentOrganism.name}</h3>
          <p>Confidence: {Math.round(currentOrganism.confidence * 100)}%</p>
          {currentOrganism.evolution && (
            <div className="evolution-info">
              <h4>Evolutionary History:</h4>
              <p>{currentOrganism.evolution}</p>
            </div>
          )}
        </div>
      )}
      {loading && <div className="loading">Loading TensorFlow model...</div>}
      <div className="scanner-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onPlay={handleVideoPlay}
          className="scanner-video"
        />
        <canvas ref={canvasRef} className="detection-overlay" />
        <button 
          className="snapshot-button"
          onClick={takeSnapshot}
          disabled={isScanning}
        >
          {isScanning ? 'Processing...' : 'Take Evolution Snapshot'}
        </button>
      </div>
      
      {evolutionResult && (
        <div className="evolution-result">
          <h3>{evolutionResult.name}</h3>
          <p>Confidence: {Math.round(evolutionResult.confidence * 100)}%</p>
          <div className="evolution-info">
            <h4>Evolutionary History:</h4>
            <p>{evolutionResult.evolution}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesScanner;
