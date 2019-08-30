/* global Log, Module, MM */
/* Magic Mirror
 * Module: MMM-Alerts
 *
 * By Borja Igartua
 * GPL-3.0 Licensed.
 */
Module.register( "MMM-Alerts", {
	requiresVersion: "2.0.0",

    self: null,
    alerts : new Array(),
    currentAlert: null,
    currentAlertPosition: 0,    

	defaults: {
        maxAlerLifetime: 86400, //in seconds
        alertCheckTimeInterval: 43200,
		updateInterval: 5
	}, 

	start: function() {        
        self = this;

        Log.info( "Starting module: " + this.name );
        this.sendSocketNotification('ALERT_CONFIG', {});

        setInterval(() => {
            this.checkInvalidAlerts();
        }, (this.config.alertCheckTimeInterval * 1000));
        
        setInterval(() => {
            this.updateNextAlert();
        }, (this.config.updateInterval * 1000));
    },
    addAlert: function(message) {
        var now = Math.round((new Date()).getTime() / 1000);
        this.alerts.push({ date: now, message: message });
    },
    checkInvalidAlerts: function() {
        if (!this.alerts || this.alerts.length == 0) return

        var now = Math.round((new Date()).getTime() / 1000);
        var uptodatealerts = new Array();
        this.alerts.forEach(function(alert) {
            if ((now - alert.date) < self.config.maxAlerLifetime) {
                uptodatealerts.push(alert);
            }
        });
        this.alerts = uptodatealerts;
    },
    updateNextAlert: function() {
        if (this.alerts.length == 0) { return }        

        if (this.currentAlertPosition >= this.alerts.length) {
            this.currentAlertPosition = 0;
        }        

        var alert = this.alerts[this.currentAlertPosition];
        this.currentAlertPosition += 1;
        if (this.currentAlert != null && alert.message == this.currentAlert.message) { return }
                    
        this.currentAlert = alert;        
        this.updateDom(4000);
    },
    getDom: function() {

        if (this.currentAlert) {
            Log.info(`ALERT: updating DOM`);
            var alert = document.createTextNode(this.currentAlert.message);
            var wrapper = document.createElement("div");
            wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright pre-line";
            wrapper.appendChild(alert);

            return wrapper;
        }
	},
    socketNotificationReceived: function(notification, payload) {
        Log.info(`MMM-Alerts received a socket notification: ${notification} payload: ${payload}`);

        if (notification == "NEW_ALERT") {
            this.addAlert(payload.alert);
            this.updateNextAlert();            
        }
	} 
} );
