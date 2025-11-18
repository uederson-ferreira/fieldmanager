import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';

export interface AssinaturaDigitalRef {
  limpar: () => void;
  getAssinatura: () => string | null;
}

interface AssinaturaDigitalProps {
  label: string;
  assinatura?: string;
  onAssinar?: (assinatura: string | null) => void;
}

const AssinaturaDigital = forwardRef<AssinaturaDigitalRef, AssinaturaDigitalProps>(
  ({ label, assinatura, onAssinar }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Configurar o contexto
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);

      // Carregar assinatura existente se houver
      if (assinatura) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = assinatura;
      }
    }, [assinatura]);

    const getCanvasCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      if (!context) return;

      setIsDrawing(true);
      const { x, y } = getCanvasCoordinates(event);
      context.beginPath();
      context.moveTo(x, y);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      if (!isDrawing || !context) return;

      const { x, y } = getCanvasCoordinates(event);
      context.lineTo(x, y);
      context.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      
      setIsDrawing(false);
      if (context) {
        context.closePath();
      }
      
      // Notificar sobre a assinatura
      if (onAssinar) {
        const canvas = canvasRef.current;
        if (canvas && !isCanvasEmpty(canvas)) {
          onAssinar(canvas.toDataURL('image/png'));
        }
      }
    };

    const isCanvasEmpty = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) return false; // Verificar canal alpha
      }
      return true;
    };

    const limpar = () => {
      if (!context || !canvasRef.current) return;
      
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (onAssinar) onAssinar(null);
    };

    const getAssinatura = () => {
      const canvas = canvasRef.current;
      if (!canvas || isCanvasEmpty(canvas)) return null;
      return canvas.toDataURL('image/png');
    };

    useImperativeHandle(ref, () => ({
      limpar,
      getAssinatura
    }));

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="border rounded-md bg-white p-2 flex flex-col items-center w-full">
          <canvas
            ref={canvasRef}
            width={1000}
            height={400}
            className="border rounded w-full h-48 sm:h-56 bg-gray-50 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: 'none' }}
          />
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
            onClick={limpar}
          >
            Limpar Assinatura
          </button>
        </div>
      </div>
    );
  }
);

AssinaturaDigital.displayName = 'AssinaturaDigital';

export default AssinaturaDigital; 