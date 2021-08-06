'use strict';

const noop = () => {};

function walkArgs(arr, fn) {
	if (!fn) {
		throw new Error('No walker object / array was provided.');
	}

	if (Array.isArray(fn)) {
		const bool = new Set(fn);
		const res = {
			options: {},
			operands: []
		};
		walkArgs(arr, {
			option(option, value, unsaturated_option) {
				if (unsaturated_option && !bool.has(unsaturated_option)) {
					throw new Error(
						`${unsaturated_option} expects a value, received option ${option}.`
					);
				}
				if (bool.has(option)) {
					if (value !== undefined) {
						throw new Error(
							`${option} does not accept a value, received ${value}.`
						);
					}
					res.options[option] = true;
				} else {
					if (value !== undefined) {
						res.options[option] = value;
					}
				}
			},
			operand(operand, unsaturated_option) {
				if (!unsaturated_option || bool.has(unsaturated_option)) {
					res.operands.push(operand);
				} else {
					res.options[unsaturated_option] = operand;
				}
			},
			delimiter(delimiter, unsaturated_option) {
				if (unsaturated_option && !bool.has(unsaturated_option)) {
					throw `${unsaturated_option} expects a value, received ${delimiter}.`;
				}
			}
		});
		return res;
	}

	const fn_opt = fn.option || noop;
	const fn_operand = fn.operand || noop;
	const fn_delim = fn.delimiter || noop;

	let args = arr.slice();
	let curr;
	let m;
	let has_delimiter = false;
	let last_option = undefined;
	let should_break;
	while ((curr = args.shift()) !== undefined) {
		if (has_delimiter) {
			if (fn_operand(curr) === false) {
				return;
			}
			continue;
		}

		// -xyz
		if ((m = curr.match(/^-([a-zA-Z0-9]+)$/))) {
			should_break = m[1].split('').some(f => {
				if (fn_opt(f, undefined, last_option) === false) {
					return true;
				}
				last_option = f;
			});
			if (should_break) {
				return;
			}
			continue;
		}

		// --x=y
		if ((m = curr.match(/^--([a-zA-Z0-9\-.]+)(?:=([^]*))?$/))) {
			last_option = m[2] === undefined ? m[1] : undefined;
			if (fn_opt(m[1], m[2]) === false) {
				return;
			}
			continue;
		}

		if (curr == '--') {
			if (fn_delim(curr, last_option) === false) {
				return;
			}
			has_delimiter = true;
			last_option = undefined;
			continue;
		}

		if (last_option) {
			if (fn_operand(curr, last_option) === false) {
				return;
			}
			last_option = undefined;
			continue;
		}

		if (fn_operand(curr) === false) {
			return;
		}
	}
	return fn && fn.returns ? fn.returns : undefined;
}

module.exports = walkArgs;
