module.exports = function () {
	let res = [];
	return {
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
		},
		returns: res
	};
};
