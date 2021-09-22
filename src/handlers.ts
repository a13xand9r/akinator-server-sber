import Akinator from 'aki-api/typings/src/Akinator';
import { SaluteHandler } from '@salutejs/scenario'
import { checkWin, runAkinator } from './akinator'
import { AnswerType } from './types';
import { guess } from 'aki-api/typings/src/functions';
import { getRandomFromArray } from './utils/utils';

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

  res.appendCommand({
    type: 'NEW_QUESTION',
    question: aki.question,
    answers: aki.answers,
    currentStep: aki.currentStep
  })
  res.appendCommand({
    type: 'START_GAME',
  })
  res.setPronounceText(`Начнем игру! Первый вопрос: ${aki.question}`)
}

export const userAnswerHandler: SaluteHandler = async ({ req, res, session }) => {
  const { answer } = req.serverAction?.payload as { answer: AnswerType }
  const aki = session.aki as Akinator

  console.log('answer', answer)
  await aki.step(answer)
  const isWin = await checkWin(aki, session.wrongPersonId as string | undefined)
  // console.log('answers', aki.answers)

  if (!isWin) {
    res.appendCommand({
      type: 'NEW_QUESTION',
      question: aki.question,
      answers: aki.answers,
      progress: aki.progress,
      currentStep: aki.currentStep
    })
    res.setPronounceText(`${aki.question}`)
  } else {
    res.appendCommand({
      type: 'WIN_PERSON',
      win: {
        //@ts-ignore
        name: aki.answers[0].name,
        //@ts-ignore
        description: aki.answers[0].description,
        //@ts-ignore
        picture: aki.answers[0].absolute_picture_path,
      }
    })
    //@ts-ignore
    res.setPronounceText(`Кажется это ${aki.answers[0].name}`)
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
    question: aki.question,
    answers: aki.answers,
    progress: aki.progress,
    currentStep: aki.currentStep
  })
  res.setPronounceText(`${aki.question}`)
}

export const wrongGuessHandler: SaluteHandler = async ({ res, session }) => {
  const aki = session.aki as Akinator

  console.log('question', aki.question)
  console.log('answers', aki.answers)

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