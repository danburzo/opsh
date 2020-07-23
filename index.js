'use strict';

const noop = () => {};
const fwd = (fn, type) => (item, detail) => fn(type, item, detail);

function walkArgs(arr, fn) {
	
	if (!fn) {
		let res = [];
		walkArgs(arr, {
			option(option, value) {
				let item = { type: 'option', option };
				if (value !== undefined) {
					item.value = value;
				}
				res.push(item);
			},
			operand(operand, unsaturated_option) {
				let item = { type: 'operand', operand };
				if (unsaturated_option !== undefined) {
					item.option = unsaturated_option;
				}
				res.push(item);
			},
			delimiter(delimiter, unsaturated_option) {
				let item = { type: 'delimiter', delimiter };
				if (unsaturated_option !== undefined) {
					item.option = unsaturated_option;
				}
				res.push(item);
			}
		});
		return res;
	}
	
	const isfn = typeof fn === 'function';
	const fn_opt = isfn ? fwd(fn, 'option') : fn.option || noop;
	const fn_operand = isfn ? fwd(fn, 'operand') : fn.operand || noop;
	const fn_delim = isfn ? fwd(fn, 'delimiter') : fn.delimiter || noop;

	let args = arr.slice();
	let curr, m, has_delim = false, last_opt = undefined;
	while ((curr = args.shift()) !== undefined) {

		if (has_delim) {
			if (fn_operand(curr) === false) {
				return;
			}
			continue;
		}

		// -xyz
		if (m = curr.match(/^-([a-zA-Z0-9]+)$/)) {
			last_opt = m[1][m[1].length - 1];
			if (m[1].split('').some(f => fn_opt(f) === false)) {
				return;
			}
			continue;
		}

		// --x=y
		if (m = curr.match(/^--([a-zA-Z0-9\-]+)(?:=([^]*))?$/)) {
			last_opt = m[2] === undefined ? m[1] : undefined;
			if (fn_opt(m[1], m[2]) === false) {
				return;
			}
			continue;
		}

		if (curr == '--') {
			if (fn_delim(curr, last_opt) === false) {
				return;
			}
			has_delim = true;
			last_opt = undefined;
			continue;
		}

		if (last_opt) {
			if (fn_operand(curr, last_opt) === false) {
				return;
			}
			last_opt = undefined;
			continue;
		}

		if (fn_operand(curr) === false) {
			return;
		}
	}
	return undefined;
};

module.exports = walkArgs;