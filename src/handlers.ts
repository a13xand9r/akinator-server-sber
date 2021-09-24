import Akinator from 'aki-api/typings/src/Akinator';
import { SaluteHandler } from '@salutejs/scenario'
import { checkWin, nextStep, runAkinator } from './akinator'
import { AnswerType } from './types';
import { getRandomFromArray } from './utils/utils';
import { region } from 'aki-api';

export const runAppHandler: SaluteHandler = ({ req, res }) => {
  if (req.request.payload.character.appeal === 'official'){
    res.setPronounceText('<speak>Здравствуйте! Здесь я буду в роли Джина Акина\'тора. Я могу угадать любого персонажа, которого вы загадали и помогу в изучении английского. Давайте играть и учить английский вместе.</speak>')
    res.appendBubble('Здравствуйте! Здесь я буду в роли Джина Акинатора. Я могу угадать любого персонажа, которого вы загадали и помогу в изучении английского. Давайте играть и учить английский вместе.')
  }
  res.setPronounceText('<speak>Привет! Здесь я буду в роли Джина Акина\'тора. Я могу угадать любого персонажа, которого ты загадал и помогу в изучении английского. Давай играть и учить английский вместе.</speak>')
  res.appendBubble('Привет! Здесь я буду в роли Джина Акинатора. Я могу угадать любого персонажа, которого ты загадал и помогу в изучении английского. Давай играть и учить английский вместе.')
}

export const noMatchHandler: SaluteHandler = ({ res }) => {
  res.setPronounceText('You can answer the questions I ask. And I will guess your character.')
  res.appendBubble('You can answer the questions I ask. And I will guess your character.')
}

export const startGameHandler: SaluteHandler = async ({ req, res, session }) => {
  console.log('process', process.env.REGION)
  session.aki = await runAkinator(process.env.REGION as region)
  const aki = session.aki as Akinator

  console.log('question', aki.question)
  console.log('answers', aki.answers)

  const question = aki.question as string//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)

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
    const question = aki.question as string//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)

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
    const name = aki.answers[0].name as string//await translateFromEnToRu(aki.answers[0].name as string)
    //@ts-ignore
    const description = aki.answers[0].description as string//await translateFromEnToRu(aki.answers[0].description as string)

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
    res.setPronounceText(`I think this is ${name}`)
  }
}

export const goBackHandler: SaluteHandler = async ({ req, res, session }) => {
  const aki = session.aki as Akinator

  await aki.back()

  const question = aki.question as string//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)

  res.appendCommand({
    type: 'WIN_PERSON',
    win: null
  })
  res.appendCommand({
    type: 'NEW_QUESTION',
    question: question,
    answers: aki.answers,
    progress: aki.progress,
    currentStep: aki.currentStep
  })
  res.setPronounceText(`${question}`)
}

export const wrongGuessHandler: SaluteHandler = async ({ req, res, session }) => {
  const aki = session.aki as Akinator

  //@ts-ignore
  session.wrongPersonId = aki.answers[0].id

  const question = aki.question//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)

  res.appendCommand({
    type: 'WIN_PERSON',
    win: null
  })
  res.appendCommand({
    type: 'NEW_QUESTION',
    question: question,
    answers: aki.answers,
    currentStep: aki.currentStep
  })
  res.setPronounceText(`${question}`)
}

export const finishGameHandler: SaluteHandler = async ({req, res, session }) => {
  const { isWin }= req.serverAction?.payload as {isWin: boolean}

  // const winText = ['Отлично! Может ещё раз?', 'Да, я умею угадывать', 'Проще простого!', 'Легче легкого!', 'Ещё разок?']
  // const loseText = ['Может ещё раз? В этот раз угадаю', 'Жаль, не получилось. А может ещё раз?', 'Эх, жаль. Может ещё разок?', 'Я хочу взять реванш']
  const winText = ['Great! One more time?', 'Yes, I can guess the characters.', 'As easy as pie! One more time?', 'One more time?']
  const loseText = ['One more time? This time I will guess', 'I could not get. One more time?', 'I want to take revenge']
  if (isWin){
    res.setPronounceText(getRandomFromArray(winText))
  } else {
    res.setPronounceText(getRandomFromArray(loseText))
  }
}