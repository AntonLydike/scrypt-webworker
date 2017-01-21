# The WebWorker based Scrypt project

Scrypt implementation as webworkers. This uses promises and other Es6 features so I'll have to put it through babel before it can be used for more than very small homebrewed projects...

## what each file is for:

 - `scrypt.js` the js-scrypt library. Taken from [tonyg/js-scrypt](https://github.com/tonyg/js-scrypt)
 - `scrypt.wrapper.js` a wrapper to initiate scrypt with each parameters, test it and communicate errors
 - `lodash.min.js` lodash library minified
 - `scrypt.worker.js` code that adds workerAPI and worker methods. This file contains all build instructions and can be built with `enary build -w scrypt.worker.js`
 - `scrypt.worker.build.js` a completely built version of this project. This is the webworker file
 - `scrypt.worker.wrapper.js` The file loaded in the browser. Contains all the code to create new Workers.

### Structure of `scrypt.worker.js`

```` js
// @build add scrypt.js
// @build add scrypt.wrapper.js
// @build add lodash.min.js
````

This part imports Scrypt, then my Scrypt wrapper and then the lodash library.

```` js
(function (self) {
	// ...
}(self))
````

This is a self-made webworker helper to easily register actions for a webworker.

```` js
self.addAction('init', function (settings) {
	initScrypt(settings, this);
}, ['n', 'r', 'p', 'l'], {doTest: false})

self.addAction('hash', function ({passw, salt}) {
	if (Scrypt === undefined) {
		return this.error('SCRYPT:MISSING_INIT', 'Did you forgot to call init?');
	}

	this.return(Scrypt.hash(passw, salt));
}, ['passw', 'salt'])
````

This part registers the init function and the hash method.

You can pass `doTest:true` in the settings to `createScryptWorker(settings, workerUrl)` in order to perform an initial test run to verify that enough RAM is available etc...

## Setup

 1. Copy `scrypt.worker.build.js` someplace accessible on your page. Don't include it via `<script src="url...">`
 2. Copy `scrypt.worker.wrapper.js` to your project and include it via `script` tag.
 

## Usage

### Create new worker

create a new worker like this:

```` js
createScryptWorker({
	p: 1, 
	r: 8, 
	n: 16384, 
	l: 32
}, '/path/to/scrypt.worker.build.js'
).then((worker) => {
	window.Scrypt = worker;
})
````

### Use a worker to calculate a hash

```` js
Scrypt.hash("passw", "salt").then((Ui8Hash) => {
	// hash is a Uint8Array containing the hash value
	let HexHash = HexFromUi8(Ui8Hash);
})

// HexFromUi8 method:
function HexFromUi8 (Ui8Start) {
    for (var hex = [], i = 0; i < Ui8Start.length; i++) {
        hex.push((Ui8Start[i] >>> 4).toString(16));
        hex.push((Ui8Start[i] & 0xF).toString(16));
    }
    return hex.join("");
}
````
## Demo

You can see the demo code working [here](https://rawgit.com/AntonLydike/scrypt-webworker/master/demo/index.html).

## License


js-scrypt is written by Tony Garnock-Jones
<tonygarnockjones@gmail.com> and is licensed under the [2-clause BSD license](http://opensource.org/licenses/BSD-2-Clause):

> Copyright &copy; 2013&ndash;2016, Tony Garnock-Jones
> All rights reserved.
>
> Redistribution and use in source and binary forms, with or without
> modification, are permitted provided that the following conditions
> are met:
>
> 1. Redistributions of source code must retain the above copyright
>    notice, this list of conditions and the following disclaimer.
>
> 2. Redistributions in binary form must reproduce the above copyright
>    notice, this list of conditions and the following disclaimer in
>    the documentation and/or other materials provided with the
>    distribution.
>
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
> "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
> LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
> FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
> COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
> INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
> BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
> LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
> CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
> LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
> ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
> POSSIBILITY OF SUCH DAMAGE.

js-scrypt relies on `scrypt` itself, which is written by Colin
Percival and licensed as follows:

> Copyright 2009 Colin Percival
> All rights reserved.
>
> Redistribution and use in source and binary forms, with or without
> modification, are permitted provided that the following conditions
> are met:
>
> 1. Redistributions of source code must retain the above copyright
>    notice, this list of conditions and the following disclaimer.
> 2. Redistributions in binary form must reproduce the above copyright
>    notice, this list of conditions and the following disclaimer in the
>    documentation and/or other materials provided with the distribution.
>
> THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
> ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
> IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
> ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
> FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
> DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
> OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
> HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
> LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
> OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
> SUCH DAMAGE.
