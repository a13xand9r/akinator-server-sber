import {
  AppState,
  SaluteRequest,
  SaluteRequestVariable
} from '@salutejs/scenario'
import Akinator from './aki-api/Akinator'

export type SessionType = {
  aki: Akinator
}

export type AnswerType = 0 | 1 | 2 | 3 | 4

type ServerActionType = {
  payload: object
  type: string
}

export type CustomRequest = SaluteRequest<SaluteRequestVariable, AppState, ServerActionType>