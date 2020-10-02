enum ElevatorStatus {
    Idle = "Idle",
    GoingUp = "GoingUp",
    GoingDown = "GoingDown",
    Moving = "Moving"
}

class Elevator {
    id: number;
    status: ElevatorStatus;
    floor: number;
}

class ElevatorSystem {
    elevators: Array<Elevator>;
    numFloors: number;
    elevatorSpeedMs: number;
    numElevators: number;

    constructor(numFloors: number = 20, numElevators: number = 5, elevatorSpeedMs: number = 500) {
        this.numFloors = numFloors;
        this.numElevators = numElevators;
        this.elevatorSpeedMs = elevatorSpeedMs;

        this.elevators = Array.from<number, Elevator>([...Array(numElevators).keys()], (idx) => {
            const elevator: Elevator = {
                id: idx + 1,
                status: ElevatorStatus.Idle,
                floor: Math.max(Math.round(Math.random() * numFloors), 1)
            };

            return elevator;
        });

        console.log(this);
    }

    updateElevator(elevator: Elevator) {
        console.log("UPDATING: ", elevator);
        let idx = this.elevators.findIndex((e) => e.id == elevator.id);
        this.elevators[idx] = elevator;

        return this.elevators;
    }

    async selectElevator(floor: number) {
        let selected = this.closestIdleCar(floor);

        return selected;
    }

    private async closestIdleCar(floor: number) {
        let chosenCar = this.elevators.map((e, i) => {
            if (e.status == ElevatorStatus.Idle) {
                /* find the idle cars and calculate distance to floor */
                let floorDelta = Math.abs(floor - e.floor);
                return [i, floorDelta]
            }
        }).reduce((prev, curr) => {
            /* choose the lowest one */
            console.log("PREV: ", prev, "  CUR ", curr);
            if (!prev) return curr;
            if (!curr) return prev;
            return prev[1] <= curr[1] ? prev : curr;
        });

        console.log("CHOSEN CAR: ", chosenCar);

        if (chosenCar === undefined) {
            return Promise.reject("No car found");
        }

        return this.elevators[chosenCar[0]];
    }
}

class ElevatorDispatch {
    private static _instance: ElevatorDispatch;

    private socket: any;
    private es: ElevatorSystem;

    private constructor() {
        this.es = new ElevatorSystem();
    }

    static instance() {
        if (!ElevatorDispatch._instance) {
            ElevatorDispatch._instance = new ElevatorDispatch();
        }

        return ElevatorDispatch._instance;
    }

    init(websocket: any) {
        let initAction = {
            type: 'init',
            data: this.es
        }

        this.socket = websocket;
        this.socket.send(JSON.stringify(initAction));
    }

    async send(data: any) {
        console.log("SENDING to client: ", data);
        this.socket.send(JSON.stringify(data));
    }

    async dispatch(message) {
        let action = message.action;
        let payload = message.payload;

        console.log("Got dispatch: ", action, payload, message);

        switch (action) {
            case 'call':
                return await this.callAction(payload);
            default: return;
        }
    }

    private async callAction(floor) {
        console.log("executing callAction with arg: ", floor);

        await this.es.selectElevator(floor).then((elevator) => {
            let elevators = this.es.updateElevator({ ...elevator, floor: floor, status: ElevatorStatus.Moving });

            this.send({
                type: 'call',
                data: elevators
            });

            // Hacky way to reset elevator status.
            setTimeout(() => {
                console.log("Timeout for elevator ", elevator.id, " after ", this.es.elevatorSpeedMs * Math.abs(floor - elevator.floor), "ms")
                let elevators = this.es.updateElevator({ ...elevator, floor: floor, status: ElevatorStatus.Idle });
                //this.send({ type: 'update', data: elevators });
            }, this.es.elevatorSpeedMs * Math.abs(floor - elevator.floor));

        }, (err) => {
            this.send({ type: 'err', data: err });
            return;
        });
    }
}

export { ElevatorDispatch };