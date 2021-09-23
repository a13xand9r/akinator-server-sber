import Akinator from 'aki-api/typings/src/Akinator';
import { SaluteHandler } from '@salutejs/scenario'
import { checkWin, nextStep, runAkinator } from './akinator'
import { AnswerType } from './types';
import { getRandomFromArray, translateFromEnToRu } from './utils/utils';

export const runAppHandler: SaluteHandler = ({ res }) => {
  res.setPronounceText('начнем')
  res.appendBubble('начнем')
}

export const noMatchHandler: SaluteHandler = ({ res }) => {
  res.setPronounceText('Хм, не понимаю о чем вы')
}

export const startGameHandler: SaluteHandler = async ({ res, session }) => {
  session.aki = await runAkinator()
  const aki = session.aki as Akinator

  console.log('question', aki.question)
  console.log('answers', aki.answers)

  const question = await translateFromEnToRu(aki.question as string)

  res.appendCommand({
    type: 'NEW_QUESTION',
    question,
    answers: aki.answers,
    currentStep: aki.currentStep
  })
  res.appendCommand({
    type: 'START_GAME',
  })
  res.setPronounceText(`Начнем игру! Первый вопрос: ${question}`)
}

export const userAnswerHandler: SaluteHandler = async ({ req, res, session }) => {
  const { answer } = req.serverAction?.payload as { answer: AnswerType }
  const aki = session.aki as Akinator

  console.log('stepHandler')
  await nextStep(aki, answer)
  const isWin = await checkWin(aki, session.wrongPersonId as string | undefined)

  if (!isWin) {
    const question = await translateFromEnToRu(aki.question as string)

    res.appendCommand({
      type: 'NEW_QUESTION',
      question,
      answers: aki.answers,
      progress: aki.progress,
      currentStep: aki.currentStep
    })
    res.setPronounceText(`${question}`)
  } else {
    //@ts-ignore
    const name = await translateFromEnToRu(aki.answers[0].name as string)
    //@ts-ignore
    const description = await translateFromEnToRu(aki.answers[0].description as string)

    res.appendCommand({
      type: 'WIN_PERSON',
      win: {
        name,
        description,
        //@ts-ignore
        picture: aki.answers[0].absolute_picture_path,
      }
    })
    //@ts-ignore
    res.setPronounceText(`Кажется это ${name}`)
  }
}

export const goBackHandler: SaluteHandler = async ({ res, session }) => {
  const aki = session.aki as Akinator

  await aki.back()

  res.appendCommand({
    type: 'WIN_PERSON',
    win: null
  })
  res.appendCommand({
    type: 'NEW_QUESTION',
    question: translateFromEnToRu(aki.question as string),
    answers: aki.answers,
    progress: aki.progress,
    currentStep: aki.currentStep
  })
  res.setPronounceText(`${translateFromEnToRu(aki.question as string)}`)
}

export const wrongGuessHandler: SaluteHandler = async ({ res, session }) => {
  const aki = session.aki as Akinator

  //@ts-ignore
  session.wrongPersonId = aki.answers[0].id

  res.appendCommand({
    type: 'WIN_PERSON',
    win: null
  })
  res.appendCommand({
    type: 'NEW_QUESTION',
    question: aki.question,
    answers: aki.answers,
    currentStep: aki.currentStep
  })
  res.setPronounceText(`${aki.question}`)
}

export const finishGameHandler: SaluteHandler = async ({req, res, session }) => {
  const { isWin }= req.serverAction?.payload as {isWin: boolean}

  const winText = ['Отлично! Может ещё раз?', 'Да, я умею угадывать', 'Проще простого!', 'Легче легкого!', 'Ещё разок?']
  const loseText = ['Может ещё раз? В этот раз угадаю', 'Жаль, не получилось. А может ещё раз?', 'Эх, жаль. Может ещё разок?', 'Я хочу взять реванш']
  if (isWin){
    res.setPronounceText(getRandomFromArray(winText))
  } else {
    res.setPronounceText(getRandomFromArray(loseText))
  }
}