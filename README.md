# jQuery-SlotMachine [![Build Status](https://travis-ci.org/josex2r/jQuery-SlotMachine.svg?branch=master)](https://travis-ci.org/josex2r/jQuery-SlotMachine) [![Dependency Status](https://david-dm.org/josex2r/jQuery-SlotMachine.svg)](https://david-dm.org/josex2r/jQuery-SlotMachine) [![devDependency Status](https://david-dm.org/josex2r/jQuery-SlotMachine/dev-status.svg)](https://david-dm.org/josex2r/jQuery-SlotMachine#info=devDependencies)

> :mega: jQuery is not neccessary now! The name it's just legacy.

A simple, and lightweight piece of code to make slot machine animation effect.
It also exports a js wrapper to allow the usage with jQuery.

To preview what you can do [check the example page!](http://josex2r.github.io/jQuery-SlotMachine/)

![slot-machine](./img/slot-machine.gif)

## Installation

Install the component using [npm](https://www.npmjs.com/package/jquery-slotmachine):

```bash
npm install jquery-slotmachine --save

yarn add jquery-slotmachine
```

## Example

```html
<div id="machine">
  <div>Madrid</div>
  <div>London</div>
  <div>New York</div>
</div>
```

```javascript
const el = document.querySelector('#machine');

const machine = new SlotMachine(el, {
  active: 1,
  delay: 450
});

machine.shuffle();
```

> Lookup the sourcecode in the [examples page](http://josex2r.github.io/jQuery-SlotMachine/) to see more examples.

## Usage

Include the script located in *dist* folder:

```html
<script src="/path/to/slotmachine.min.js"></script>
```

> Or build your own package using a bundled (webpack, rollup, ...)

Then you can make it work calling the lib in your app:

```javascript
const element = document.getElementById('my-machine');
const machine = new SlotMachine(element, {
  /* options */
});
```

### Settings

Use the first argument of the function to pass an object with the options:

```javascript
const machine = new SlotMachine(element, {
  active: 2,
  auto: true
});
```

| Name           | Type       | Default        | Description                                                                              |
|----------------|------------|----------------|------------------------------------------------------------------------------------------|
| **active**     | `Number`   | `0`            | The initial visible element (0 means the first one)                                      |
| **delay**      | `Number`   | `200`          | Duration (in ms) of each spin                                                            |
| **randomize**  | `Function` | `() => number` | Function (returns number) that returns the next active element (random value as default) |
| **direction**  | `String`   | `up`           | The spin direction (possible values are `up` and `down`)                                 |

### Properties

- `machine.nextActive`: Get the next active element (only while shuffling).
- `machine.nextIndex`: Next element index according to the current direction.
- `machine.prevIndex`: Prev element index according to the current direction.
- `machine.running`: Check if the machine is running.
- `machine.stopping`: Check if the machine is stopping.
- `machine.active`: The current `active` element.

### Methods

`machine.shuffle(spins: number): Promise<void>`: Starts spining the machine.

**Arguments**:
  - spins (`Number`): Optionally set the number of spins until stop.

```javascript
// Do a single spin
machine.shuffle();
// Do 5 spins before stop
machine.shuffle(5);
// "Infinite" spins
machine.shuffle(Infinity);
```

`machine.stop(spins: number): Promise<void>`: Manually stops the machine.

**Arguments**:
  - spins (`Number`): Set the number of spins until stop. Use `0` to inmediate stop.

```javascript
// Start spinning the machine
machine.shuffle(Infinity);
// Do 4 spins an then stop
machine.stop(4);
```

`machine.next(): Promise<void>`/`machine.prev(): Promise<void>`: Spins to the **next/previous** element.

```javascript
// Spin to the previous element
machine.prev();

// Spin to the next element
machine.next();
```

### Usefull recipes

To create an inifite carousel effect (as the previous versions `run` method) use a recursive function:

```javascript
(async function run() {
  await machine.shuffle(5)
  await timeout(1000);
  run();
})();
```

## Authors

[Jose Luis Represa](https://github.com/josex2r)

## License

jQuery-SlotMachine is released under the [MIT License](http://opensource.org/licenses/MIT).
