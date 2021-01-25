const instance_skel = require('../../instance_skel');
const jsxapi = require('jsxapi');

var debug;

/**
 * Companion instance class for Cisco Webex devices.
 *
 * @extends instance_skel
 * @version 1.1.0
 * @since 1.0.0
 * @author Håkon Nessjøen <haakon@bitfocus.io>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {
	xapi = null;

	/**
	 * Create an instance of the Cisco Webex module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.actions(); // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		var actions = {};

		actions['dial'] = {
			label: 'Dial',
			options: [
				{
					type:     'text',
					label:    'Address to call',
					id:       'number',
					default:  'johndoe@example.com',
					required: true
				}
			]
		};

		this.setActions(actions);
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	async action(action) {
		var cmd;
		var opt = action.options;

		if (this.xapi === null) {
			return;
		}

		switch (action.action) {
			case 'dial':
				this.xapi.Command.Dial({
					Number: opt.number
				}).catch(() => {});
				break;
		}

		if (cmd !== undefined) {

		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {
		return [
			{
				type:     'text',
				id:       'info',
				width:    12,
				label:    'Note',
				value:    'This module is for connecting to Cisco Webex hardware like DX80 or Codec Pro K7, etc.'
			},
			{
				type:     'textinput',
				id:       'host',
				label:    'Device Host/IP',
				width:    12,
				regex:    this.REGEX_IP
			},
			{
				type:     'textinput',
				id:       'user',
				label:    'Username',
				width:    6,
				regex:    this.REGEX_SOMETHING
			},
			{
				type:     'textinput',
				id:       'password',
				label:    'Password',
				width:    6,
				regex:    this.REGEX_SOMETHING
			}
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {

		debug("destroy", this.id);
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug;

		this.status(this.STATUS_WARNING,'Connecting'); // status ok!
		this.initFeedbacks();
		//this.initPresets();
		this.initVariables();

		this.initConnection()
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initFeedbacks() {
		var feedbacks = {};

		feedbacks['transport_status'] = {
			label: 'Transport status',
			description: 'Based on transport status, change colors of the bank',
			options: [
				{
					type:    'dropdown',
					label:   'Transport Status',
					id:      'status',
					choices: []
				},
				{
					type:    'colorpicker',
					label:   'Foreground color',
					id:      'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:    'colorpicker',
					label:   'Background color',
					id:      'bg',
					default: this.rgb(0,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (options.status === this.transportInfo.status) {
					return { color: options.fg, bgcolor: options.bg };
				}
			}
		}


		this.setFeedbackDefinitions(feedbacks);
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initVariables() {
		var variables = [];

		variables.push({
			label: 'Transport status',
			name:  'status'
		});
		this.setVariable('status', this.transportInfo['status']);



		this.setVariableDefinitions(variables);
	}

	/**
	 * INTERNAL: setup connection
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initConnection() {

		if (this.xapi !== null) {
			this.xapi.close();
			this.xapi = null;
			this.connected = false;
		}

		try {
			const { host, username, password } = this.config;

			this.xapi = jsxapi.connect('ssh://' + host, {
				username,
				password
			});
			this.status(this.STATUS_WARNING, 'Connecting');

			this.xapi.on('error', (error) => {
				this.status(this.STATUS_ERROR,'Connection error');
				this.log('error', 'Cisco Webex error: ' + error);
				this.xapi = null;
				this.connected = false;
			});

			this.xapi.on('ready', () => {
				this.status(this.STATUS_OK,'Ready');
				this.connected = true;
			})

		} catch (e) {
			this.log('error', 'Error connecting to webex device: ' + e.message);
			this.xapi = null;
			this.connected = false;
		}

	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		this.config = config;

		this.actions();
		this.initFeedbacks();
		//this.initPresets();
		this.initVariables();

		if (resetConnection === true) {
			this.initConnection();
		}
	}
}

exports = module.exports = instance;