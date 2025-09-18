const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || !fabricCanvasRef.current) return;
    
    // Prevent default only when we were actually drawing
    if (e && isDrawing) {
      e.preventDefault();
      e.stopPropagation();
    }

    const canvas = fabricCanvasRef.current;