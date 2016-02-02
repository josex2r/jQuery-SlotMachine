#jQuery-SlotMachine [![Build Status](https://travis-ci.org/josex2r/jQuery-SlotMachine.svg?branch=master)](https://travis-ci.org/josex2r/jQuery-SlotMachine) [![Dependency Status](https://david-dm.org/josex2r/jQuery-SlotMachine.svg)](https://david-dm.org/josex2r/jQuery-SlotMachine) [![devDependency Status](https://david-dm.org/josex2r/jQuery-SlotMachine/dev-status.svg)](https://david-dm.org/josex2r/jQuery-SlotMachine#info=devDependencies)

A simple, lightweight jQuery plugin to make slot machine animation effect.

[Check the example page!] (http://josex2r.github.io/jQuery-SlotMachine/)

## Installation

Install the component using [Bower](http://bower.io/):

```sh
$ bower install jquery-slotmachine --save
```

Include the script located in *dist* folder *after* the jQuery library:

```html
<script src="/path/to/jquery.slotmachine.min.js"></script>
```

## Usage

Creating the machine:

```javascript
var machine = $(foo).slotMachine( params );
```

Get machine instance:

```javascript
var machine = $(foo).slotMachine();
```

Shuffle:

```javascript
machine.shuffle( repeat, onStopCallback ); //No args to make rotate infinitely, `repeat` is optional
```

Change the selected element:

```javascript
machine.prev(); //Previous element

machine.next(); //Next element
```

Stop the machine:

```javascript
machine.stop();
```

Get selected element:

```javascript
machine.active; //Current element index
```

Get the selected element if shuffling:

```javascript
machine.futureActive; //Future active element index
```

Check if the machine is running:

```javascript
machine.running; //Returns boolean
```

Check if the machine is stopping:

```javascript
machine.stopping; //Returns boolean
```

Check if the machine is visible:

```javascript
machine.visible; //Returns boolean
```

Change spin result, if the returned value is out of bounds, the element will be randomly choosen:

```javascript
machine.setRandomize(foo); //foo must be a function (should return int) or an int
```

Change spin direction, machine must not be running:

```javascript
machine.direction = direction; //direction must be a String ('up' || 'down')
```

Destroy the machine. It will be useful when you want to reuse DOM:

```javascript
machine.destroy();
```

## Params

Params must be an object, optionally containing the next parammeters:

#### active

Set the first element

    active: 0

#### delay

Set spin animation time

    delay: 200

#### auto

Pass an int as miliseconds to make the machine auto rotate

    auto: false

#### spins

The number of spins when auto is enabled

    spins: false

#### stopHidden

Stop animation if the element is above or below the screen

    stopHidden: true

#### randomize

Pass a function to select your own random element. This function must return an integer between 0 (first element) and max number of elements.

    randomize: function(activeElementIndex){} //activeElementIndex = current selected index

Example (this machine always shows first element):

```javascript
$('#foo').slotMachine({
	randomize : function(activeElementIndex){
		return 0;
	}
});
```
#### direction

Animation direction ('up' || 'down')

    direction: 'up'

## Authors

[Jose Luis Represa](https://github.com/josex2r)

##License

jQuery-SlotMachine is released under the [MIT License](http://opensource.org/licenses/MIT).
