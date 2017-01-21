// @build add scrypt.js
// @build add scrypt.wrapper.js
// @build add lodash.min.js

/* example: 
	return(true) // {success: true, data: {}};
	return(hash) // {success: true, data:hash }
	return({a:1,b:1}, false) //{success: {a:1,b:1}, data: false} // no no
	return(false, {a:1,b:2}) //{success: false, data: {a:1,b:1}} // ja ja
	*/
(function (self) {
	var methods = {};

	function CallHelper (requestID) {
		this.return = function (success, data) {


			if (typeof success != "boolean") {
				if (data === undefined) data = success; success = true;
			} else if (data === undefined) {
				data = {};
			}

			self.postMessage({_id: requestID, success:success, data: data});
		}
		this.error = function (code, reason, ...data) {
			self.postMessage({_id: requestID, success:false, code: code, reason: reason, data: data});
		}
	}

	self.addEventListener('message', function(e) {
		// test if called action exists
		if (methods[e.data.action] !== undefined) {
			if (e.data._id === undefined) throw "No request ID given!";

			var action = methods[e.data.action],
					params = {};

			if (action.params.length > 0 && e.data.data === undefined) throw "request field \"data\" is not set!";

			// get the parameters, throw error if one is missing
			_.each(action.params, function (name) {
				if (e.data.data[name] === undefined) throw "data ield " + name + " is not set!";
				params[name] = e.data.data[name];
			});

			_.each(action.optParams, function (defValue, name) {
				if (e.data.data[name] === undefined) {
					params[name] = defValue;
				} else {
					params[name] = e.data.data[name];
				}
			})

			// call action
			action.func.call(new CallHelper(e.data._id), params, e.data, e);
		} else {
			throw "action " + e.data.action + " not found";
		}
	})

	//add a function to listener
	self.addAction = function (name, func, params, optParams) {
		if (typeof name !== "string") throw "name must be a string, but is " + typeof name + " instead";
		if (typeof func !== "function") throw "func must be a function, but is " + typeof func + " instead";
		if (params === undefined) params = [];
		methods[name] = {params: params, func: func, optParams: optParams};
		return true;
	}
}(self))

self.addAction('init', function (settings) {
	initScrypt(settings, this);
}, ['n', 'r', 'p', 'l'], {doTest: false})

self.addAction('hash', function ({passw, salt}) {
	if (Scrypt === undefined) {
		return this.error('SCRYPT:MISSING_INIT', 'Did you forgot to call init?');
	}

	this.return(Scrypt.hash(passw, salt));
}, ['passw', 'salt'])