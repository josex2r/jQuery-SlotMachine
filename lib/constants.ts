import { Options } from './types';

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const DEFAULTS: Required<Options> = {
  active: 0, // Active element [Number]
  delay: 200, // Animation time [Number]
  randomize: (_, max) => randomInteger(0, max), // Randomize function, must return a number with the selected position
  direction: 'up', // Animation direction ['up'||'down']
};

export enum CONTAINER_FX {
  GRADIENT = 'slot-machine__container--gradient',
}

export enum TILE_FX {
  NO_TRANSITION = 'slot-machine__tile--no-transition',
  FAST = 'slot-machine__tile--blur-fast',
  NORMAL = 'slot-machine__tile--blur-medium',
  SLOW = 'slot-machine__tile--blur-slow',
  TURTLE = 'slot-machine__tile--blur-turtle',
  STOP = 'slot-machine__tile--gradient',
}
