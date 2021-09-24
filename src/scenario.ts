import { runAppHandler, noMatchHandler, startGameHandler, userAnswerHandler, goBackHandler, wrongGuessHandler, finishGameHandler } from './handlers';
import {
  createIntents,
  createMatchers,
  createSaluteRequest,
  createSaluteResponse,
  createScenarioWalker,
  createSystemScenario,
  createUserScenario,
  NLPRequest,
  NLPResponse,
  SaluteRequest,
} from '@salutejs/scenario'
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory'
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain'
import model from './intents.json'
require('dotenv').config()

const intents = createIntents(model.intents)
const { action, regexp, intent, text } = createMatchers<SaluteRequest, typeof intents>();

const userScenario = createUserScenario({
  startGame: {
    match: (req) => {
      return action('START_GAME')(req) || intent('/Играть', {confidence: 0.2})(req)
    },
    handle: startGameHandler
  },
  userAnswer: {
    match: (req) => {
      return action('USER_ANSWER')(req) || intent('/Ответ', {confidence: 0.2})(req)
    },
    handle: userAnswerHandler
  },
  goBack: {
    match: (req) => {
      return action('GO_BACK')(req) || intent('/Назад', {confidence: 0.2})(req)
    },
    handle: goBackHandler
  },
  wrongGuess: {
    match: (req) => {
      return action('WRONG_GUESS')(req) || intent('/Продолжить', {confidence: 0.2})(req)
    },
    handle: wrongGuessHandler
  },
  finishGame: {
    match: (req) => {
      return action('FINISH_GAME')(req) || intent('/Закончить игру', {confidence: 0.2})(req)
    },
    handle: finishGameHandler
  },
})

const systemScenario = createSystemScenario({
  RUN_APP: runAppHandler,
  NO_MATCH: noMatchHandler
})

const scenarioWalker = createScenarioWalker({
  recognizer: new SmartAppBrainRecognizer('0da03965-1326-48b8-9650-1c3e70920ffa'),
  intents,
  userScenario,
  systemScenario
})

const storage = new SaluteMemoryStorage()

export const handleNlpRequest = async (request: NLPRequest): Promise<NLPResponse> => {
  const req = createSaluteRequest(request)
  const res = createSaluteResponse(request)
  const sessionId = request.uuid.userId
  const session = await storage.resolve(sessionId)
  await scenarioWalker({ req, res, session })

  await storage.save({ id: sessionId, session })

  return res.message
}