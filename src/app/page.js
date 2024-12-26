'use client'

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Head from 'next/head';
import { FaPen, FaEraser, FaUndo, FaRedo, FaDownload, FaTrash } from 'react-icons/fa';

export default function Home() {

  //states
  const [drawing, setDrawing] = useState(false);
  const [penSize, setPenSize] = useState(1);
  const [eraserSize, setEraserSize] = useState(10);
  const [penSelect, setPenSelect] = useState(true);
  const [penColor, setPenColor] = useState('black');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 400 });
  const [history, setHistory] = useState([]);
  const [redoList, setRedoList] = useState([]);

  const selectPen = () => {
    setPenSelect(true);
  }

  const selectEraser = () => {
    setPenSelect(false);
  }

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    const canvasBody = canvasRef.current;
    const canvasContext = canvasBody.getContext('2d');

    if (!canvasBody?.getAttribute('data-initialized')) {
      canvasContext.fillStyle = '#ffffff';
      canvasContext.fillRect(0, 0, canvasBody.width, canvasBody.height);
      canvasBody?.setAttribute('data-initialized', true); 
    }

    canvasContext.lineCap = 'round';

    contextRef.current = canvasContext;
  }, []);

  useEffect(() => {
    const canvasContext = contextRef.current;

    if (penSelect) {
      canvasContext.strokeStyle = penColor;
      canvasContext.lineWidth = penSize;
    } else {
      canvasContext.strokeStyle = 'white';
      canvasContext.lineWidth = eraserSize;
    }
  }, [penSelect, penSize, eraserSize, penColor]);

  useEffect(() => {
    function updateCanvasDimensions() {
      const canvas = canvasRef.current;
      const parent = canvas.parentNode;
      const width = parent.offsetWidth - 70; 
      const height = 400; 

      canvas.width = width;
      canvas.height = height;

      const canvasContext = canvas.getContext('2d');
      canvasContext.fillStyle = '#ffffff';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      setCanvasDimensions({ width, height });
    }

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  const startWriting = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setDrawing(true);
  }

  const stopWriting = () => {
    contextRef.current?.closePath();
    setDrawing(false);
    saveHistory();
  }

  const writing = ({ nativeEvent }) => {
    if (!drawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current.stroke(); 
  };

  const clearBoard = () => {
    const canvas = contextRef.current.canvas;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);         
    saveHistory();
  }

  const download = () => {
    var imageData = canvasRef.current.toDataURL("image/png");
    var link = document.createElement('a');
    link.href = imageData;
    link.download = 'your_sign.png';
    link.click();
  }

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    setHistory([...history, imageData]);
    setRedoList([]);
  }

  const undo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const lastState = newHistory.pop();
    setRedoList([...redoList, lastState]);
    setHistory(newHistory);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = newHistory[newHistory.length - 1] || '';
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
  }

  const redo = () => {
    if (redoList.length === 0) return;
    const newRedoList = [...redoList];
    const lastState = newRedoList.pop();
    setHistory([...history, lastState]);
    setRedoList(newRedoList);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
  }

  return (
    <div className="h-full w-full text-[#223029] flex flex-col justify-center items-center" style={{ background: 'radial-gradient(circle farthest-corner at 3.7% 49.8%, rgba(143,232,255,1) 21.9%, rgba(209,243,251,1) 52.9%)' }}>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </Head>
      <header className="my-8 text-center">
        <h1 className="text-5xl font-bold text-[#223029] font-pacifico">eSignNow</h1>
        <p className="text-lg text-[#223029] mt-4">Create and download your digital signatures easily.</p>
      </header>
      <canvas
        className="border-4 rounded-xl bg-white border-[#63d8ff] hover:cursor-crosshair"
        height={canvasDimensions.height}
        width={canvasDimensions.width}
        onMouseDown={startWriting}
        onMouseUp={stopWriting}
        onMouseMove={writing}
        ref={canvasRef}
      ></canvas>
      <div className="flex flex-col items-center mt-8 space-y-4">
        <button className="text-base h-8 w-28 flex items-center justify-center text-[#223029] font-bold bg-[#fdf0d5] rounded-md hover:bg-[#223029] hover:text-[#fdf0d5] hover:border-2 hover:border-[#fdf0d5] transition duration-300 ease-in-out transform hover:scale-105" onClick={clearBoard}>
          <FaTrash className="mr-2" /> Clear
        </button>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-row items-center space-x-2">
            <h1 className="text-xs font-bold">PEN SIZE</h1>
            <input type="range" min={1} max={10} value={penSize} onChange={(e) => setPenSize(e.target.value)} className="w-32 hover:cursor-pointer" />
            <h1 className="font-bold">{penSize}</h1>
          </div>
          <button className="text-base h-8 w-28 flex items-center justify-center text-[#223029] font-bold bg-[#fdf0d5] rounded-md hover:bg-[#223029] hover:text-[#fdf0d5] hover:border-2 hover:border-[#fdf0d5] transition duration-300 ease-in-out transform hover:scale-105" onClick={selectPen}>
            <FaPen className="mr-2" /> Pen
          </button>
          <button className="text-base h-8 w-28 flex items-center justify-center text-[#223029] font-bold bg-[#fdf0d5] rounded-md hover:bg-[#223029] hover:text-[#fdf0d5] hover:border-2 hover:border-[#fdf0d5] transition duration-300 ease-in-out transform hover:scale-105" onClick={selectEraser}>
            <FaEraser className="mr-2" /> Eraser
          </button>
          <div className="flex flex-row items-center space-x-2">
            <h1 className="text-xs font-bold">ERASER SIZE</h1>
            <input type="range" min={5} max={20} value={eraserSize} onChange={(e) => setEraserSize(e.target.value)} className="w-32 hover:cursor-pointer" />
            <h1 className="font-bold">{eraserSize}</h1>
          </div>
          <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-20 rounded-md hover:cursor-pointer" />
        </div>
        <div className="flex flex-row space-x-4">
          <button className="text-sm h-8 w-24 flex items-center justify-center text-[#223029] font-bold bg-[#fdf0d5] rounded-md hover:bg-[#223029] hover:text-[#fdf0d5] hover:border-2 hover:border-[#fdf0d5] transition duration-300 ease-in-out transform hover:scale-105" onClick={undo}>
            <FaUndo className="mr-2" /> Undo
          </button>
          <button className="text-sm h-8 w-24 flex items-center justify-center text-[#223029] font-bold bg-[#fdf0d5] rounded-md hover:bg-[#223029] hover:text-[#fdf0d5] hover:border-2 hover:border-[#fdf0d5] transition duration-300 ease-in-out transform hover:scale-105" onClick={redo}>
            <FaRedo className="mr-2" /> Redo
          </button>
          <button className="text-sm h-8 w-24 flex items-center justify-center text-[#223029] font-bold bg-[#fdf0d5] rounded-md hover:bg-[#223029] hover:text-[#fdf0d5] hover:border-2 hover:border-[#fdf0d5] transition duration-300 ease-in-out transform hover:scale-105" onClick={download}>
            <FaDownload className="mr-2" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}