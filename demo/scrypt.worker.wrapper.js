(function () {
	let uniqIDC = 0;
	function uniqID () {
		return "" + uniqIDC++ + "#" + performance.now().toString(32);
	}

	function ScryptWorker (params, url, done) {
		const worker = new Worker(url),
					requests = {},
					self = this;

		this.params = params;

		worker.addEventListener('message', (result) => {
			let id = result.data._id;

			requests[id](result.data);
		});

		worker.addEventListener("error", e => {
			console.log('Error received from scrypt worker:', e);
		});

		worker.execute = function (action, data) {
			return new Promise(function (resolve, reject) {
				let id = uniqID();

				requests[id] = function (result) {
					if (result.success) return resolve(result.data);

					reject(result);
				}

				worker.postMessage({action: action, data: data, _id: id})
			})
		}

		worker.execute('init', params).then(() => {
			self.hash = function (passw, salt) {
				return worker.execute('hash', {passw, salt});
			}

			done(true);
		}).catch((e) => {
			done(false, e);
		})
	}

	window.createScryptWorker = function (params, url) {
		return new Promise(function (resolve, reject) {
			let worker = new ScryptWorker(params, url, function (success, error) {
				if (success) return resolve(worker);

				reject(error);
			});
		})
	}
})()