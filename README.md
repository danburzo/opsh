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

__example.js:__
```js
#! /usr/bin/env node
let opsh = require('ophs');
console.log(
	opsh(process.argv.slice(2))
);
```

```bash
./example.js -i input.txt --format=terse -n output.txt
[
	['i', 'option', 'input.txt'],
	['format', 'option', 'terse'],
	['n', 'option'],
	['output.txt', 'operand', 'n']
]
```

## API

`opsh` supports two styles:

* You can go through each argument one by one with a callback: `opsh(argv, callback)`;
* You can get the parsed arguments as an array: `opsh(argv)` → `array`.

### Callback style

```js
opsh(
	process.argv.slice(2), 
	function(item, type, detail) {
		if (type === 'operand') {
			// ...
		} else if (type === 'option') {
			// ...
		}
	}
);
```

The callback gets sent the following:

* `item`: 
* `type`: one of `option`, `operand`, `delimiter` (when the item is `--`).
* `detail`: depends on the `type`

For an `option`, `detail` will contain the value passed to the option, which is possible with the long-option syntax, i.e. `--hello=world`.

For a `delimiter`, `detail` contains the preceding option, if any, that does not have an explicit value.

For `operand`s, `detail` likewise contains the preceding option, if any, that does not have an explicit value. The presence of a `detail` value signals ambiguity: the operand can .

### Return style

When called without a callback, `opsh` returns an array of `[item, type, detail]` elements.


## Notes

Short options with their argument separated by `<blank>`, such as `-n10`, are not supported.