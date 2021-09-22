import Akinator from 'aki-api/typings/src/Akinator'
import { Router } from 'express'
import { runAkinator } from './akinator'
import { handleNlpRequest } from './scenario'

export const akinator = Router()
export const apiHookRout = Router()

let aki: Akinator

akinator.get('/api/aki', async (req, res) => {
  const method = req.query.method as MethodType
  const answerNumber = Number(req.query.answer as string) as 1 | 2 | 3 | 4
  if (method === 'start') {
    aki = await runAkinator()
    res.status(200).json({ question: aki.question as string, answers: aki.answers as string[] })
  } else {
    await aki.step(answerNumber)
    console.log('currentStep', aki.currentStep)
    console.log('progress', aki.progress)
    console.log('guessCount', aki.guessCount)
    if (aki.progress > 70) {
      let win = await aki.win()
      console.log('win')
      console.log('firstGuess:', aki.answers);
    }
    console.log('\n')
    res.status(200).json({ question: aki.question as string, answers: aki.answers as string[] })
  }
  res.status(200).json()
})
apiHookRout.post('/api/hook', async (req, res) => {
  console.log('api/hook request')
  res.status(200).json(await handleNlpRequest(req.body))
})
apiHookRout.get('/api/hook', (req, res) => {
  console.log('api/hook GET request')
  res.status(200).json({status: 'make method POST'})
})

type MethodType = 'start' | 'answer'