import { useEffect, useReducer } from "react";
import { styled } from "styled-components";
import "./App.css";

const ElevatorShaft = styled.div`
  width: 200px;
  height: 800px; /* double the height of Elevator */
  background-color: #f2f2f2;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative; /* Add this line */
`;

interface ElevatorCarProps {
  $position: number;
  $transitionDuration: number;
}

const ElevatorCar = styled.div.attrs<ElevatorCarProps>((props) => ({
  style: {
    bottom: `${(props.$position * 75) / 4}%`,
    transition: `bottom ${props.$transitionDuration}s linear`,
  },
}))`
  position: absolute;
  width: 100%;
  height: 200px; /* half the height of ElevatorShaft */
  background-color: hotpink;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover; /* Add this line to fit the background image */
  background-repeat: no-repeat; /* Add this line to prevent background image repetition */
`;

const ElevatorDoors = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  transition: transform 0.5s ease-in-out;
`;

const LeftDoor = styled.div`
  width: 50%;
  height: 100%;
  background-color: tomato;
  border-right: 1px solid #ccc;
  transform-origin: left;
  transition: transform 0.5s ease-in-out;
`;

const RightDoor = styled.div`
  width: 50%;
  height: 100%;
  background-color: orange;
  border-left: 1px solid #ccc;
  transform-origin: right;
  transition: transform 0.5s ease-in-out;
`;

const Elevator = ({
  $position,
  isDoorsOpen,
  transitionDuration,
}: {
  $position: number;
  isDoorsOpen: boolean;
  transitionDuration: number;
}) => {
  return (
    <ElevatorCar $position={$position} $transitionDuration={transitionDuration}>
      <ElevatorDoors>
        <LeftDoor style={{ transform: isDoorsOpen ? "translateX(-100%)" : "translateX(0)" }} />
        <RightDoor style={{ transform: isDoorsOpen ? "translateX(100%)" : "translateX(0)" }} />
      </ElevatorDoors>
    </ElevatorCar>
  );
};

const Controls = styled.div`
  /* styles for the controls container */
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const CallButton = styled.button`
  /* styles for the call elevator button */
  padding: 10px 20px;
  margin-bottom: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AppContainer = styled.div`
  display: flex;
  align-items: center;
`;

type Direction = "up" | "down" | "idle";

interface ElevatorState {
  currentFloor: number;
  direction: Direction;
  queue: number[];
  isDoorsOpen: boolean;
  totalFloors: number;
}

interface RequestFloorAction {
  type: "requestFloor";
  floor: number;
}

interface MoveAction {
  type: "move";
}

interface OpenDoorsAction {
  type: "openDoors";
}

interface CloseDoorsAction {
  type: "closeDoors";
}

type ElevatorAction = RequestFloorAction | MoveAction | OpenDoorsAction | CloseDoorsAction;

const initialState: ElevatorState = {
  currentFloor: 0,
  direction: "idle",
  queue: [],
  isDoorsOpen: false,
  totalFloors: 5,
};

const elevatorReducer = (state: ElevatorState, action: ElevatorAction): ElevatorState => {
  if (action.type === "requestFloor") {
    if (
      action.floor === state.currentFloor &&
      !state.isDoorsOpen &&
      state.direction === "idle" &&
      state.queue.length === 0
    ) {
      return { ...state, isDoorsOpen: true };
    }
    return {
      ...state,
      queue: [...state.queue, action.floor],
    };
  }
  if (action.type === "move") {
    if (state.queue.length === 0) {
      return { ...state, direction: "idle" };
    }
    const nextFloor = state.queue[0];
    const newQueue = state.queue.slice(1).filter((floor) => floor !== nextFloor);
    return {
      ...state,
      currentFloor: nextFloor,
      direction: newQueue.length === 0 ? "idle" : newQueue[0] > nextFloor ? "up" : "down",
      queue: newQueue,
      isDoorsOpen: false,
    };
  }
  if (action.type === "openDoors") {
    return { ...state, isDoorsOpen: true };
  }
  if (action.type === "closeDoors") {
    return { ...state, isDoorsOpen: false };
  }
  return state;
};

function App() {
  const [state, dispatch] = useReducer(elevatorReducer, initialState);

  const requestFloor = (floor: number) => {
    dispatch({ type: "requestFloor", floor });
  };

  const openDoors = () => {
    dispatch({ type: "openDoors" });
  };

  useEffect(() => {
    const closeDoors = () => {
      dispatch({ type: "closeDoors" });
    };
    if (state.isDoorsOpen) {
      const timer = setTimeout(closeDoors, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.isDoorsOpen]);

  const targetFloor = state.queue[0];
  const transitionDuration = Math.abs(state.currentFloor - targetFloor) * 0.5;

  useEffect(() => {
    const move = () => {
      dispatch({ type: "move" });
      setTimeout(() => {
        openDoors();
      }, transitionDuration * 1000);
    };
    if (state.queue.length > 0 && !state.isDoorsOpen) {
      const timer = setTimeout(move, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.queue, state.isDoorsOpen, transitionDuration]);

  // Calculate the transition duration when rendering the ElevatorCar

  return (
    <AppContainer>
      <ElevatorShaft>
        <Elevator
          $position={state.currentFloor}
          isDoorsOpen={state.isDoorsOpen}
          transitionDuration={transitionDuration}
        />
      </ElevatorShaft>
      <Controls>
        {Array.from({ length: state.totalFloors }, (_, i) => (
          <CallButton key={i} onClick={() => requestFloor(state.totalFloors - i - 1)}>
            Call elevator to floor {state.totalFloors - i}
          </CallButton>
        ))}
      </Controls>
    </AppContainer>
  );
}

export default App;
