// To run tests:
// 1. Fill in variables in config/test.js
// 2. run "mocha test"

var icloud = require("./index").findmyphone,
    assert = require("assert"),
    config = require("./config/test.js"),
    configDefaults = require("./config/test-sample.js");

var validateConfig = function () {
	var errors = 0;

	if (!config.hasOwnProperty("apple_id")) {
		console.error("Missing apple_id config variable");
		errors++;
	}
	if (!config.hasOwnProperty("apple_password")) {
		console.error("Missing apple_password config variable");
		errors++;
	}
	if (config.apple_id === configDefaults.apple_id) {
		console.error("The apple_id config variable has not been changed from the default");
		errors++;
	}
	if (config.apple_password === configDefaults.apple_password) {
		console.error("The apple_password config variable has not been changed from the default");
		errors++;
	}

	return (errors == 0);
};

describe('Logged in: ', function() {
	var device;

	before(function(done) {
		this.timeout(30000);

		if (!validateConfig()) {
			return;
		}

		icloud.apple_id = config.apple_id;
		icloud.password = config.apple_password;

		assert(icloud.apple_id);
		assert(icloud.password);

		icloud.getDevices(function(error, devices) {
			assert(!error);
			assert(devices);
			assert(devices.length > 0);
			devices.forEach(function(d) {
				if (device == undefined && d.location && d.lostModeCapable) {
					console.log(d);
					device = d;
				}
			});
			assert(device);
			done();
		});
	});

	it('should get distance / driving time', function(done) {
		icloud.getDistanceOfDevice(device, 38.8977, -77.0366, function(err, result) {
			assert(result.distance.value > 0);
			assert(result.duration.value > 0);
			console.log(result.distance.text);
			console.log(result.duration.text);
			done();
		});
	});


	it('should get location', function(done) {
		this.timeout(30000);
		icloud.getLocationOfDevice(device, function(error, location) {
			assert(!error);
			assert(location);
			done();
		});
	});

	it('should send alert', function(done) {
		this.timeout(30000);
		icloud.alertDevice(device.id, function(error) {
			assert(!error);
			done();
		});
	});

	it('should alert with legacy api', function() {
		this.timeout(30000);
		var find = require('./index');
		it('should send legacy alert', function(done) {
			find(icloud.apple_id, icloud.password, null, function(error) {
				assert(!error);
				done();
			});
		});
	});

});
