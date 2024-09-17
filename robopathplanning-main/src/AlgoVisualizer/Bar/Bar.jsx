import { Slider } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Collapse from "@mui/material/Collapse";
import "./Bar.css";
import { useState } from "react";


const btnTheme = createTheme({
  palette: {
    primary: { main: "#63617a" },
  },
});

const alertTheme = createTheme({
  palette: {
    info: { main: "#63617a" },
  },
});

const speed = { 1: 110, 2: 60, 3: 10 };

function Bar(props) {
  const {
    startAlgorithm,
    restartAlgorithm,
    setAlgorithmName,
    
    isVisButnDisabled,
    isRestartDisabled,
    setAlgorithmSpeed,
    algorithmCategory,
    algorithms,
    sliderParams,
    updateRectangles,
    totalPathLength
  } = props;

  const [open, setOpen] = useState(true);

  const handleAlgorithmSpeed = (e, value) => {
    if (algorithmCategory === "pathFinding") {
      if (speed.hasOwnProperty(value)) {
        setAlgorithmSpeed(speed[value]);
      }
    }
    if (algorithmCategory === "sorting") {
      updateRectangles(value);
    }
  };
  return (
    <div>
      <div className="bar">
        <Box
          style={{
            width: "45%",
            position: "fixed",
            top: 105,
            opacity: 0.8,
            whiteSpace: "pre-line",
            textAlign: "left",
          }}
        >
         
        </Box>
        <div className="select-menu">
          <select
            className="select"
            disabled={isVisButnDisabled}
            onChange={(event) => setAlgorithmName(event.target.value)}
          >
            {Object.entries(algorithms).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <div className="slider">
            {sliderParams.label}:
            <ThemeProvider theme={btnTheme}>
              <Slider
                aria-label={sliderParams.label}
                
                valueLabelDisplay={sliderParams.display}
                step={sliderParams.step}
                min={sliderParams.min}
                max={sliderParams.max}
                defaultValue={sliderParams.auto}
                color="primary"
                // disabled={isVisButnDisabled}
                onChange={handleAlgorithmSpeed}
              />
              <div>Shortest Path : {totalPathLength}</div>
            </ThemeProvider>
          </div>
        </div>
        <div className="buttons">
       
          <button
            className="button"
            onClick={startAlgorithm}
            disabled={isVisButnDisabled}
          >
            Visualize
          </button>
          <button
            className="button"
            onClick={restartAlgorithm}
            disabled={isRestartDisabled}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Bar;
