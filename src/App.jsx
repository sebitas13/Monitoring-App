// src/App.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://stellar-empty-boa.glitch.me/'); 
// const socket = io('http://localhost:5000/'); 

function App() {
  const [data, setData] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    // Suscribirse al evento lecturas
    socket.on('lecturas', (value) => {
      setData(JSON.parse(value));
    });

    // Suscribirse al evento stream_to_client
    socket.on('stream_to_client', (message) => {
      if (isCameraOn) {
        const blob = new Blob([message], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setImageURL(url);
      }
    });

    // Limpiar las suscripciones al desmontar el componente
    return () => {
      socket.off('lecturas');
      socket.off('stream_to_client');
    };
  }, [isCameraOn]);

  const handleCameraToggle = () => {
    const newState = !isCameraOn;
    setIsCameraOn(newState);
    if (!newState) {
      setImageURL(null); // Limpiar la imagen cuando la camara esta apagada
    }
    socket.emit('camaraState', newState);
  };

  return (
    <div className="App">
      <h1>Monitoreo Hotel</h1>
      {data ? (
        <div className="sensor-data">
          <p>Temperatura (C): {data.temp_c}</p>
          <p>Temperatura (F): {data.temp_f}</p>
          <p>Humedad: {data.hume}</p>
          <p>Sensacion termica: {data.s_ter} % </p>
          <p>Luz (LDR): {data.ldr}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
      <div className="button-container">
        <button onClick={handleCameraToggle}>
          {isCameraOn ? 'Apagar Cámara' : 'Encender Cámara'}
        </button>
      </div>
      {imageURL && (
        <div className="image-container">
          <h2>Stream</h2>
          <img src={imageURL} alt="Stream" />
        </div>
      )}
    </div>
  );
}

export default App;
