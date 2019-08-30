
'use strict';

/* global module, require */
const NodeHelper = require( "node_helper" );
const bodyParser = require( "body-parser" );

module.exports = NodeHelper.create( {

	// Subclass start method.
	start: function() {
		console.log( "Starting node helper for: " + this.name );
		var self = this;
		this.expressApp.use(bodyParser.json());

		this.expressApp.post('/alert', function( req, res ) {
			self.sendSocketNotification('NEW_ALERT', { alert: req.body.alert });
			res.send('all good!');
		});
	},
	socketNotificationReceived: function( notification, payload ) {
		if (notification == 'ALERT_CONFIG') {
			console.log(`Module ${this.name} configured`);		
		}		
	}
} );
