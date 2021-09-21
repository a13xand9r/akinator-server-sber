import Akinator from 'aki-api/typings/src/Akinator';
import { SaluteHandler } from '@salutejs/scenario'
import { checkWin, runAkinator } from './akinator'
import { AnswerType } from './types';
import { guess } from 'aki-api/typings/src/functions';

export const runAppHandler: SaluteHandler = ({ res }) => {
  res.setPronounceText('начнем')
}

export const noMatchHandler: SaluteHandler = ({ res }) => {
  res.setPronounceText('Хм, не понимаю о чем вы')
}

export const startGameHandler: SaluteHandler = async ({ req, res, session }) => {
  session.aki = await runAkinator()
  const aki = session.aki as Akinator

  res.appendCommand({
    type: 'NEW_QUESTION',
    question: aki.question,
    answers: aki.answers,
    currentStep: aki.currentStep
  })
  res.setPronounceText(`Начнем игру! Первый вопрос: ${aki.question}`)
}

export const userAnswerHandler: SaluteHandler = async ({ req, res, session }) => {
  const { answer } = req.serverAction?.payload as {answer: AnswerType}
  const aki = session.aki as Akinator

  aki.step(answer)
  const isWin = checkWin(aki)

  if (!isWin){
    res.appendCommand({
      type: 'NEW_QUESTION',
      question: aki.question,
      answers: aki.answers,
      currentStep: aki.currentStep
    })
    res.setPronounceText(`${aki.question}`)
  } else {
    res.appendCommand({
      type: 'WIN_PERSON',
      //@ts-ignore
      answer: aki.answers[0].name,
      //@ts-ignore
      description: aki.answers[0].description,
      //@ts-ignore
      picture: aki.answers[0].picture_path,
    })
    res.setPronounceText(`Кажется это ${aki.question}`)
  }
}