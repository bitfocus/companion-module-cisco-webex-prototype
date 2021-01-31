import InstanceSkel = require('../../../instance_skel')
import { CompanionVariable } from '../../../instance_skel_types'
import { DeviceConfig } from './config'
import { XAPI } from 'jsxapi'

export function InitVariables(instance: InstanceSkel<DeviceConfig>, _xapi?: XAPI): void {
	const variables: CompanionVariable[] = []

	variables.push({
		label: `Number of outgoing calls`,
		name: `outgoing_calls`
	})
	variables.push({
		label: `Number of ingoing calls`,
		name: `ingoing_calls`
	})
	variables.push({
		label: `Number of ingoing actively ringing calls`,
		name: `ingoing_ringing_calls`
	})
	variables.push({
		label: `Autoanswer activated`,
		name: `autoanswer_mode`
	})
	variables.push({
		label: `Autoanswer delay`,
		name: `autoanswer_delay`
	})

	instance.setVariable('outgoing_calls', '0')
	instance.setVariable('ingoing_calls', '0')
	instance.setVariable('ingoing_ringing_calls', '0')

	instance.setVariableDefinitions(variables)
}
