var utils = require('bdsft-sdk-utils')
var DataBinder = require('./databinder');

var databinder = function(name, constructorArgs, source) {
	// no source - create new databinder
	if(typeof source === 'undefined') {
		return new DataBinder(name);
	}

	if (name === source._name || name === 'self') {
		if (!source.databinder) {
			throw Error('databinder : undefined on ' + source._name);
		}
		return source.databinder;
	}

	for (var i = 0; i < constructorArgs.length; i++) {
		if (constructorArgs[i]._name && (constructorArgs[i]._name === name || constructorArgs[i]._name.replace(/view$/, '') === name)) {
			if (!constructorArgs[i].databinder) {
				throw Error('databinder : undefined on ' + name);
			}
			return constructorArgs[i].databinder;
		}
	}

	// View without model
	if (name === source._name.replace(/view$/, '')) {
		return new DataBinder(name);
	}

	throw Error('databinder : ' + name + ' constructor argument missing in ' + source._name);
};
var bdsft = {
	databinder: databinder,
	bindings: bindings,
	call: call,
	prop: require('./prop')
};

module.exports = bdsft;

function bindings(object, constructorArgs) {
	(object.bindings && Object.keys(object.bindings) || []).forEach(function(name) {
		var from = object.bindings[name];
		var binding;
		if (name === 'classes') {
			binding = require('./classesbinding')(object, name, from, constructorArgs);
		} else {
			binding = require('./binding')(object, name, from, constructorArgs);
		}
		binding.init();
	});
}

function call(object, method, options, constructorArgs) {
	if (!object[method]) {
		return;
	}
	var argNames = utils.argNamesFun(object[method]);
	var args = [];
	for (var i = 0; i < argNames.length; i++) {
		if (argNames[i].match(/databinder/i)) {
			var databinderArg = databinder(argNames[i].replace(/databinder/i, '') || object._name, constructorArgs, object);
			args.push(databinderArg);
		} else if (argNames[i] === 'options') {
			args.push(options);
		} else {
			// console.warn('no arg on '+ name +' found for : '+argNames[i]);
		}
	}
	return utils.createFun(object[method], args);
}