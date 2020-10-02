import * as React from "react";
import { useState, useRef, useEffect, useReducer } from 'react';
import * as css from "./ImplementationPage.module.scss";
import useWebSocket from 'react-use-websocket';
import Anime from "react-anime";


const elevatorSystemReducer = (state, action) => {
    console.log("Reducer got ", action, state);
    switch (action.type) {
        case 'init':
            console.log(action);
            return { ...state, ...action.data };
        case 'call':
            console.log('calling to floor', { ...state, elevators: action.data });
            let elevators = action.data;
            return { ...state, elevators: elevators }
        case 'update':
            return { ...state, elevators: action.data }
        default:
            return { ...state }
    }
}

const ImplementationPage = () => {
    const [state, dispatch] = useReducer(elevatorSystemReducer, {});

    const { sendJsonMessage, lastJsonMessage } = useWebSocket('ws://localhost:3000', {
        onOpen: () => { console.log('opened'); },
        onMessage: (evt) => { dispatch(JSON.parse(evt.data)); },
        shouldReconnect: (_) => true,
    });

    useEffect(() => {
        if (lastJsonMessage) dispatch(lastJsonMessage);
    }, [lastJsonMessage])

    const callElevator = (floor: number) => {
        const message = { action: 'call', payload: floor };
        console.log("Sent message", message);
        sendJsonMessage(message);
    };

    return (
        <>
            <div id={css.elevators}>
                {state.elevators && (state.elevators).map((elevator) => <Elevator key={elevator.id} speed={state.elevatorSpeedMs} numFloors={state.numFloors} {...elevator} />)}
                <div id={css.panel}><Panel callElevator={callElevator} floors={state.numFloors} /></div>
            </div>
        </>
    );
}


const Elevator = ({ numFloors, floor, status, speed }) => {

    const allFloors = arrayFromInt(numFloors, 1).reverse();
    const [carFloor, setCarFloor] = useState(floor);
    const previousCarFloor = usePrevious(carFloor);

    const animeRef = useRef(null);

    useEffect(() => {
        if (animeRef.current) {
            animeRef.current.anime.play();
        }
    });

    return (
        <div className={css.elevator}>
            {allFloors.map((floorNum) => <div key={floorNum} className={css.floor}>{floorNum}</div>)}
            <Anime easing="easeInOutSine"
                ref={animeRef}
                loop={false}
                duration={previousCarFloor ? speed * Math.abs(floor - previousCarFloor) : 0}
                autoplay={false} bottom={floor * 31 + floor}
                className={css.car}
            ></Anime>
        </div>
    );
}

const Car = (props: { fromFloor: number, toFloor: number }) => {
    let floorDelta = Math.abs(props.fromFloor - props.toFloor);

    console.log("Car props: ", props, 2000 * Math.abs(props.toFloor - props.fromFloor));


    return <Anime easing="easeInOutQuad"
        loop={false}
        duration={props.fromFloor ? 2000 * floorDelta : 0}
        autoplay={true} bottom={props.toFloor * 31 + props.toFloor} className={css.car}></Anime>
}

const Panel = ({ floors, callElevator }) => {
    return (
        <div className={css.elevator}>
            {arrayFromInt(floors, 1).reverse().map((floorNum) =>
                <div key={floorNum} className={css.floor}>
                    <button className={css.button} onClick={() => callElevator(floorNum)}>{floorNum}</button>
                </div>)}
        </div>
    );
}



const arrayFromInt = (elementCount: number, transpose: number = 0) => {
    return Array.from(Array(elementCount), (_e, i) => i + transpose);
}

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default ImplementationPage;
