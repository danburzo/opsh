let tape = require('tape');
let walk = require('./index');

tape('short and long options', t => {
	t.deepEqual(walk(['--hello']), [['hello', 'option']]);
	t.deepEqual(walk(['--hello=']), [['hello', 'option', '']]);
	t.deepEqual(walk(['--hello=world']), [['hello', 'option', 'world']]);
	t.deepEqual(walk(['-cr']), [['c', 'option'], ['r', 'option']]);
	t.deepEqual(walk(['-c', '-r']), [['c', 'option'], ['r', 'option']]);
	t.end();
});

tape('delimiter', t => {
	t.deepEqual(walk(['--', '--hello']), [['--', 'delimiter'], ['--hello', 'operand']]);
	t.deepEqual(walk(['-c', '--', '-c']), [['c', 'option'], ['--', 'delimiter', 'c'], ['-c', 'operand']]);
	t.end();
});

tape('operands', t => {
	t.deepEqual(
		walk(['--hello', 'file.txt']),
		[['hello', 'option'], ['file.txt', 'operand', 'hello']]
	);
	t.deepEqual(
		walk(['--hello=world', 'file.txt']),
		[['hello', 'option', 'world'], ['file.txt', 'operand']]
	);
	t.deepEqual(walk(['-c', '-']), [['c', 'option'], ['-', 'operand', 'c']]);
	t.deepEqual(walk(['-c', '--', '-c']), [['c', 'option'], ['--', 'delimiter', 'c'], ['-c', 'operand']]);
	t.end();
});