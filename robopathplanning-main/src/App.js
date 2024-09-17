import "./App.css";
import Grid from "./AlgoVisualizer/PathFinder/Grid";


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/algoVisualizer" element={<Grid />} />
        <Route path="/pathVisualizer" element={<Grid />} />
        <Route path="*" element={<Navigate to="/algoVisualizer" />} />
        
      </Routes>
    </Router>
  );
}

export default App;
