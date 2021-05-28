import { WebexInstanceSkel, WebexOnOffBoolean, WebexConfigAutoAnswer } from './webex'
import {
	CompanionActionEvent,
	CompanionConfigField,
	CompanionFeedbackEvent,
	CompanionFeedbackResult,
	CompanionSystem
} from '../../../instance_skel_types'
import { DeviceConfig, GetConfigFields } from './config'
import { connect as XAPIConnect } from 'jsxapi'
import { ExecuteFeedback, FeedbackId, GetFeedbacksList, HandleXAPIFeedback, HandleXAPIConfFeedback } from './feedback'
import { GetActionsList, HandleAction } from './actions'
import { GetPresetsList } from './presets'
import { InitVariables } from './variables'

class ControllerInstance extends WebexInstanceSkel<DeviceConfig> {
	private connected: boolean
	private connecting: boolean
	private timer?: NodeJS.Timer

	constructor(system: CompanionSystem, id: string, config: DeviceConfig) {
		super(system, id, config)

		this.connected = false
		this.connecting = false
	}

	// Override base types to make types stricter
	public checkFeedbacks(...feedbackTypes: FeedbackId[]): void {
		if (this.connected) {
			super.checkFeedbacks(...feedbackTypes)
		}
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public init(): void {
		this.status(this.STATUS_UNKNOWN)

		this.updateConfig(this.config)
		this.timer = setInterval(() => this.tick(), 5000)
	}

	/**
	 * INTERNAL: Reset class variables
	 *
	 * @access protected
	 */
	reset(): void {
		this.ongoingCalls = []
		this.connected = false
		this.hasIngoingCall = false
		this.hasOutgoingCall = false
		this.hasRingingCall = false
		this.autoAnswerConfig = {
			Delay: '',
			Mode: WebexOnOffBoolean.Unknown,
			Mute: WebexOnOffBoolean.Unknown
		}
	}

	/**
	 * INTERNAL: Setup connection
	 *
	 * @access protected
	 */
	public tick(): void {
		console.log('Tick:', { connected: this.connected, connecting: this.connecting, host: this.config?.host })
		if (!this.connected && !this.connecting) {
			if (this.config?.host) {
				this.initConnection()
			}
		}
	}

	/**
	 * INTERNAL: Setup connection
	 *
	 * @access protected
	 */
	initConnection(): void {
		if (this.xapi !== undefined) {
			this.xapi.close()
			this.xapi = undefined
			this.reset()
			InitVariables(this)
		}
		this.connecting = true

		try {
			const { host, username, password } = this.config

			this.xapi = XAPIConnect('ssh://' + host, {
				username,
				password
			})

			this.status(this.STATUS_WARNING, 'Connecting')

			this.xapi.on('error', error => {
				this.status(this.STATUS_ERROR, 'Connection error')
				this.log('error', 'Cisco Webex error: ' + error)
				this.xapi = undefined
				this.connected = false
				this.connecting = false
				this.reset()
			})

			this.xapi.on('ready', () => {
				console.log('ready THIS:', this)
				this.status(this.STATUS_OK, 'Ready')
				this.checkFeedbacks()

				this.xapi?.config.get('Conference AutoAnswer').then(value => {
					console.log('CONFIG GET: ', value)
					if (value?.Mode) {
						this.autoAnswerConfig = value as WebexConfigAutoAnswer
						this.setVariable('autoanswer_mode', this.autoAnswerConfig.Mode)
						this.setVariable('autoanswer_delay', this.autoAnswerConfig.Delay)
					}
				})
				this.connecting = false
				this.connected = true
			})

			this.xapi.feedback.on('Status', event => HandleXAPIFeedback(this, event))
			this.xapi.feedback.on('Configuration', event => HandleXAPIConfFeedback(this, event))
		} catch (e) {
			this.log('error', 'Error connecting to webex device: ' + e.message)
			this.xapi = undefined
			this.connected = false
			this.connecting = false
			this.reset()
		}
	}

	/**
	 * Process an updated configuration array.
	 */
	public updateConfig(config: DeviceConfig): void {
		this.config = config

		this.initConnection()
		InitVariables(this)
		this.setPresetDefinitions(GetPresetsList(this))
		this.setActions(GetActionsList(this))

		this.setFeedbackDefinitions(GetFeedbacksList(this))
	}

	/**
	 * Executes the provided action.
	 */
	public action(action: CompanionActionEvent): void {
		if (this.xapi !== undefined) {
			HandleAction(this, action)
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	// eslint-disable-next-line @typescript-eslint/camelcase
	public config_fields(): CompanionConfigField[] {
		return GetConfigFields(this)
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	public destroy(): void {
		try {
			if (this.xapi !== undefined) {
				this.xapi.close()
			}
		} catch (e) {
			// Ignore
		}

		if (this.timer !== undefined) {
			clearInterval(this.timer)
			this.timer = undefined
		}

		this.debug('destroy', this.id)
	}

	/**
	 * Processes a feedback state.
	 */
	public feedback(feedback: CompanionFeedbackEvent): CompanionFeedbackResult {
		if (this.xapi !== undefined) {
			return ExecuteFeedback(this, feedback)
		}

		return {}
	}
}

export = ControllerInstance
