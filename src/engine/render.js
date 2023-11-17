import React, { useRef, useEffect } from 'react';
import mapData from '../assets/map.json';

const Render = () => {
  const canvasRef = useRef(null);
  const cellSize = 64;
  const camera = useRef({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const map = mapData.map;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let y = 0; y < map.length; y++) {
              for (let x = 0; x < map[y].length; x++) {
                switch (map[y][x]) {
                  case 0:
                    ctx.fillStyle = 'lime';
                    break;
                  case 1:
                    ctx.fillStyle = 'gray';
                    break;
                  case 2:
                    ctx.fillStyle = 'black';
                    break;
                  default:
                    ctx.fillStyle = 'white';
                    break;
                }
          ctx.fillRect(
            (x * cellSize - camera.current.x) * camera.current.scale,
            (y * cellSize - camera.current.y) * camera.current.scale,
            cellSize * camera.current.scale,
            cellSize * camera.current.scale
          );
        }
      }
    }

    function handleMouseMove(event) {
      if (!isDragging.current) return;

      const deltaX = event.clientX - lastX.current;
      const deltaY = event.clientY - lastY.current;

      const newCameraX = camera.current.x - deltaX / camera.current.scale;
      const newCameraY = camera.current.y - deltaY / camera.current.scale;

      const maxX = mapData.map[0].length * cellSize - canvas.width / camera.current.scale;
      const maxY = mapData.map.length * cellSize - canvas.height / camera.current.scale;

      camera.current.x = Math.max(0, Math.min(maxX, newCameraX));
      camera.current.y = Math.max(0, Math.min(maxY, newCameraY));

      lastX.current = event.clientX;
      lastY.current = event.clientY;

      draw();
    }

    function handleMouseDown(event) {
      isDragging.current = true;
      lastX.current = event.clientX;
      lastY.current = event.clientY;
    }

    function handleMouseUp() {
      isDragging.current = false;
    }

    function handleWheel(event) {
      event.preventDefault(); 

      const delta = Math.sign(event.deltaY);
      const scaleFactor = 1.1;

      if (delta > 0) {

        camera.current.scale /= scaleFactor;
      } else {

        camera.current.scale *= scaleFactor;
      }

      const minScale = 0.2;
      const maxScale = 1.0;

      camera.current.scale = Math.max(minScale, Math.min(maxScale, camera.current.scale));

      draw();
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    draw();


    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [cellSize]);

  return (
    <canvas
      id='game'
      ref={canvasRef}
      style={{ display: 'block' }}
    ></canvas>
  );
};

export default Render;
