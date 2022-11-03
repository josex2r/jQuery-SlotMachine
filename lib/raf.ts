import { Callback } from './types';

export default function raf(cb: Callback, timeout = 0) {
  setTimeout(() => requestAnimationFrame(cb), timeout);
}
