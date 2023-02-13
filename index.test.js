let tape = require('tape');
let opsh = require('./index');
let walkarr = require('./walkers/to-array');

const $ = strs => strs.join('').split(/\s+/);

tape('short and long options', t => {
	t.deepEqual(opsh($`--hello`, walkarr()), [
		{ option: 'hello', type: 'option' }
	]);
	t.deepEqual(opsh($`--hello=`, walkarr()), [
		{ option: 'hello', type: 'option', value: '' }
	]);
	t.deepEqual(opsh($`--hello=world`, walkarr()), [
		{ option: 'hello', type: 'option', value: 'world' }
	]);
	t.deepEqual(opsh($`-cr`, walkarr()), [
		{ option: 'c', type: 'option' },
		{ option: 'r', type: 'option' }
	]);
	t.deepEqual(opsh($`-c -r`, walkarr()), [
		{ option: 'c', type: 'option' },
		{ option: 'r', type: 'option' }
	]);
	t.end();
});

tape('long options', t => {
	t.deepEqual(opsh($`--my-var=my-value`, walkarr()), [
		{ type: 'option', option: 'my-var', value: 'my-value' }
	]);

	t.deepEqual(opsh($`--env.target=production`, walkarr()), [
		{ type: 'option', option: 'env.target', value: 'production' }
	]);

	t.end();
});

tape('delimiter', t => {
	t.deepEqual(opsh($`-- --hello`, walkarr()), [
		{ type: 'delimiter', delimiter: '--' },
		{ operand: '--hello', type: 'operand' }
	]);
	t.deepEqual(opsh($`-c -- -c`, walkarr()), [
		{ option: 'c', type: 'option' },
		{ type: 'delimiter', delimiter: '--', option: 'c' },
		{ operand: '-c', type: 'operand' }
	]);
	t.end();
});

tape('operands', t => {
	t.deepEqual(opsh($`--hello file.txt`, walkarr()), [
		{ option: 'hello', type: 'option' },
		{ operand: 'file.txt', type: 'operand', option: 'hello' }
	]);
	t.deepEqual(opsh($`--hello=world file.txt`, walkarr()), [
		{ option: 'hello', type: 'option', value: 'world' },
		{ operand: 'file.txt', type: 'operand' }
	]);
	t.deepEqual(opsh($`-c -`, walkarr()), [
		{ option: 'c', type: 'option' },
		{ operand: '-', type: 'operand', option: 'c' }
	]);
	t.deepEqual(opsh($`-c -- -c --`, walkarr()), [
		{ option: 'c', type: 'option' },
		{ type: 'delimiter', delimiter: '--', option: 'c' },
		{ operand: '-c', type: 'operand' },
		{ operand: '--', type: 'operand' }
	]);
	t.end();
});

tape('booleans array', t => {
	t.deepEqual(opsh($`-c input.txt`), {
		options: { c: 'input.txt' },
		operands: []
	});

	t.deepEqual(opsh($`-c input.txt`, ['c']), {
		options: { c: true },
		operands: ['input.txt']
	});
	t.throws(
		() => opsh($`-cr input.txt`, ['r']),
		/expects a value, received option/
	);
	t.throws(
		() => opsh($`-rc -- input.txt`, ['r']),
		/expects a value, received --/
	);
	t.throws(
		() => opsh($`--format=esm index.js`, ['format']),
		/does not accept a value/
	);
	t.end();
});

tape('Examples from README', t => {
	t.deepEqual(opsh($`-i input.txt --format=terse -n output.txt`, walkarr()), [
		{ type: 'option', option: 'i' },
		{ type: 'operand', operand: 'input.txt', option: 'i' },
		{ type: 'option', option: 'format', value: 'terse' },
		{ type: 'option', option: 'n' },
		{ type: 'operand', operand: 'output.txt', option: 'n' }
	]);
	t.deepEqual(opsh($`-i input.txt --format=terse -n output.txt`, ['n']), {
		options: {
			i: 'input.txt',
			format: 'terse',
			n: true
		},
		operands: ['output.txt']
	});
	t.end();
});
