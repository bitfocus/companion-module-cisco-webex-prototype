import InstanceSkel = require('../../../instance_skel')
import { CompanionPreset } from '../../../instance_skel_types'
import { ActionId } from './actions'
import { DeviceConfig } from './config'
import { FeedbackId } from './feedback'
import { XAPI } from 'jsxapi'

interface CompanionPresetExt extends CompanionPreset {
	feedbacks: Array<
		{
			type: FeedbackId
		} & CompanionPreset['feedbacks'][0]
	>
	actions: Array<
		{
			action: ActionId
		} & CompanionPreset['actions'][0]
	>
}

export function GetPresetsList(instance: InstanceSkel<DeviceConfig>, _xapi?: XAPI): CompanionPreset[] {
	const presets: CompanionPresetExt[] = []

	presets.push({
		category: 'General functions',
		label: `Dial`,
		bank: {
			style: 'text',
			text: `Dial`,
			size: 'auto',
			color: instance.rgb(255, 255, 255),
			bgcolor: instance.rgb(0, 0, 0)
		},
		feedbacks: [
			{
				type: FeedbackId.HasOutgoingCall,
				options: {
					bg: instance.rgb(0, 255, 0),
					fg: instance.rgb(0, 0, 0)
				}
			}
		],
		actions: [
			{
				action: ActionId.Dial,
				options: {
					number: ''
				}
			}
		]
	})

	presets.push({
		category: 'General functions',
		label: `Toggle auto-answer`,
		bank: {
			style: 'text',
			text: `AA\\n$(int:autoanswer_mode)`,
			size: 'auto',
			color: instance.rgb(255, 255, 255),
			bgcolor: instance.rgb(0, 0, 0)
		},
		feedbacks: [
			{
				type: FeedbackId.AutoAnswer,
				options: {
					bg: instance.rgb(255, 255, 255),
					fg: instance.rgb(0, 0, 0)
				}
			}
		],
		actions: [
			{
				action: ActionId.AutoAnswerMode,
				options: {
					Mode: 'Toggle'
				}
			}
		]
	})

	presets.push({
		category: 'Visual buttons',
		label: `Show active ingoing calls`,
		bank: {
			style: 'text',
			text: `Ingoing\\n$(int:ingoing_calls)`,
			size: 'auto',
			color: instance.rgb(255, 255, 255),
			bgcolor: instance.rgb(0, 0, 0)
		},
		feedbacks: [
			{
				type: FeedbackId.HasIngoingCall,
				options: {
					bg: instance.rgb(0, 255, 0),
					fg: instance.rgb(0, 0, 0)
				}
			}
		],
		actions: []
	})

	presets.push({
		category: 'Visual buttons',
		label: `Show active outgoing calls`,
		bank: {
			style: 'text',
			text: `Outgoing\\n$(int:outgoing_calls)`,
			size: 'auto',
			color: instance.rgb(255, 255, 255),
			bgcolor: instance.rgb(0, 0, 0)
		},
		feedbacks: [
			{
				type: FeedbackId.HasOutgoingCall,
				options: {
					bg: instance.rgb(0, 255, 0),
					fg: instance.rgb(0, 0, 0)
				}
			}
		],
		actions: []
	})

	presets.push({
		category: 'Visual buttons',
		label: `Show ingoing ringing calls`,
		bank: {
			style: 'text',
			text: `Ringing\\n$(int:ingoing_ringing_calls)`,
			size: 'auto',
			color: instance.rgb(255, 255, 255),
			bgcolor: instance.rgb(0, 0, 0)
		},
		feedbacks: [
			{
				type: FeedbackId.Ringing,
				options: {
					bg: instance.rgb(0, 255, 0),
					fg: instance.rgb(0, 0, 0)
				}
			}
		],
		actions: []
	})

	presets.push({
		category: 'Visual buttons',
		label: `Device is ringing`,
		bank: {
			style: 'text',
			text: `Idle`,
			size: 'auto',
			color: instance.rgb(255, 255, 255),
			bgcolor: instance.rgb(0, 0, 0)
		},
		feedbacks: [
			{
				type: FeedbackId.Ringing,
				options: {
					bg: instance.rgb(0, 255, 0),
					fg: instance.rgb(0, 0, 0)
				}
			}
		],
		actions: []
	})

	return presets
}
