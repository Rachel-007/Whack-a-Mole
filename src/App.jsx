import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
// --- Game Context ---
const GameContext = createContext();

const NUM_HOLES = 6;
const INITIAL_TIME = 15;

function getRandomHole(exclude) {
  let idx = Math.floor(Math.random() * NUM_HOLES);
  if (exclude === undefined) return idx;
  while (idx === exclude) {
    idx = Math.floor(Math.random() * NUM_HOLES);
  }
  return idx;
}

export function GameProvider({ children }) {
  const [screen, setScreen] = useState("welcome"); // "welcome" | "playing"
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [moleIndex, setMoleIndex] = useState(getRandomHole());
  const [timer, setTimer] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  // Start game
  function startGame() {
    setScore(0);
    setMoleIndex(getRandomHole());
    setScreen("playing");
    setTimer(INITIAL_TIME);
    setIsActive(true);
  }

  // Restart game
  function restartGame() {
    setHighScores((prev) => (score > 0 ? [...prev, score] : prev));
    setScreen("welcome");
    setIsActive(false);
    setTimer(INITIAL_TIME);
    clearInterval(intervalRef.current);
  }

  // Whack mole
  function whackMole() {
    if (!isActive) return;
    setScore((s) => s + 1);
    setMoleIndex((idx) => getRandomHole(idx));
  }

  // Timer logic
  useEffect(() => {
    if (isActive && screen === "playing") {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, screen]);

  useEffect(() => {
    if (timer <= 0 && isActive) {
      setIsActive(false);
      clearInterval(intervalRef.current);
    }
  }, [timer, isActive]);

  return (
    <GameContext.Provider
      value={{
        screen,
        score,
        highScores,
        moleIndex,
        timer,
        isActive,
        startGame,
        restartGame,
        whackMole,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

// --- Components ---

function WelcomeScreen() {
  const { startGame, highScores } = useGame();
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h1>Whack-a-Mole!</h1>
      <p>
        Click the mole as many times as you can before the timer runs out!
        <br />
        The mole will move to a new hole each time you whack it.
      </p>
      <button onClick={startGame}>Play</button>
      {highScores.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>High Scores</h3>
          <ol>
            {highScores
              .slice()
              .sort((a, b) => b - a)
              .map((score, i) => (
                <li key={i}>{score}</li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function GameScreen() {
  const { score, moleIndex, whackMole, restartGame, timer, isActive } =
    useGame();
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Score: {score}</h2>
      <h3>Time: {timer}s</h3>
      <button onClick={restartGame}>Restart</button>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 40,
        }}
      >
        {Array.from({ length: NUM_HOLES }).map((_, idx) => (
          <Hole
            key={idx}
            hasMole={moleIndex === idx}
            onWhack={whackMole}
            disabled={!isActive}
          />
        ))}
      </div>
      {!isActive && (
        <div style={{ marginTop: 30 }}>
          <h2>Time's up!</h2>
        </div>
      )}
    </div>
  );
}

function Hole({ hasMole, onWhack, disabled }) {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        border: "2px solid #333",
        borderRadius: "50%",
        background: "#eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        cursor: hasMole && !disabled ? "pointer" : "default",
        position: "relative",
      }}
      onClick={hasMole && !disabled ? onWhack : undefined}
    >
      {hasMole ? "🐹" : ""}
    </div>
  );
}

// --- App Root ---
export default function App() {
  return (
    <GameProvider>
      <Main />
    </GameProvider>
  );
}

function Main() {
  const { screen } = useGame();
  return screen === "welcome" ? <WelcomeScreen /> : <GameScreen />;
}
