import { XAPI } from 'jsxapi'
import InstanceSkel = require('../../../instance_skel')
import { FeedbackId } from './feedback'

export enum WebexBoolean {
	True = 'True',
	False = 'False'
}

export enum WebexOnOffBoolean {
	On = 'On',
	Off = 'Off',
	Unknown = ''
}

export interface WebexConfigAutoAnswer {
	Delay: string
	Mode: WebexOnOffBoolean
	Mute: WebexOnOffBoolean
}

export interface WebexCall {
	id: string
	AnswerState: string // 'Unanswered' | 'Answered'
	CallType: string
	CallbackNumber: string
	DeviceType: string
	Direction: 'Incoming' | 'Outgoing'
	DisplayName: string
	Duration: string
	Encryption: unknown
	PlacedOnHold?: WebexBoolean
	Protocol: string
	ReceiveCallRate: string
	RemoteNumber: string
	Status: 'Dialling' | 'Connected' | 'Ringing'
	TransmitCallRate: string
	ghost?: WebexBoolean
	Ice: string
}

export abstract class WebexInstanceSkel<T> extends InstanceSkel<T> {
	public xapi?: XAPI
	public ongoingCalls: WebexCall[] = []
	public hasIngoingCall = false
	public hasRingingCall = false
	public hasOutgoingCall = false
	public autoAnswerConfig: WebexConfigAutoAnswer = {
		Delay: '',
		Mode: WebexOnOffBoolean.Unknown,
		Mute: WebexOnOffBoolean.Unknown
	}

	public checkFeedbacks(...feedbackTypes: FeedbackId[]): void {
		super.checkFeedbacks(...feedbackTypes)
	}
}
