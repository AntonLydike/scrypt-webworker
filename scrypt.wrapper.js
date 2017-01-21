// global Scrypt object
let Scrypt;
function initScrypt(params, connection) {

	try {
		scrypt_module_factory(function (scrypt) {
		  try {
				function checkScryptParameter (param) {
					if (typeof param == "string") {						
						return scrypt.encode_utf8(param);
					}
					
					return param;
				}
				
				scrypt.hash = function (passw, salt) {
					passw = checkScryptParameter(passw);
					salt  = checkScryptParameter(salt);
					
					return scrypt.crypto_scrypt(passw, salt, params.n, params.r, params.p, params.l);
				}
				
				if (params.doTest) {
					scrypt.hash("test run", "with salt");
				}

				Scrypt = scrypt;

				connection.return(true);
		  } catch (e) {
				// initial test failed, use more ram!
				connection.error("SCRYPT:BAD_TEST_RUN","Scrypt had an error while the test run", e);
			}	
		}, {requested_total_memory: params.n * 2048}); 
	} catch (e) {
		connection.error("SCRYPT:BAD_DEPLOY","Scrypt had an error while deploying", e);
	}

}