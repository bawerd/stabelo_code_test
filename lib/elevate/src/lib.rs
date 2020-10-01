use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub enum ElevatorState {
    Idle,
    GoingUp,
    GoingDown,
}

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct ElevatorCar {
    id: ElevatorId,
    state: ElevatorState,
    floor: u32,
}

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct ElevatorId(u32);

impl Default for ElevatorCar {
    fn default() -> Self {
        Self {
            id: ElevatorId(0),
            state: ElevatorState::Idle,
            floor: 0,
        }
    }
}

#[wasm_bindgen]
#[derive(Debug)]
pub struct ElevatorSystem {
    num_floors: u32,
    num_elevators: u32,
    speed: u32, // ms
    elevators: Vec<ElevatorCar>,
}

impl ElevatorSystem {
    pub fn init() -> Self {
        Self::default()
    }

    /*pub fn closest_idle_car(&self, floor: u32) -> ElevatorCar {
        elevators.
    }*/
}

impl Default for ElevatorSystem {
    fn default() -> Self {
        let num_elevators: u32 = 5;
        let mut elevators = Vec::with_capacity(num_elevators as usize);

        for i in 1..=num_elevators as usize {
            elevators.push(ElevatorCar {
                id: ElevatorId(i as u32),
                state: ElevatorState::Idle,
                floor: 1,
            });
        }

        Self {
            speed: 2000,
            num_floors: 20,
            num_elevators,
            elevators,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn init() {
        let es: ElevatorSystem = ElevatorSystem::init();
        dbg!("{:?}", &es);
        assert_eq!(es.num_elevators as usize, es.elevators.len());
    }

    fn get_closest_car() {
        let es: ElevatorSystem = ElevatorSystem::init();

        assert_eq!(es.num_elevators as usize, es.elevators.len());
    }
}
