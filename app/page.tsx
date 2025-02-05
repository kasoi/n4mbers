"use client"
import { initWeights, predictNumber } from "@/neural/numbers";
import { MathWeights, PredictionResult } from "@/neural/types";
import { sleep } from "@/utils/sleep";
import ky from "ky";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [weights, setWeights] = useState<MathWeights>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [initCanvas, setInitCanvas] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const minictxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = Math.min(window.innerWidth, window.innerHeight - 150);

    ctxRef.current = ctx;

    canvas.width = size;
    canvas.height = size;

    const miniCanvas = miniCanvasRef.current;
    if (!miniCanvas) return;
    const ctx2 = miniCanvas.getContext("2d");
    if (!ctx2) return;

    ctx2.filter = 'invert(100%)'

    minictxRef.current = ctx2;
    miniCanvas.width = 28;
    miniCanvas.height = 28;
  }, [initCanvas]);

  useEffect(() => {
    const loadInfo = async () => {
      const jsonData = await ky.get('weights.json').json();

      const w = initWeights(jsonData);
      await sleep(50);
      setInitCanvas(true);
      setWeights(w);
    }
    loadInfo();
  }, []);

  const predictImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) return;
    // ctxRef.current.filter = 'blur(10px)'; 

    const resizedCtx = minictxRef.current;
    if (!resizedCtx) return;
    resizedCtx.clearRect(0, 0, 28, 28);

    console.log('ctx works?');

    // resizedCtx.filter = `blur(${canvas.width / 10}px)`; // Применяем размытие
    resizedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28);
    resizedCtx.filter = 'blur(0px)';
    resizedCtx.filter = 'invert(100%)';

    const imageData = resizedCtx.getImageData(0, 0, 28, 28);
    const pixels = imageData.data;

    // ctxRef.current.filter = 'none';

    const pixelValues: number[] = [];

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const gray = Math.round((r + g + b) / 3) / 255;

      pixelValues.push(gray);
    }
    resizedCtx.filter = 'none';

    if (weights) {
      console.log('pixelvalues', pixelValues);
      const result = predictNumber(weights, pixelValues);
      setPrediction(result);
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(e);
    ctxRef.current?.beginPath();
    const w = canvasRef.current?.width || 500;
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = '#fefefe';
      ctxRef.current.lineCap = "round";
      ctxRef.current.lineJoin = "round";
      ctxRef.current.lineWidth = w / 20;

    }
    ctxRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    if (!ctxRef.current) return;
    ctxRef.current?.lineTo(offsetX, offsetY);
    ctxRef.current.shadowBlur = 0;
    ctxRef.current?.stroke();
  };

  const stopDrawing = async () => {
    setIsDrawing(false);
    ctxRef.current?.closePath();

    await sleep(300);
    predictImage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    setPrediction(null);
    if (canvas && ctxRef.current) {
      ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
      
      ctxRef.current.shadowColor = "rgba(255, 255, 255, 0.49)";
      ctxRef.current.shadowBlur = 25;
      ctxRef.current.shadowOffsetX = 0;
      ctxRef.current.shadowOffsetY = 0;
      ctxRef.current.filter = 'none';
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    }

    return {
      offsetX: (e as React.MouseEvent).nativeEvent.offsetX,
      offsetY: (e as React.MouseEvent).nativeEvent.offsetY,
    };
  };

  const renderPredictionText = () => {
    if (prediction) {
      const value = prediction.number;

      let chancesText = '';
      prediction.chances.forEach((c, index) => {
        chancesText += `${index} - ${(c * 100).toFixed(0)}% / `;
      })

      return (<span>
          It&apos;s {value} &nbsp;
          <span className="text-sm opacity-50 ml-2">Chances: {chancesText}</span>
        </span>);
    }

    return '';
  }

  const renderCanvas = () => {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-900 bg-black touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="w-full flex justify-between items-center px-[40px] gap-[20px]">
          <button className="p-2 bg-purple-800 text-white rounded min-w-[150px]" onClick={clearCanvas}>
            Clear
          </button>
          <div>
            {
              renderPredictionText()
            }
          </div>
        </div>
        <div>
          <canvas
            width="28"
            height="28"
            className="border border-gray-100 bg-gray"
            ref={miniCanvasRef} 
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      { weights ? renderCanvas() : 'Loading...' }
    </div>
  );
}
