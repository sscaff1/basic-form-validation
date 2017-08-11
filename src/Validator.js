import validations from './validations';

export default class Validator {
	constructor(fieldRules, fields, customValidations = {}, additionalValidationParams = {}) {
		let rules = validations;
		for (let rule in customValidations) {
			if (customValidations[rule].isInvalid && customValidations[rule].message && rule in validations) {
				// overwrite a rule entirely
				rules = { ...rules, [rule]: customValidations[rule] };
			} else if (rule in validations) {
				// modify a part of an existing rule
				const modifiedRule = { ...rules[rule], ...overrideDefault[rule] };
				rules = { ...rules, [rule]: modifiedRule };
			} else {
				// otherwise just add to the object
				rules = { ...rules, ...customValidations[rule] };
			}
		}
		this.validations = rules;
		this.fieldRules = fieldRules;
		this.fields = fields;
		this.additionalValidationParams = additionalValidationParams;
	}

	getRule(rule) {
		if (rule.indexOf('max') === 0) {
			return this.validations.max;
		} else if (rule.indexOf('min') === 0) {
			return this.validations.min;
		}
		return this.validations[rule];
	}

	validate(field) {
		return new Promise(resolve => {
			const rules = this.fieldRules[field];
			const errors = [];
			rules.forEach(rule => {
				const error = this.getRule(rule);
				if (error.isInvalid(this.fields[field].value, rule, this.fields, this.additionalValidationParams)) {
					errors.push(error.message(rule));
				}
			});
			resolve({ [field]: errors });
		});
	}

	validateAll() {
		const promises = [];
		for (let field in this.fields) {
			promises.push(this.validate(field));
		}
		return Promise.all(promises).then(errors => errors.filter(error => error.length > 0));
	}
}
