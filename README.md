# opsh

<a href="https://www.npmjs.org/package/opsh"><img src="https://img.shields.io/npm/v/opsh.svg?style=flat-square&labelColor=5085c0&color=dedcdb" alt="npm version"></a> <a href="https://bundlephobia.com/result?p=opsh"><img src="https://img.shields.io/bundlephobia/minzip/opsh?style=flat-square&labelColor=5085c0&color=dedcdb" alt="bundle size"></a>

An argument processor for your Node.js command-line apps that gives you a helping hand in adhering to the [POSIX guidelines](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html), while supporting [GNU-style long options](https://www.gnu.org/software/gawk/manual/html_node/Options.html).

## Usage

Install [the opsh package](https://npmjs.com/package/opsh) with npm:

```bash
npm install opsh
```

Then use it in your executable file.

**example.js:**

```js
#! /usr/bin/env node
let opsh = require('opsh');
opsh(process.argv.slice(2), {
	option(option, value) {
		console.log(`option: ${option} = ${value}`);
	},
	operand(operand, opt) {
		if (opt) {
			console.log(`operand or option-argument of ${opt}: ${item}`);
		} else {
			console.log(`operand: ${item}`);
		}
	}
});
```

> **Note:** Before running your program for the first time, you need to run `chmod +x example.js` to make your file executable.

Running `example.js` produces this output:

```bash
./example.js -i input.txt --format=terse -n output.txt

option: i = undefined
operand or option-argument of i: input.txt
option: format = terse
option: n = undefined
operand or option-argument of n: output.txt
```

Let's unpack what's going on.

The way opsh works is it identifies **options**, **option-arguments** (that's an option's value), and **operands** based on the POSIX / GNU conventions, and not much more. Any further semantics is left to the library user.

In the command above, the meaning of `input.txt` is ambiguous. Without further information, opsh can't tell whether it is the option-argument of the `-i` option immediately preceding it, or an operand.

## The `opsh()` function

The library exports a single `opsh()` function that can be invoked in two ways. The first argument _args_ is common to both styles, and represents the array of arguments to parse. You'll usually want to pass in `process.argv.slice(2)`.

### Basic usage

**opsh**(_args_: Array, _booleanOptions_: Array)

One way to sort out ambiguous input is to declare upfront which options are meant to be _boolean_, meaning they don't accept an option-argument. Providing a `booleanOptions` array as the second argument lets opsh sort out operands from option-arguments and return an object with these keys:

-   `options` — options and their option-argument are present here in key-value pairs;
-   `operands` — an array of operands.

This style of invoking `opsh()` will throw an error whenever a boolean option receives an option-operand, or a non-boolean option doesn't receive one.

When _booleanOptions_ is omitted, it defaults to the empty array `[]`.

Let's take our previous invocation:

```bash
./example.js -i input.txt --format=terse -n output.txt
```

And this time let's specify that `-n` is a boolean option and that, conversely, `-i` and `--format` accept values.

```js
const args = '-i input.txt --format=terse -n output.txt'.split(' ');
opsh(args, ['n']);
```

This gives us the following result:

```js
{
	options: {
		i: 'input.txt',
		format: 'terse',
		n: true
	},
	operands: ['output.txt']
}
```

### Advanced usage

**opsh**(_args_: Array, _walker_: Object)

Provide a _walker object_ as the second argument for full control on how the user input is interpreted. A walker object contains these keys (all optional):

```js
opsh(process.argv.slice(2), {
	/*
		Invoked when visiting an option (`option`),
		with or without an explicit option-argument (`value`).

		There might be a previous option left unsaturated
		(`unsaturated_option`).
	 */
	option(option, value, unsaturated_option) {
		// ...
	},

	/*
		Invoked when visiting an operand (`operand`) or 
		possible option-argument when the previous option
		was left unsaturated (`unsaturated_option`).
	 */
	operand(operand, unsaturated_option) {
		// ...
	},

	/*
		Invoked when visiting the `--` delimiter.
		There might be a previous option left unsaturated
		(`unsaturated_option`).
	 */
	delimiter(delimiter, unsturated_option) {
		// ...
	}
});
```

Returning `false` from any walker function stops further traversal.

## Notes

Short options with their argument separated by `<blank>`, such as `-n10`, are not supported.
