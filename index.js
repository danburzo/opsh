'use strict';

function walk(arr, fn) {
	let res;
	if (!fn) {
		fn = (item, type, detail) => {
			if (!res) {
				res = [];
			}
			res.push(detail !== undefined ? [item, type, detail] : [item, type]);
		}
	}
	let args = arr.slice();
	let curr, m, has_delim = false, last_opt = undefined;
	while ((curr = args.shift()) !== undefined) {

		if (has_delim) {
			if (fn(curr, 'operand') === false) {
				return;
			}
			continue;
		}

		// -xyz
		if (m = curr.match(/^-([a-zA-Z0-9]+)$/)) {
			last_opt = m[1][m[1].length - 1];
			if (m[1].split('').some(f => fn(f, 'option') === false)) {
				return;
			}
			continue;
		}

		// --x=y
		if (m = curr.match(/^--([a-zA-Z0-9\-]+)(?:=([^]*))?$/)) {
			last_opt = m[2] === undefined ? m[1] : undefined;
			if (fn(m[1], 'option', m[2]) === false) {
				return;
			}
			continue;
		}

		if (curr == '--') {
			if (fn(curr, 'delimiter', last_opt) === false) {
				return;
			}
			has_delim = true;
			last_opt = undefined;
			continue;
		}

		if (last_opt) {
			if (fn(curr, 'operand', last_opt) === false) {
				return;
			}
			last_opt = undefined;
			continue;
		}
		
		if (fn(curr, 'operand') === false) {
			return;
		}
	}
	return res;
};

module.exports = walk;