# opsh

Node.js command-line argument processor supporting the [POSIX guidelines](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html) and GNU-style long options.

## Installation

```bash
# using npm:
npm install opsh

# using yarn:
yarn add opsh
```

## Usage

__examples/basic.js:__
```js
#! /usr/bin/env node
let { walkArgs, getArgs } = require('ophs');
walkArgs(process.argv.slice(2), {
	option(item, value) {
		console.log(`option: ${item} = ${value}`);
	},
	operand(item, opt) {
		if (opt) {
			console.log(`operand or value of ${opt}: ${item}`)
		} else {
			console.log(`operand: ${item}`);
		}
	}
});
```

```bash
./examples/basic.js -i input.txt --format=terse -n output.txt

option: i = undefined
operand or value of i: input.txt
option: format = terse
option: n = undefined
operand or value of n: output.txt
```

## API

The library exports a single function that can be used in three styles:

#### __opsh__(_args_, _walker_object_)

The function expects an _args_ array (you'll usually want to pass in `process.argv.slice(2)`), and a _walker_ object of the shape:

```js
opsh(process.argv.slice(2), {
	option(option, value) {
		// ...
	},
	operand(operand, unsaturated_option) {
		// ...
	},
	delimiter(delimiter, unsturated_option) {
		// ...
	}
});
```

Returning `false` from any walker function stops the traversal.

#### __opsh__(_args_, _walker_function_)

You can pass a single function instead of an object:

```js
opsh(process.argv.slice(2), function(type, item, detail) {
	// ...
});
```

The function will receive:

* `type`: one of `option`, `operand`, `delimiter`;
* `item`: the option name, or the operand value, or `--` for the delimiter;
* `detail`: the explicit value of an `option`, or the preceding unsaturated option, if any.

Returning `false` from the function stops the traversal.

#### __opsh__(_args_) → _parsed args_

If you don't provide a walker, the `opsh` function returns instead an array of objects in the form:

* `{ type: 'option', option: '...', value: '...' }` for options; `value` is only provided when explicitly provided through the long-option form `--hello=world`;
* `{ type: 'operand', operand: '...', option: '...' }` for operands; `option` refers to the preceding unsaturated option, if any;
* `{ type: 'delimiter', delimiter: '--', option: '...' }` for the `--` delimiter; `option` refers to the preceding unsaturated option, if any.

The entire array of arguments is traversed.

## Notes

Short options with their argument separated by `<blank>`, such as `-n10`, are not supported.