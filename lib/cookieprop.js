module.exports = CookieProp;

var Prop = require('./prop');
var Cookies = require('js-cookie')

function CookieProp(obj, prop, databinder) {

	var self = {};

	var cookie = 'bdsft_'+ obj._name + '_' + prop.name;
	var expires = 365;

	var _onInit = prop.onInit;
	prop.onInit = function(){
		if(!prop.value && Cookies.get(cookie)) {
			var value = Cookies.get(cookie);
			if(value === 'true') {
 				obj[prop.name] = true;
			} else if(value === 'false') {
 				obj[prop.name] = false;
			} else {
 				obj[prop.name] = value;
			}
		}
		_onInit && _onInit();
		// console.log('cookie oninit : '+prop.name, obj[prop.name]);
	};

	var _onSet = prop.onSet;
	prop.onSet = function(value){
		if (value) {
			Cookies.set(cookie, value, {
				expires: expires
			});
		} else {
			Cookies.remove(cookie);
		}
		_onSet && _onSet(value);
	};

	var propObj = Prop(obj, prop, databinder);

	return propObj;
}