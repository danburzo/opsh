let tape = require('tape');
let opsh = require('./index');

tape('short and long options', t => {
	t.deepEqual(opsh(['--hello']), [{ option: 'hello', type: 'option' }]);
	t.deepEqual(opsh(['--hello=']), [{ option: 'hello', type: 'option', value: '' }]);
	t.deepEqual(opsh(['--hello=world']), [{ option: 'hello', type: 'option', value: 'world'}]);
	t.deepEqual(
		opsh(['-cr']), 
		[
			{ option: 'c', type: 'option' }, 
			{ option: 'r', type: 'option' }
		]
	);
	t.deepEqual(opsh(['-c', '-r']), [{ option: 'c', type: 'option' }, { option: 'r', type: 'option' }]);
	t.end();
});

tape('delimiter', t => {
	t.deepEqual(
		opsh(['--', '--hello']), 
		[{ type: 'delimiter', 'delimiter': '--' }, { operand: '--hello',  type: 'operand' }]
	);
	t.deepEqual(
		opsh(['-c', '--', '-c']), 
		[
			{ option: 'c', type: 'option' }, 
			{ type: 'delimiter', delimiter: '--', option: 'c' }, 
			{ operand: '-c', type: 'operand' }
		]
	);
	t.end();
});

tape('operands', t => {
	t.deepEqual(
		opsh(['--hello', 'file.txt']),
		[
			{ option: 'hello', type: 'option' }, 
			{ operand: 'file.txt', type: 'operand', option: 'hello' }
		]
	);
	t.deepEqual(
		opsh(['--hello=world', 'file.txt']),
		[
			{ option: 'hello', type: 'option', value: 'world' }, 
			{ operand: 'file.txt', type: 'operand' }
		]
	);
	t.deepEqual(
		opsh(['-c', '-']), [
			{ option: 'c', type: 'option' },
			{ operand: '-', type: 'operand', option: 'c' }
		]
	);
	t.deepEqual(
		opsh(['-c', '--', '-c', '--']), [
			{ option: 'c', type: 'option' }, 
			{ type: 'delimiter', delimiter: '--', option: 'c' },
			{ operand: '-c', type: 'operand' },
			{ operand: '--', type: 'operand' },
		]
	);
	t.end();
});