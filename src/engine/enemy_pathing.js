// cia krc A* algorithmas kad enemies surastu kur eiti vietoj mum piesti ranka
class Node {
    constructor(x, y, isPassable) {
      this.x = x;
      this.y = y;
      this.isPassable = isPassable;
      this.gCost = 0;
      this.hCost = 0;
      this.fCost = 0;
      this.parent = null;
    }
  }
  
  function findPath(bitmap, start, end) {
    const numRows = bitmap.length;
    const numCols = bitmap[0].length;

    const grid = [];
    for (let i = 0; i < numRows; i++) {
      grid[i] = [];
      for (let j = 0; j < numCols; j++) {
        const isPassable = bitmap[i][j] === 0;
        const node = new Node(i, j, isPassable);
        grid[i][j] = node;
      }
    }
  
    const openList = [];
    const closedList = [];
  
    openList.push(grid[start.x][start.y]);
  
    while (openList.length > 0) {
      let currentNode = openList[0];
      let currentIndex = 0;
  
      openList.forEach((node, index) => {
        if (node.fCost < currentNode.fCost) {
          currentNode = node;
          currentIndex = index;
        }
      });
  
      openList.splice(currentIndex, 1);
      closedList.push(currentNode);
  
      if (currentNode === grid[end.x][end.y]) {
        const path = [];
        let current = currentNode;
        while (current !== grid[start.x][start.y]) {
          path.push(current);
          current = current.parent;
        }
        return path.reverse();
      }
  
      const neighbors = [];
      const { x, y } = currentNode;
  
      if (x > 0) neighbors.push(grid[x - 1][y]);
      if (x < numRows - 1) neighbors.push(grid[x + 1][y]);
      if (y > 0) neighbors.push(grid[x][y - 1]);
      if (y < numCols - 1) neighbors.push(grid[x][y + 1]);
  
      neighbors.forEach((neighbor) => {
        if (!closedList.includes(neighbor) && neighbor.isPassable) {
          const gCost = currentNode.gCost + 1;
          const hCost = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
          const fCost = gCost + hCost;
  
          if (!openList.includes(neighbor) || gCost < neighbor.gCost) {
            neighbor.gCost = gCost;
            neighbor.hCost = hCost;
            neighbor.fCost = fCost;
            neighbor.parent = currentNode;
  
            if (!openList.includes(neighbor)) {
              openList.push(neighbor);
            }
          }
        }
      });
    }
  
    return null; 
  }
  
  
  
  export default findPath;