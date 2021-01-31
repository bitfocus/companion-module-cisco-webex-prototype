import { WebexInstanceSkel } from './webex'
import { CompanionActionEvent, CompanionActions, CompanionInputFieldDropdown } from '../../../instance_skel_types'
import { DeviceConfig } from './config'

export enum ActionId {
	Dial = 'dial',
	//Accept = 'accept',
	AutoAnswerMode = 'autoanswermode',
	AutoAnswerDelay = 'autoanswerdelay',
	SetConfig = 'setconfig',
	Custom = 'custom'
}

export enum PlayPauseToggle {
	Play = 'play',
	Pause = 'pause',
	Toggle = 'toggle'
}

function WebexOnOffBooleanDropdown(id: string, label: string): CompanionInputFieldDropdown {
	return {
		id,
		label,
		type: 'dropdown',
		default: 'Off',
		choices: [
			{
				label: 'On',
				id: 'On'
			},
			{
				label: 'Off',
				id: 'Off'
			},
			{
				label: 'Toggle',
				id: 'Toggle'
			}
		]
	}
}

export function GetActionsList(self: WebexInstanceSkel<DeviceConfig>): CompanionActions {
	const actions: CompanionActions = {}

	actions[ActionId.Dial] = {
		label: 'Dial',
		options: [
			{
				type: 'textinput',
				label: 'Address to call',
				id: 'number',
				default: '',
				regex: self.REGEX_SOMETHING
			}
		]
	}

	/* Not supported, "Call join" is only accepted internally, 🤷🏻‍♂️
	actions[ActionId.Accept] = {
		label: 'Accept current caller',
		options: []
	}*/

	actions[ActionId.AutoAnswerMode] = {
		label: 'Configure auto-answer state',
		options: [WebexOnOffBooleanDropdown('Mode', 'Mode')]
	}

	actions[ActionId.AutoAnswerDelay] = {
		label: 'Configure auto-answer delay',
		options: [
			{
				type: 'textinput',
				default: '0',
				label: 'Delay (in seconds)',
				id: 'Delay',
				regex: self.REGEX_NUMBER
			}
		]
	}

	actions[ActionId.SetConfig] = {
		label: 'Set configuration',
		options: [
			{
				type: 'textinput',
				label: 'Key to change',
				id: 'key',
				default: ''
			},
			{
				type: 'textinput',
				label: 'Value to set',
				id: 'value',
				default: ''
			}
		]
	}

	actions[ActionId.Custom] = {
		label: 'Custom command',
		options: [
			{
				type: 'textinput',
				label: 'Command',
				id: 'command',
				default: 'Presentation/Start'
			}
		]
	}

	return actions
}

export async function HandleAction(
	instance: WebexInstanceSkel<DeviceConfig>,
	action: CompanionActionEvent
): Promise<void> {
	const opt = action.options

	try {
		const actionId = action.action as ActionId
		switch (actionId) {
			case ActionId.Dial: {
				instance.xapi?.Command.Dial({
					Number: opt.number
				}).catch((e: unknown) => instance.log('warn', `Webex: Dial failed: ${e}`))
				break
			}

			/* Not supported, "Call join" is only accepted internally, 🤷🏻‍♂️
			case ActionId.Accept: {
				const incomingCall = instance.ongoingCalls.find(
					call => call.Direction === 'Incoming' && call.Status === 'Ringing'
				)
				if (incomingCall) {
					instance.xapi
						?.command('Call Join', { CallId: incomingCall.id })
						.catch((e: unknown) => instance.log('warn', `Webex: Answer failed: ${JSON.stringify(e)}`))
				} else {
					instance.log('warn', `Webex: While trying to answer call, no incoming calls were found`)
				}
				break
			}
			*/

			case ActionId.AutoAnswerMode: {
				let Mode = String(opt.Mode)

				if (Mode === 'Toggle') {
					Mode = instance.autoAnswerConfig.Mode === 'On' ? 'Off' : 'On'
				}

				try {
					await instance.xapi?.config.set('Conference AutoAnswer Mode', Mode)
				} catch (e) {
					instance.log('warn', `Webex: Auto-answer configuration failed: ${e.message}`)
				}
				break
			}

			case ActionId.AutoAnswerDelay: {
				const Delay = parseInt(String(opt.Delay))

				try {
					await instance.xapi?.config.set('Conference AutoAnswer Delay', Delay)
				} catch (e) {
					instance.log('warn', `Webex: Auto-answer configuration failed: ${e.message}`)
				}
				break
			}

			case ActionId.SetConfig: {
				instance.xapi?.config
					.set(String(opt.key), String(opt.value))
					.catch((e: unknown) => instance.log('warn', `Webex: Set config failed: ${JSON.stringify(e)}`))
				break
			}

			case ActionId.Custom: {
				instance.xapi
					?.command(String(opt.command))
					.catch((e: unknown) => instance.log('warn', `Webex: Custom command failed: ${JSON.stringify(e)}`))
				break
			}

			default:
				instance.log('warn', `Webex: Unhandeled action: ${actionId}`)
		}
	} catch (e) {
		instance.debug('Action failed: ' + e)
	}
}
