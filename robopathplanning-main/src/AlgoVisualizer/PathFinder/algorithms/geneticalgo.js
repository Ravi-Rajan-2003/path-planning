function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const WIDTH = 10;
  const HEIGHT = 10;
  const START = { x: 0, y: 5 };
  const GOAL = { x: 9, y: 6 };
  const OBSTACLES = [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }];
  const POPULATION_SIZE = 100;
  const MUTATION_RATE = 0.1;
  const NUM_GENERATIONS = 100;
  
  function createPath() {
    let path = [];
    let currentPos = { ...START };
  
    while (currentPos.x !== GOAL.x || currentPos.y !== GOAL.y) {
      const possibleMoves = [
        { x: currentPos.x + 1, y: currentPos.y },
        { x: currentPos.x - 1, y: currentPos.y },
        { x: currentPos.x, y: currentPos.y + 1 },
        { x: currentPos.x, y: currentPos.y - 1 },
      ];
  
      const validMoves = possibleMoves.filter(move => {
        return (
          move.x >= 0 &&
          move.x < WIDTH &&
          move.y >= 0 &&
          move.y < HEIGHT &&
          !OBSTACLES.some(obstacle => obstacle.x === move.x && obstacle.y === move.y)
        );
      });
  
      if (validMoves.length > 0) {
        const nextMove = validMoves[getRandomInt(0, validMoves.length - 1)];
        path.push(nextMove);
        currentPos = { ...nextMove };
      } else {
        break;
      }
    }
  
    return path;
  }
  
  function calculateDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) * 2 + (point1.y - point2.y) * 2);
  }
  
  function fitness(path) {
    const lastPoint = path[path.length - 1];
    const distanceToGoal = calculateDistance(lastPoint, GOAL);
    return distanceToGoal;
  }
  
  function mutatePath(path) {
    const mutatedPath = [...path];
  
    for (let i = 0; i < mutatedPath.length; i++) {
      if (Math.random() < MUTATION_RATE) {
        const possibleMoves = [
          { x: mutatedPath[i].x + 1, y: mutatedPath[i].y },
          { x: mutatedPath[i].x - 1, y: mutatedPath[i].y },
          { x: mutatedPath[i].x, y: mutatedPath[i].y + 1 },
          { x: mutatedPath[i].x, y: mutatedPath[i].y - 1 },
        ];
  
        const validMoves = possibleMoves.filter(move => {
          return (
            move.x >= 0 &&
            move.x < WIDTH &&
            move.y >= 0 &&
            move.y < HEIGHT &&
            !OBSTACLES.some(obstacle => obstacle.x === move.x && obstacle.y === move.y)
          );
        });
  
        if (validMoves.length > 0) {
          mutatedPath[i] = validMoves[getRandomInt(0, validMoves.length - 1)];
        }
      }
    }
  
    return mutatedPath;
  }
  
  function geneticAlgorithm() {
    let population = Array.from({ length: POPULATION_SIZE }, () => createPath());
  
    for (let generation = 0; generation < NUM_GENERATIONS; generation++) {
      population.sort((a, b) => fitness(a) - fitness(b));
      const selectedPaths = population.slice(0, Math.floor(0.2 * POPULATION_SIZE));
      const newPopulation = [...selectedPaths];
  
      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = selectedPaths[getRandomInt(0, selectedPaths.length - 1)];
        const parent2 = selectedPaths[getRandomInt(0, selectedPaths.length - 1)];
        const crossoverPoint = getRandomInt(1, Math.min(parent1.length, parent2.length) - 1);
        const child = parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
        newPopulation.push(mutatePath(child));
      }
  
      population = newPopulation;
    }
  
    // Find the best path
    const bestPath = population.reduce((minPath, path) =>
      fitness(path) < fitness(minPath) ? path : minPath, population[0]);
    console.log("Best path:", bestPath);
    console.log("Fitness:", fitness(bestPath));
  }
  
  geneticAlgorithm()