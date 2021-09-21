import { runAppHandler, noMatchHandler, startGameHandler, userAnswerHandler } from './handlers';
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
// import model from './intents.json'
require('dotenv').config()

// const intents = createIntents(model.intents)
const { action, regexp, intent, text } = createMatchers<SaluteRequest/*, typeof intents*/>();

const userScenario = createUserScenario({
  startGame: {
    match: (req) => {
      return action('START_GAME')(req)// || intent(...)
    },
    handle: startGameHandler
  },
  userAnswer: {
    match: (req) => {
      return action('USER_ANSWER')(req)// || intent(...)
    },
    handle: userAnswerHandler
  },
})

const systemScenario = createSystemScenario({
  RUN_APP: runAppHandler,
  NO_MATCH: noMatchHandler
})

const scenarioWalker = createScenarioWalker({
  recognizer: new SmartAppBrainRecognizer(process.env.SMARTAPP_BRAIN_TOKEN),
  // intents,
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