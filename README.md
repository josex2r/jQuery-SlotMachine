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
```

Install the component using [Bower](http://bower.io/):

```bash
bower install jquery-slotmachine --save
```

## Example

```html
<div id="machine">
  <div>Madrid</div>
  <div>London</div>
  <div>New York</div>
</div>

<script>
const el = document.querySelector('#machine');
const machine = new SlotMachine(el, {
  active: 1,
  delay: 450,
  auto: 1500
});
</script>
```

> Lookup the sourcecode in the [examples page](http://josex2r.github.io/jQuery-SlotMachine/) to see more examples.

## Usage

Include the script located in *dist* folder:

```html
<script src="/path/to/slotmachine.min.js"></script>
```

Then you can make it work calling the lib in your app:

```javascript
const element = document.getElementById('my-machine');
const machine = new SlotMachine(element, { /* options */ });
```

If you preffer jQuery style then import the wrapper *after* the jQuery library:

```html
<script src="/path/to/jquery.min.js"></script>
<script src="/path/to/slotmachine.min.js"></script>
<script src="/path/to/jquery.slotmachine.min.js"></script>
```

```javascript
$(document).ready(function(){
  $('#my-machine').slotMachine({ /* options */ });
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

| Name           | Type       | Default       | Description                                                                         |
|----------------|------------|---------------|-------------------------------------------------------------------------------------|
| **active**     | `Number`   | `0`           | The initial visible element (0 means the first one)                                 |
| **delay**      | `Number`   | `200`         | Duration (in ms) of each spin                                                       |
| **auto**       | `Boolean`  | `false`       | Runs the carousel mode when creating the machine                                    |
| **spins**      | `Number`   | `5`           | Number of spins after stop in carousel mode                                         |
| **randomize**  | `Function` | `null`        | Function (returns number) that is going to be called to set the next active element |
| **onComplete** | `Function` | `null`        | Callback after each spin in carousel mode                                           |
| **inViewport** | `Boolean`  | `true`        | Only spin when the machine is inside the viewport                                   |
| **direction**  | `String`   | `up`          | The spin direction (possible values are `up` and `down`)                            |
| **transition** | `String`   | `ease-in-out` | The CSS transition                                                                  |

### Properties

- `machine.nextActive`: Get the next active element (only while shuffling).
- `machine.nextIndex`: Next element index according to the current direction.
- `machine.prevIndex`: Prev element index according to the current direction.
- `machine.random`: Get rando index between the machine bounds.
- `machine.running`: Check if the machine is running.
- `machine.stopping`: Check if the machine is stopping.
- `machine.visible`: Check if the machine is visible.
- `machine.visibleTile`: Get the current visible element in the machine viewport.
- `machine.active`: Alias to the `active` setting.
- `machine.randomize`: Alias to the `randomize` setting.
- `machine.direction`: Alias to the `direction` setting.
- `machine.transition`: Alias to the `transition` setting.

### Methods

`machine.shuffle(spins, callback)`: Starts spining the machine.
  - spins (`Number`): Optionally set the number of spins.
  - callback(`Function`): Callback triggered when the machine stops.

```javascript
// Do a single spin
machine.shuffle();
// Do a single spin and then shows an alert
machine.shuffle(() => alert('Stop!'));
// Do 5 spins before stop
machine.shuffle(5);
// Do 7 spins and then showing an alert
machine.shuffle(7, () => alert('Stop!'));
// "Infinite" spins
machine.shuffle(9999999); // O_O
```

`machine.stop(callback)`: Manually stops the machine.
  - callback(`Function`): Callback triggered when the machine stops.

For example, start spinning the machine and stop it after pressing a button:

```javascript
machine.shuffle(99999);
// Add the button listener
myButton.addEventListener('click', () => {
  // Stop spinning
  machine.stop();
});
```

`machine.next()`/`machine.prev()`: Spin to the next/previous element.

```javascript
// Spin to the previous element
machine.prev();
// Spin to the next element
machine.next();
```

`machine.run()`: Starts the preview mode, it will spin/stop given a delay (more info in options).

```javascript
machine.run();
```

`machine.run()`: Destroys the machine. It will be useful when you want to reuse DOM.

```javascript
machine.destroy();
```

## Authors

[Jose Luis Represa](https://github.com/josex2r)

## License

jQuery-SlotMachine is released under the [MIT License](http://opensource.org/licenses/MIT).
