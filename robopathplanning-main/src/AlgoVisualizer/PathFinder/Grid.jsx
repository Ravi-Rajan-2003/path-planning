
// Import algo helper functions
import { useEffect, useState } from "react";
import "./Grid.css";
import { dijkstra } from "./algorithms/dijkstra";
import { heuristicAlgorithm } from "./algorithms/heuristicAlgorithm";

import { getNodesInShortestPathOrder } from "./algorithms/algoHelpers";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { lightGreen, deepOrange } from "@mui/material/colors";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Bar from "../Bar/Bar";
import _ from "lodash";

  // ... (other code)
  const algorithms = {
    DIJKSTRA: "Dijkstra's Algorithm",
    AS: "A* Search",
   
    GBFS: "Genetic Algorithm",
    GENETIC:"Genetic Hybrid Algorithm"
  };
  function Grid() {
    // ... (existing state variables)
    const [nodes, setNodes] = useState([]);
    const [startPosition, setStartPosition] = useState({ row: 10, col: 5 });
    const [finishPosition, setFinishPosition] = useState({
      row: 10,
      col: numColumns - 5,
    });
    const [mouseState, setMouseState] = useState({
      isMouseDown: false,
      nodeType: "",
    });
    const [isRestartDisabled, setIsRestartDisabled] = useState(true);
    const [isVisButnDisabled, setIsVisButnDisabled] = useState(false);
    const [algorithmName, setAlgorithmName] = useState("DIJKSTRA");
    const [algorithmSpeed, setAlgorithmSpeed] = useState(10);
    const [totalPathLength, setTotalPathLength] = useState(0);
  
    useEffect(() => {
      setNodes(createInitialNodes(numColumns, 20));
  
      const handleResize = () => {
        const newNumColumns = calculateColumns();
        setFinishPosition({ row: 10, col: newNumColumns - 5 });
        if (newNumColumns !== numColumns) {
          setNodes(createInitialNodes(newNumColumns, 20));
        }
      };
  
      window.addEventListener("resize", handleResize);
  
      // Clean up the event listener on unmount
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [isRestartDisabled]);
  
    // Gets the node type on mouse down
    const activateMouseState = async (node) => {
      const { row, col } = node;
      const nodeType = _.isEqual({ row, col }, startPosition)
        ? "start"
        : _.isEqual({ row, col }, finishPosition)
        ? "finish"
        : "wall";
  
      setMouseState({ isMouseDown: true, nodeType: nodeType });
    };
    // Updates the node's row and column on mouse enter
    const getCoordinates = async (node) => {
      const { row, col } = node;
      if (mouseState.isMouseDown && !isVisButnDisabled) {
        if (
          mouseState.nodeType === "wall" &&
          !_.isEqual({ row, col }, startPosition) &&
          !_.isEqual({ row, col }, finishPosition)
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-wall";
          updateNodeProperty(node.row, node.col, "wall", true);
        } else if (
          mouseState.nodeType === "start" &&
          !node.wall &&
          !_.isEqual({ row, col }, finishPosition)
        ) {
          setStartPosition({ row: node.row, col: node.col });
        } else if (
          mouseState.nodeType === "finish" &&
          !node.wall &&
          !_.isEqual({ row, col }, startPosition)
        ) {
          setFinishPosition({ row: node.row, col: node.col });
        }
      }
    };
    // Stops getCoordinates() when mouse is up
    const deactivateMouseState = () => {
      setMouseState({ isMouseDown: false, nodeType: "" });
    };
  
    // Updates a given prop of a given node
    const updateNodeProperty = async (row, col, propName, propValue) => {
      setNodes((prevNodes) => {
        return prevNodes.map((nodeRow, rowIndex) => {
          return nodeRow.map((node, colIndex) => {
            if (rowIndex === row && colIndex === col) {
              // Update the property of the target node
              return { ...node, [propName]: propValue };
            }
            return node;
          });
        });
      });
    };
  
    const startAlgorithm = async () => {
      let visitedNodesInOrder = [];
      let nodesInShortestPathOrder = [];
  
      if (algorithms.hasOwnProperty(algorithmName)) {
        switch (algorithmName) {
          // ... (other cases)
          case "DIJKSTRA":
            visitedNodesInOrder = dijkstra(nodes, startPosition, finishPosition);
            break;
          case "AS":
            visitedNodesInOrder = heuristicAlgorithm(
              nodes,
              startPosition,
              finishPosition,
              "astar"
            );
            break;
       
          case "GBFS":
            visitedNodesInOrder = heuristicAlgorithm(
              nodes,
              startPosition,
              finishPosition,
              "gen");
              break;
          case "GENETIC": // New case for genetic algorithm
            visitedNodesInOrder = geneticAlgorithm();
            animateGeneticAlgorithm(visitedNodesInOrder);
            return; 
          
  
          default:
            break;
        }
      }
  
      setIsVisButnDisabled(true);
      setMouseState({ isMouseDown: false, nodeType: "" });
      updateIconsAnimation("icons-pointer-event");
  
      if (algorithmName !== "GENETIC") {
        nodesInShortestPathOrder = getNodesInShortestPathOrder(
          nodes[finishPosition.row][finishPosition.col]
        );
        animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
      } else {
        animateGeneticAlgorithm(visitedNodesInOrder);
      }
    };
    const animateDijkstra = (visitedNodesInOrder, nodesInShortestPathOrder) => {
        setIsRestartDisabled(true);
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
          if (i === visitedNodesInOrder.length) {
            setTimeout(() => {
              animateShortestPath(nodesInShortestPathOrder);
            }, algorithmSpeed * i);
            return;
          }
          setTimeout(() => {
            const node = visitedNodesInOrder[i];
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node current-node";
            setTimeout(() => {
              document.getElementById(`node-${node.row}-${node.col}`).className =
                "node node-visited";
            }, algorithmSpeed);
          }, algorithmSpeed * i);
        }
      };
    
      const animateShortestPath = (nodesInShortestPathOrder) => {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
          setTimeout(() => {
            const node = nodesInShortestPathOrder[i];
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-shortest-path";
          }, 50 * i);
        }
        setTotalPathLength(nodesInShortestPathOrder.length-1);
        setTimeout(() => {
          setIsRestartDisabled(false);
        }, 50 * nodesInShortestPathOrder.length);
        
      };
    
      const restartAlgorithm = () => {
        clearAnimation();
        setIsVisButnDisabled(false);
        updateIconsAnimation("icons-animation");
      };
    
      const clearAnimation = () => {
        for (const row of nodes) {
          for (const node of row) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node";
          }
        }
      };
    
      // Update start/finish icons' css
      const updateIconsAnimation = (className) => {
        document
          .getElementById(`node-${startPosition.row}-${startPosition.col}`)
          .querySelector("div").className = `icon ${className}`;
        document
          .getElementById(`node-${finishPosition.row}-${finishPosition.col}`)
          .querySelector("div").className = `icon ${className}`;
      };
    // ... (other functions)
  
    // Modified geneticAlgorithm function to return the visited nodes
    function geneticAlgorithm() {
      let population = Array.from({ length: POPULATION_SIZE }, () =>
        createPath(numColumns, 20)
      );
      let visitedNodes = [];
      for (let generation = 0; generation < NUM_GENERATIONS; generation++) {
        population.sort((a, b) => fitness(a) - fitness(b));
        const selectedPaths = population.slice(
          0,
          Math.floor(0.2 * POPULATION_SIZE)
        );
        const newPopulation = [...selectedPaths];
  
        while (newPopulation.length < POPULATION_SIZE) {
          const parent1 = selectedPaths[getRandomInt(0, selectedPaths.length - 1)];
          const parent2 = selectedPaths[getRandomInt(0, selectedPaths.length - 1)];
          const crossoverPoint = getRandomInt(
            1,
            Math.min(parent1.length, parent2.length) - 1
          );
          const child = parent1
            .slice(0, crossoverPoint)
            .concat(parent2.slice(crossoverPoint));
          newPopulation.push(mutatePath(child));
          
        }
  
        population = newPopulation;
        const currentState = _.cloneDeep(newPopulation);
    visitedNodes.push(currentState);
      }
  
      // Find the best path
      const bestPath = population.reduce(
        (minPath, path) =>
          fitness(path) < fitness(minPath) ? path : minPath,
        population[0]
      );
  
      console.log("Best path:", bestPath);
      console.log("Fitness:", fitness(bestPath));
      setTotalPathLength(bestPath.length-1);
      console.log(totalPathLength);
  
      // Visualize the best path
      // displayGeneticAlgorithmPath(bestPath);
  
      return visitedNodes;
    }
  
   
    const animateGeneticAlgorithm = async (visitedNodes) => {
      for (let i = 0; i < visitedNodes.length; i++) {
        setTimeout(() => {
          const currentPopulation = visitedNodes[i];
          visualizeGeneticAlgorithm(currentPopulation);
        }, algorithmSpeed * i);
      }
    };
    
    const visualizeGeneticAlgorithm = (population) => {
      // Clear the previous visualization
      clearAnimation();
    
      // Visualize the current state of the population
      for (const path of population) {
        for (const node of path) {
          const { row, col } = node;
          const element = document.getElementById(`node-${row}-${col}`);
          if (element) {
            element.className = "node node-visited";
          }
        }
      }
    };
    
    // ... (other functions)
  
    return (
      // ... (existing JSX structure)
      <div className="container">
      <div className="grid">
        <Bar
          startAlgorithm={startAlgorithm}
          restartAlgorithm={restartAlgorithm}
          setAlgorithmName={setAlgorithmName}
          isVisButnDisabled={isVisButnDisabled}
          isRestartDisabled={isRestartDisabled}
          setAlgorithmSpeed={setAlgorithmSpeed}
          algorithmCategory="pathFinding"
          algorithms={algorithms}
          sliderParams={{
            label: "Speed",
            step: 1,
            min: 1,
            max: 3,
            auto: 3,
            display: "off",
          }}
          totalPathLength={totalPathLength}
        ></Bar>
        <div className="nodes">
          {nodes.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((node, nodeIndex) => (
                <div
                  key={nodeIndex}
                  id={`node-${node.row}-${node.col}`}
                  className="node"
                  onMouseDown={() => activateMouseState(node)}
                  onMouseUp={() => deactivateMouseState()}
                  onMouseEnter={() => getCoordinates(node)}
                >
                  {node.row === startPosition.row &&
                    node.col === startPosition.col && (
                      <div className="icon icons-animation">
                        <PersonPinIcon
                          sx={{ color: lightGreen[700] }}
                          fontSize="medium"
                        />
                      </div>
                    )}
                  {node.row === finishPosition.row &&
                    node.col === finishPosition.col && (
                      <div className="icon icons-animation">
                        <LocationOnIcon
                          sx={{ color: deepOrange[500] }}
                          fontSize="medium"
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
    </div>
    );
  }
  export default Grid;
  const calculateColumns = () => {
    const screenWidth = window.innerWidth;
    const columnWidth = 24.5;
    return Math.floor(screenWidth / columnWidth);
  };
  
  const numColumns = calculateColumns();
  
  const createInitialNodes = (numColumns, numRows) => {
    const initialNodes = [];
    for (let row = 0; row < numRows; row++) {
      const rowNodes = [];
      for (let col = 0; col < numColumns; col++) {
        const currentNode = {
          col,
          row,
          distance: Infinity,
          previousNode: null,
          wall: false,
          heuristic: Infinity,
          fScore: Infinity,
        };
        rowNodes.push(currentNode);
      }
      initialNodes.push(rowNodes);
    }
    return initialNodes;
  };
  // ... (other helper functions)
  function getRandomInt(min, max) {
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const POPULATION_SIZE = 100;
const NUM_GENERATIONS = 100;
function createPath(numColumns,numRows) {
  // Create a random path, for example, an array of random nodes
  const path = [];
  for (let i = 0; i < numColumns; i++) {
    const randomNode = { x: getRandomInt(0, numColumns - 1), y: getRandomInt(0, numRows - 1) };
    path.push(randomNode);
  }
  return path;
}

function fitness(path) {
  // Calculate the fitness of a path, for example, the total distance between nodes
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    const node1 = path[i - 1];
    const node2 = path[i];
    const distance = Math.sqrt((node2.x - node1.x) ** 2 + (node2.y - node1.y) ** 2);
    totalDistance += distance;
  }
  return totalDistance;
}

function mutatePath(path) {
  // Mutate a path, for example, swap two random nodes
  const mutatedPath = [...path];
  const index1 = getRandomInt(0, mutatedPath.length - 1);
  let index2 = getRandomInt(0, mutatedPath.length - 1);
  while (index2 === index1) {
    index2 = getRandomInt(0, mutatedPath.length - 1);
  }
  // Swap nodes
  const temp = mutatedPath[index1];
  mutatedPath[index1] = mutatedPath[index2];
  mutatedPath[index2] = temp;
  return mutatedPath;
}
  

  

// import { useEffect, useState } from "react";
// import "./Grid.css";
// import { dijkstra } from "./algorithms/dijkstra";
// import { heuristicAlgorithm } from "./algorithms/heuristicAlgorithm";
// import { bfs } from "./algorithms/bfs";
// import { dfs } from "./algorithms/dfs";
// import { getNodesInShortestPathOrder } from "./algorithms/algoHelpers";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
// import { lightGreen, deepOrange } from "@mui/material/colors";
// import PersonPinIcon from "@mui/icons-material/PersonPin";
// import Bar from "../Bar/Bar";
// import _ from "lodash";
// import Footer from "../Footer/Footer";
// import data from "../Common/data.json";

// const algorithms = {
//   DIJKSTRA: "Dijkstra's Algorithm",
//   AS: "A* Search",
//   BFS: "Breadth-first search",
//   DFS: "Depth-first search",
//   GBFS: "Greedy Best-First Search",
//   GENETIC:"GEN",
// };

// function Grid() {
//   const [nodes, setNodes] = useState([]);
//   const [startPosition, setStartPosition] = useState({ row: 10, col: 5 });
//   const [finishPosition, setFinishPosition] = useState({
//     row: 10,
//     col: numColumns - 5,
//   });
//   const [mouseState, setMouseState] = useState({
//     isMouseDown: false,
//     nodeType: "",
//   });
//   const [isRestartDisabled, setIsRestartDisabled] = useState(true);
//   const [isVisButnDisabled, setIsVisButnDisabled] = useState(false);
//   const [algorithmName, setAlgorithmName] = useState("DIJKSTRA");
//   const [algorithmSpeed, setAlgorithmSpeed] = useState(10);
//   const [totalPathLength, setTotalPathLength] = useState(0);

//   useEffect(() => {
//     setNodes(createInitialNodes(numColumns, 20));

//     const handleResize = () => {
//       const newNumColumns = calculateColumns();
//       setFinishPosition({ row: 10, col: newNumColumns - 5 });
//       if (newNumColumns !== numColumns) {
//         setNodes(createInitialNodes(newNumColumns, 20));
//       }
//     };

//     window.addEventListener("resize", handleResize);

//     // Clean up the event listener on unmount
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, [isRestartDisabled]);

//   // Gets the node type on mouse down
//   const activateMouseState = async (node) => {
//     const { row, col } = node;
//     const nodeType = _.isEqual({ row, col }, startPosition)
//       ? "start"
//       : _.isEqual({ row, col }, finishPosition)
//       ? "finish"
//       : "wall";

//     setMouseState({ isMouseDown: true, nodeType: nodeType });
//   };
//   // Updates the node's row and column on mouse enter
//   const getCoordinates = async (node) => {
//     const { row, col } = node;
//     if (mouseState.isMouseDown && !isVisButnDisabled) {
//       if (
//         mouseState.nodeType === "wall" &&
//         !_.isEqual({ row, col }, startPosition) &&
//         !_.isEqual({ row, col }, finishPosition)
//       ) {
//         document.getElementById(`node-${node.row}-${node.col}`).className =
//           "node node-wall";
//         updateNodeProperty(node.row, node.col, "wall", true);
//       } else if (
//         mouseState.nodeType === "start" &&
//         !node.wall &&
//         !_.isEqual({ row, col }, finishPosition)
//       ) {
//         setStartPosition({ row: node.row, col: node.col });
//       } else if (
//         mouseState.nodeType === "finish" &&
//         !node.wall &&
//         !_.isEqual({ row, col }, startPosition)
//       ) {
//         setFinishPosition({ row: node.row, col: node.col });
//       }
//     }
//   };
//   // Stops getCoordinates() when mouse is up
//   const deactivateMouseState = () => {
//     setMouseState({ isMouseDown: false, nodeType: "" });
//   };

//   // Updates a given prop of a given node
//   const updateNodeProperty = async (row, col, propName, propValue) => {
//     setNodes((prevNodes) => {
//       return prevNodes.map((nodeRow, rowIndex) => {
//         return nodeRow.map((node, colIndex) => {
//           if (rowIndex === row && colIndex === col) {
//             // Update the property of the target node
//             return { ...node, [propName]: propValue };
//           }
//           return node;
//         });
//       });
//     });
//   };

//   const startAlgorithm = async () => {
//     let visitedNodesInOrder = [];
//     if (algorithms.hasOwnProperty(algorithmName)) {
//       switch (algorithmName) {
//         case "DIJKSTRA":
//           visitedNodesInOrder = dijkstra(nodes, startPosition, finishPosition);
//           break;
//         case "AS":
//           visitedNodesInOrder = heuristicAlgorithm(
//             nodes,
//             startPosition,
//             finishPosition,
//             "astar"
//           );
//           break;
//         case "BFS":
//           visitedNodesInOrder = bfs(nodes, startPosition, finishPosition);
//           break;
//         case "DFS":
//           visitedNodesInOrder = dfs(nodes, startPosition, finishPosition);
//           break;
//         case "GBFS":
//           visitedNodesInOrder = heuristicAlgorithm(
//             nodes,
//             startPosition,
//             finishPosition,
//             "gbfs"
//           );
//           break;
//         default:
//           break;
//       }
//     }
//     setIsVisButnDisabled(true);
//     setMouseState({ isMouseDown: false, nodeType: "" });
//     updateIconsAnimation("icons-pointer-event");

//     const nodesInShortestPathOrder = getNodesInShortestPathOrder(
//       nodes[finishPosition.row][finishPosition.col]
//     )
   
//     console.log(nodesInShortestPathOrder.length);
//     animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
//   };

//   const animateDijkstra = (visitedNodesInOrder, nodesInShortestPathOrder) => {
//     setIsRestartDisabled(true);
//     for (let i = 0; i <= visitedNodesInOrder.length; i++) {
//       if (i === visitedNodesInOrder.length) {
//         setTimeout(() => {
//           animateShortestPath(nodesInShortestPathOrder);
//         }, algorithmSpeed * i);
//         return;
//       }
//       setTimeout(() => {
//         const node = visitedNodesInOrder[i];
//         document.getElementById(`node-${node.row}-${node.col}`).className =
//           "node current-node";
//         setTimeout(() => {
//           document.getElementById(`node-${node.row}-${node.col}`).className =
//             "node node-visited";
//         }, algorithmSpeed);
//       }, algorithmSpeed * i);
//     }
//   };

//   const animateShortestPath = (nodesInShortestPathOrder) => {
//     for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
//       setTimeout(() => {
//         const node = nodesInShortestPathOrder[i];
//         document.getElementById(`node-${node.row}-${node.col}`).className =
//           "node node-shortest-path";
//       }, 50 * i);
//     }
//     setTimeout(() => {
//       setIsRestartDisabled(false);
//     }, 50 * nodesInShortestPathOrder.length);
    
//   };

//   const restartAlgorithm = () => {
//     clearAnimation();
//     setIsVisButnDisabled(false);
//     updateIconsAnimation("icons-animation");
//   };

//   const clearAnimation = () => {
//     for (const row of nodes) {
//       for (const node of row) {
//         document.getElementById(`node-${node.row}-${node.col}`).className =
//           "node";
//       }
//     }
//   };

//   // Update start/finish icons' css
//   const updateIconsAnimation = (className) => {
//     document
//       .getElementById(`node-${startPosition.row}-${startPosition.col}`)
//       .querySelector("div").className = `icon ${className}`;
//     document
//       .getElementById(`node-${finishPosition.row}-${finishPosition.col}`)
//       .querySelector("div").className = `icon ${className}`;
//   };

//   return (
//     <div className="container">
//       <div className="grid">
//         <Bar
//           startAlgorithm={startAlgorithm}
//           restartAlgorithm={restartAlgorithm}
//           setAlgorithmName={setAlgorithmName}
//           isVisButnDisabled={isVisButnDisabled}
//           isRestartDisabled={isRestartDisabled}
//           setAlgorithmSpeed={setAlgorithmSpeed}
//           algorithmCategory="pathFinding"
//           algorithms={algorithms}
//           sliderParams={{
//             label: "Speed",
//             step: 1,
//             min: 1,
//             max: 3,
//             auto: 3,
//             display: "off",
//           }}
//           totalPathLength={totalPathLength}
//         ></Bar>
//         <div className="nodes">
//           {nodes.map((row, rowIndex) => (
//             <div key={rowIndex} className="row">
//               {row.map((node, nodeIndex) => (
//                 <div
//                   key={nodeIndex}
//                   id={`node-${node.row}-${node.col}`}
//                   className="node"
//                   onMouseDown={() => activateMouseState(node)}
//                   onMouseUp={() => deactivateMouseState()}
//                   onMouseEnter={() => getCoordinates(node)}
//                 >
//                   {node.row === startPosition.row &&
//                     node.col === startPosition.col && (
//                       <div className="icon icons-animation">
//                         <PersonPinIcon
//                           sx={{ color: lightGreen[700] }}
//                           fontSize="medium"
//                         />
//                       </div>
//                     )}
//                   {node.row === finishPosition.row &&
//                     node.col === finishPosition.col && (
//                       <div className="icon icons-animation">
//                         <LocationOnIcon
//                           sx={{ color: deepOrange[500] }}
//                           fontSize="medium"
//                         />
//                       </div>
//                     )}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//       {data[algorithmName] && (
//         <Footer
//           title={algorithms[algorithmName]}
//           desc={data[algorithmName].desc}
//           howItWorks={data[algorithmName].howItWorks}
//           timeComp={data[algorithmName].timeComp}
//         ></Footer>
//       )}
//     </div>
//   );
// }

// export default Grid;

// const calculateColumns = () => {
//   const screenWidth = window.innerWidth;
//   const columnWidth = 24.5;
//   return Math.floor(screenWidth / columnWidth);
// };

// const numColumns = calculateColumns();

// const createInitialNodes = (numColumns, numRows) => {
//   const initialNodes = [];
//   for (let row = 0; row < numRows; row++) {
//     const rowNodes = [];
//     for (let col = 0; col < numColumns; col++) {
//       const currentNode = {
//         col,
//         row,
//         distance: Infinity,
//         previousNode: null,
//         wall: false,
//         heuristic: Infinity,
//         fScore: Infinity,
//       };
//       rowNodes.push(currentNode);
//     }
//     initialNodes.push(rowNodes);
//   }
//   return initialNodes;
// };
// import { useEffect, useState } from "react";
// import "./Grid.css";
// import { dijkstra } from "./algorithms/dijkstra";
// import { heuristicAlgorithm } from "./algorithms/heuristicAlgorithm";
// import { bfs } from "./algorithms/bfs";
// import { dfs } from "./algorithms/dfs";
// import { getNodesInShortestPathOrder } from "./algorithms/algoHelpers";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
// import { lightGreen, deepOrange } from "@mui/material/colors";
// import PersonPinIcon from "@mui/icons-material/PersonPin";
// import Bar from "../Bar/Bar";
// import _ from "lodash";
// import Footer from "../Footer/Footer";
// import data from "../Common/data.json";

// const algorithms = {
//   DIJKSTRA: "Dijkstra's Algorithm",
//   AS: "A* Search",
//   BFS: "Breadth-first search",
//   DFS: "Depth-first search",
//   GBFS: "Greedy Best-First Search",
  
// };
// const POPULATION_SIZE = 100;
// const NUM_GENERATIONS = 100;
// function createPath(numColumns,numRows) {
//   // Create a random path, for example, an array of random nodes
//   const path = [];
//   for (let i = 0; i < numColumns; i++) {
//     const randomNode = { x: getRandomInt(0, numColumns - 1), y: getRandomInt(0, numRows - 1) };
//     path.push(randomNode);
//   }
//   return path;
// }

// function fitness(path) {
//   // Calculate the fitness of a path, for example, the total distance between nodes
//   let totalDistance = 0;
//   for (let i = 1; i < path.length; i++) {
//     const node1 = path[i - 1];
//     const node2 = path[i];
//     const distance = Math.sqrt((node2.x - node1.x) ** 2 + (node2.y - node1.y) ** 2);
//     totalDistance += distance;
//   }
//   return totalDistance;
// }

// function mutatePath(path) {
//   // Mutate a path, for example, swap two random nodes
//   const mutatedPath = [...path];
//   const index1 = getRandomInt(0, mutatedPath.length - 1);
//   let index2 = getRandomInt(0, mutatedPath.length - 1);
//   while (index2 === index1) {
//     index2 = getRandomInt(0, mutatedPath.length - 1);
//   }
//   // Swap nodes
//   const temp = mutatedPath[index1];
//   mutatedPath[index1] = mutatedPath[index2];
//   mutatedPath[index2] = temp;
//   return mutatedPath;
// }


// function Grid() {
//     const [nodes, setNodes] = useState([]);
//     const [startPosition, setStartPosition] = useState({ row: 10, col: 5 });
//     const [finishPosition, setFinishPosition] = useState({
//       row: 10,
//       col: numColumns - 5,
//     });
//     const [mouseState, setMouseState] = useState({
//       isMouseDown: false,
//       nodeType: "",
//     });
//     const [isRestartDisabled, setIsRestartDisabled] = useState(true);
//     const [isVisButnDisabled, setIsVisButnDisabled] = useState(false);
//     const [algorithmName, setAlgorithmName] = useState("DIJKSTRA");
//     const [algorithmSpeed, setAlgorithmSpeed] = useState(10);
//     const [totalPathLength, setTotalPathLength] = useState(0);
  
//     useEffect(() => {
//       setNodes(createInitialNodes(numColumns, 20));
  
//       const handleResize = () => {
//         const newNumColumns = calculateColumns();
//         setFinishPosition({ row: 10, col: newNumColumns - 5 });
//         if (newNumColumns !== numColumns) {
//           setNodes(createInitialNodes(newNumColumns, 20));
//         }
//       };
  
//       window.addEventListener("resize", handleResize);
  
//       // Clean up the event listener on unmount
//       return () => {
//         window.removeEventListener("resize", handleResize);
//       };
//     }, [isRestartDisabled]);
  
//     // Gets the node type on mouse down
//     const activateMouseState = async (node) => {
//       const { row, col } = node;
//       const nodeType = _.isEqual({ row, col }, startPosition)
//         ? "start"
//         : _.isEqual({ row, col }, finishPosition)
//         ? "finish"
//         : "wall";
  
//       setMouseState({ isMouseDown: true, nodeType: nodeType });
//     };
//     // Updates the node's row and column on mouse enter
//     const getCoordinates = async (node) => {
//       const { row, col } = node;
//       if (mouseState.isMouseDown && !isVisButnDisabled) {
//         if (
//           mouseState.nodeType === "wall" &&
//           !_.isEqual({ row, col }, startPosition) &&
//           !_.isEqual({ row, col }, finishPosition)
//         ) {
//           document.getElementById(`node-${node.row}-${node.col}`).className =
//             "node node-wall";
//           updateNodeProperty(node.row, node.col, "wall", true);
//         } else if (
//           mouseState.nodeType === "start" &&
//           !node.wall &&
//           !_.isEqual({ row, col }, finishPosition)
//         ) {
//           setStartPosition({ row: node.row, col: node.col });
//         } else if (
//           mouseState.nodeType === "finish" &&
//           !node.wall &&
//           !_.isEqual({ row, col }, startPosition)
//         ) {
//           setFinishPosition({ row: node.row, col: node.col });
//         }
//       }
//     };
//     // Stops getCoordinates() when mouse is up
//     const deactivateMouseState = () => {
//       setMouseState({ isMouseDown: false, nodeType: "" });
//     };
  
//     // Updates a given prop of a given node
//     const updateNodeProperty = async (row, col, propName, propValue) => {
//       setNodes((prevNodes) => {
//         return prevNodes.map((nodeRow, rowIndex) => {
//           return nodeRow.map((node, colIndex) => {
//             if (rowIndex === row && colIndex === col) {
//               // Update the property of the target node
//               return { ...node, [propName]: propValue };
//             }
//             return node;
//           });
//         });
//       });
//     };
  
//     const startAlgorithm = async () => {
//       let visitedNodesInOrder = [];
//       if (algorithms.hasOwnProperty(algorithmName)) {
//         switch (algorithmName) {
//           case "DIJKSTRA":
//             visitedNodesInOrder = dijkstra(nodes, startPosition, finishPosition);
//             break;
//           case "AS":
//             visitedNodesInOrder = heuristicAlgorithm(
//               nodes,
//               startPosition,
//               finishPosition,
//               "astar"
//             );
//             break;
//           case "BFS":
//             visitedNodesInOrder = bfs(nodes, startPosition, finishPosition);
//             break;
//           case "DFS":
//             visitedNodesInOrder = dfs(nodes, startPosition, finishPosition);
//             break;
//           case "GBFS":
//             visitedNodesInOrder = heuristicAlgorithm(
//               nodes,
//               startPosition,
//               finishPosition,
//               "gbfs"
//             );
//             break;
//           default:
//             break;
//         }
//       }
//       setIsVisButnDisabled(true);
//       setMouseState({ isMouseDown: false, nodeType: "" });
//       updateIconsAnimation("icons-pointer-event");
  
//       const nodesInShortestPathOrder = getNodesInShortestPathOrder(
//         nodes[finishPosition.row][finishPosition.col]
//       )
     
//       console.log(nodesInShortestPathOrder.length);
//       animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
//     };
  
//     const animateDijkstra = (visitedNodesInOrder, nodesInShortestPathOrder) => {
//       setIsRestartDisabled(true);
//       for (let i = 0; i <= visitedNodesInOrder.length; i++) {
//         if (i === visitedNodesInOrder.length) {
//           setTimeout(() => {
//             animateShortestPath(nodesInShortestPathOrder);
//           }, algorithmSpeed * i);
//           return;
//         }
//         setTimeout(() => {
//           const node = visitedNodesInOrder[i];
//           document.getElementById(`node-${node.row}-${node.col}`).className =
//             "node current-node";
//           setTimeout(() => {
//             document.getElementById(`node-${node.row}-${node.col}`).className =
//               "node node-visited";
//           }, algorithmSpeed);
//         }, algorithmSpeed * i);
//       }
//     };
  
//     const animateShortestPath = (nodesInShortestPathOrder) => {
//       for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
//         setTimeout(() => {
//           const node = nodesInShortestPathOrder[i];
//           document.getElementById(`node-${node.row}-${node.col}`).className =
//             "node node-shortest-path";
//         }, 50 * i);
//       }
//       setTimeout(() => {
//         setIsRestartDisabled(false);
//       }, 50 * nodesInShortestPathOrder.length);
      
//     };
  
//     const restartAlgorithm = () => {
//       clearAnimation();
//       setIsVisButnDisabled(false);
//       updateIconsAnimation("icons-animation");
//     };
  
//     const clearAnimation = () => {
//       for (const row of nodes) {
//         for (const node of row) {
//           document.getElementById(`node-${node.row}-${node.col}`).className =
//             "node";
//         }
//       }
//     };
  
//     // Update start/finish icons' css
//     const updateIconsAnimation = (className) => {
//       document
//         .getElementById(`node-${startPosition.row}-${startPosition.col}`)
//         .querySelector("div").className = `icon ${className}`;
//       document
//         .getElementById(`node-${finishPosition.row}-${finishPosition.col}`)
//         .querySelector("div").className = `icon ${className}`;
//     };
  
//     const runGeneticAlgorithm = () => {
//       // const population = geneticAlgorithm();
//       const bestPath = geneticAlgorithm();
//       // Display the best path on the grid
//       // displayGeneticAlgorithmPath(population);
//       animateGeneticAlgorithm(bestPath);
//     };
  
//     const displayGeneticAlgorithmPath = (path) => {
//       // Clear existing animations
//       clearAnimation();
  
//       // Display the path on the grid
//       for (let i = 0; i < path.length; i++) {
//         setTimeout(() => {
//           const point = path[i];
//           document.getElementById(`node-${point.x}-${point.y}`).className =
//             "node node-genetic-algorithm";
//         }, 50 * i);
//       }
//     };
//     const animateGeneticAlgorithm = (path) => {
//       // Clear existing animations
//       clearAnimation();
  
//       // Display the path on the grid with animation
//       for (let i = 0; i < path.length; i++) {
//         setTimeout(() => {
//           const point = path[i];
//           document.getElementById(`node-${point.x}-${point.y}`).className =
//             "node node-genetic-algorithm";
//         }, 50 * i);
//       }
  
//       // Display the start and finish icons with animation
//       setTimeout(() => {
//         updateIconsAnimation("icons-animation");
//       }, 50 * path.length);
//     };
  
//     // ... (existing functions like startAlgorithm, animateDijkstra, animateShortestPath, restartAlgorithm, clearAnimation, updateIconsAnimation)
  
//     return (
//       <div className="container">
//         <div className="grid">
//           <Bar
//             startAlgorithm={startAlgorithm}
//             restartAlgorithm={restartAlgorithm}
//             runGeneticAlgorithm={runGeneticAlgorithm} // New function for genetic algorithm
//             setAlgorithmName={setAlgorithmName}
//             isVisButnDisabled={isVisButnDisabled}
//             isRestartDisabled={isRestartDisabled}
//             setAlgorithmSpeed={setAlgorithmSpeed}
//             algorithmCategory="pathFinding"
//             algorithms={algorithms}
//             sliderParams={{
//               label: "Speed",
//               step: 1,
//               min: 1,
//               max: 3,
//               auto: 3,
//               display: "off",
//             }}
//           ></Bar>
//           <div className="nodes">
//             {nodes.map((row, rowIndex) => (
//               <div key={rowIndex} className="row">
//                 {row.map((node, nodeIndex) => (
//                   <div
//                     key={nodeIndex}
//                     id={`node-${node.col}-${node.row}`} // Swap x and y for consistency
//                     className="node"
//                     onMouseDown={() => activateMouseState(node)}
//                     onMouseUp={() => deactivateMouseState()}
//                     onMouseEnter={() => getCoordinates(node)}
//                   >
//                     {node.row === startPosition.row &&
//                       node.col === startPosition.col && (
//                         <div className="icon icons-animation">
//                           <PersonPinIcon
//                             sx={{ color: lightGreen[700] }}
//                             fontSize="medium"
//                           />
//                         </div>
//                       )}
//                     {node.row === finishPosition.row &&
//                       node.col === finishPosition.col && (
//                         <div className="icon icons-animation">
//                           <LocationOnIcon
//                             sx={{ color: deepOrange[500] }}
//                             fontSize="medium"
//                           />
//                         </div>
//                       )}
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>
//         {data[algorithmName] && (
//           <Footer
//             title={algorithms[algorithmName]}
//             desc={data[algorithmName].desc}
//             howItWorks={data[algorithmName].howItWorks}
//             timeComp={data[algorithmName].timeComp}
//           ></Footer>
//         )}
//       </div>
//     );
//   }
  
//   export default Grid;
  
//   const calculateColumns = () => {
//     const screenWidth = window.innerWidth;
//     const columnWidth = 24.5;
//     return Math.floor(screenWidth / columnWidth);
//   };
  
//   const numColumns = calculateColumns();
  
//   const createInitialNodes = (numColumns, numRows) => {
//     const initialNodes = [];
//     for (let row = 0; row < numRows; row++) {
//       const rowNodes = [];
//       for (let col = 0; col < numColumns; col++) {
//         const currentNode = {
//           col,
//           row,
//           distance: Infinity,
//           previousNode: null,
//           wall: false,
//           heuristic: Infinity,
//           fScore: Infinity,
//         };
//         rowNodes.push(currentNode);
//       }
//       initialNodes.push(rowNodes);
//     }
//     return initialNodes;
//   };
  
  
//   // Genetic algorithm functions
//   function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
//   }
  
//   // ... (your existing genetic algorithm functions)
  
//   // Modified geneticAlgorithm function to return the best path
//   function geneticAlgorithm() {
//     let population = Array.from({ length: POPULATION_SIZE }, () => createPath());
  
//     for (let generation = 0; generation < NUM_GENERATIONS; generation++) {
//       population.sort((a, b) => fitness(a) - fitness(b));
//       const selectedPaths = population.slice(0, Math.floor(0.2 * POPULATION_SIZE));
//       const newPopulation = [...selectedPaths];
  
//       while (newPopulation.length < POPULATION_SIZE) {
//         const parent1 = selectedPaths[getRandomInt(0, selectedPaths.length - 1)];
//         const parent2 = selectedPaths[getRandomInt(0, selectedPaths.length - 1)];
//         const crossoverPoint = getRandomInt(1, Math.min(parent1.length, parent2.length) - 1);
//         const child = parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
//         newPopulation.push(mutatePath(child));
//       }
  
//       population = newPopulation;
//     }
  
//     // Find the best path
//     const bestPath = population.reduce((minPath, path) =>
//       fitness(path) < fitness(minPath) ? path : minPath, population[0]);
  
//     console.log("Best path:", bestPath);
//     console.log("Fitness:", fitness(bestPath));
  
//     return bestPath;
//   }
  