import React, { useRef, useEffect, useState } from 'react';
import mapData from '../assets/map120x120.json';
import Tower from '../objects/tower';


const Render = ({ buildMode }) => {
  const canvasRef = useRef(null);
  const cellSize = 64;
  const camera = useRef({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const [towers, setTowers] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const map = mapData.map;
    
    function draw() {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                                ctx.mozBackingStorePixelRatio ||
                                ctx.msBackingStorePixelRatio ||
                                ctx.oBackingStorePixelRatio ||
                                ctx.backingStorePixelRatio || 1;
      const ratio = devicePixelRatio / backingStoreRatio;

      const topBarHeight = document.querySelector('.top-bar').offsetHeight;
      const leftSidebarWidth = document.querySelector('.left-sidebar').offsetWidth;
      const rightSidebarWidth = document.querySelector('.right-sidebar').offsetWidth;

      const availableHeight = window.innerHeight - topBarHeight;
      const availableWidth = window.innerWidth - leftSidebarWidth - rightSidebarWidth;

      const canvasWidth = availableWidth * ratio;
      const canvasHeight = availableHeight * ratio;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${availableWidth}px`;
      canvas.style.height = `${availableHeight}px`;



      ctx.clearRect(0, 0, canvas.width, canvas.height);


            for (let y = 0; y < map.length; y++) {
              for (let x = 0; x < map[y].length; x++) {
                switch (map[y][x]) {
                  case 0:
                    ctx.fillStyle = 'red';
                    break;
                  case 1:
                    ctx.fillStyle = 'lime';
                    break;
                  case 2:
                    ctx.fillStyle = 'blue';
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
      // AS TOKS DURNAS NAHUI SUKA, 5 VAL jeigu sita koda perkelsite 2 eilutem JIS RERENDERINS 14400 KARTUS IR TOKS LAGAS IR 5 VAL GAlVOJU KODEL TAIP YRa!!!!!!!
      const towerPositions = towers.map(tower => ({
        x: (tower.x * cellSize - camera.current.x) * camera.current.scale,
        y: (tower.y * cellSize - camera.current.y) * camera.current.scale,
        size: cellSize * camera.current.scale
      }));

      towerPositions.forEach(tower => {
        if (
          tower.x + tower.size >= 0 &&
          tower.x <= canvas.width &&
          tower.y + tower.size >= 0 &&
          tower.y <= canvas.height
        ) {
          ctx.fillStyle = towers[0].color;
          ctx.fillRect(tower.x, tower.y, tower.size, tower.size);
        }
      });
    
    }

    canvas.addEventListener('click', handleClick);

    function handleClick(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
  
      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;
  
      const tileX = Math.floor((mouseX / camera.current.scale + camera.current.x) / cellSize);
      const tileY = Math.floor((mouseY / camera.current.scale + camera.current.y) / cellSize);

      if (buildMode) {
    if (map[tileY][tileX] === 1) {
      const isTowerExists = towers.some(tower => tower.x === tileX && tower.y === tileY);
      if (!isTowerExists) {
        const newTower = new Tower('type', 'name', tileX, tileY, 'orange', 1, 10, 'owner');
        const newTowers = [...towers, newTower];
        setTowers(newTowers);
        draw();
        console.log('Building tower:', newTower);
        console.log(newTowers);
      } else {
          console.log('There is already a tower at this position.');
        }
      } else {
        console.log('Cannot place tower here. Not a valid spot.');
      }
    } else {
        // Logic for normal mode clicks
        console.log('Normal mode. Clicked tile:', tileX, tileY);
      }

    }

    

    function handleMouseMove(event) {
      if (buildMode) return;
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
      // console.log(camera.current.x, camera.current.y, camera.current.scale, event.clientX, event.clientY)
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
      const maxScale = 2.0;

      camera.current.scale = Math.max(minScale, Math.min(maxScale, camera.current.scale));

      draw();
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('wheel', handleWheel, { passive: false });




    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [buildMode, cellSize, towers]);

  return (
    <canvas
      id='game'
      ref={canvasRef}
      style={{ display: 'block' }}
    ></canvas>
  );
};

export default Render;
