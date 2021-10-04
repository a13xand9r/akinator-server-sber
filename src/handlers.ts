import { SaluteHandler } from '@salutejs/scenario'
import { region } from './aki-api';
import Akinator from './aki-api/Akinator';
import { checkWin, nextStep, runAkinator } from './akinator'
import { AnswerType } from './types';
import { fixSpellingMistakes, getRandomFromArray } from './utils/utils';

export const runAppHandler: SaluteHandler = ({ req, res }) => {
  if (req.request.payload.character.appeal === 'official') {
    res.setPronounceText('<speak>Здравствуйте! Здесь я буду в роли Джина Акина\'тора. Я могу угадать любого персонажа, которого вы загадали и помогу в изучении английского. Давайте играть и учить английский вместе.</speak>', { ssml: true })
    res.appendBubble('Здравствуйте! Здесь я буду в роли Джина Акинатора. Я могу угадать любого персонажа, которого вы загадали и помогу в изучении английского. Давайте играть и учить английский вместе.')
  } else {
    res.setPronounceText('<speak>Привет! Здесь я буду в роли Джина Акина\'тора. Я могу угадать любого персонажа, которого ты загадал и помогу в изучении английского. Давай играть и учить английский вместе.</speak>', { ssml: true })
    res.appendBubble('Привет! Здесь я буду в роли Джина Акинатора. Я могу угадать любого персонажа, которого ты загадал и помогу в изучении английского. Давай играть и учить английский вместе.')
  }
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

  const question = fixSpellingMistakes(aki.question as string)//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)

  res.setASRHints({
    model: 'media',
    enable_letters: true,
    words: ['no', 'yes', 'probably', 'probably not', 'dont know', 'don\'t know', 'do not know', 'back']
  })
  res.setAutoListening(true)
  res.appendCommand({
    type: 'NEW_QUESTION',
    question,
    answers: aki.answers,
    currentStep: aki.currentStep
  })
  res.appendCommand({
    type: 'START_GAME',
  })
  res.setPronounceText(`Let's start! First question: ${question}`)
}

export const userAnswerHandler: SaluteHandler = async ({ req, res, session }) => {
  let answer: AnswerType =2
  if (req.serverAction?.payload){
    //@ts-ignore
    answer = req.serverAction?.payload?.answer as AnswerType
  }
  console.log('variables',req.variables)
  const value = Number(req.variables?.value) as AnswerType
  const aki = session.aki as Akinator

  console.log('stepHandler')
  await nextStep(aki, value ?? answer)
  const isWin = await checkWin(aki, session.wrongPersonId as string | undefined)

  if (!isWin) {
    const question = fixSpellingMistakes(aki.question as string)//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)
    res.setAutoListening(true)
    res.appendCommand({
      type: 'NEW_QUESTION',
      question,
      answers: aki.answers,
      progress: aki.progress,
      currentStep: aki.currentStep
    })
    res.setPronounceText(`${question}`)
    res.setASRHints({
      model: 'media',
      enable_letters: true,
      words: ['no', 'yes', 'probably', 'probably not', 'dont know', 'don\'t know', 'do not know', 'back']
    })
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

  const question = fixSpellingMistakes(aki.question as string)//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)
  res.setASRHints({
    model: 'media',
    enable_letters: true,
    words: ['no', 'yes', 'probably', 'probably not', 'dont know', 'don\'t know', 'do not know', 'back']
  })
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

  const question = fixSpellingMistakes(aki.question as string)//await translateFromEnToRu(aki.question as string, req.request.payload.character.appeal)
  res.setASRHints({
    model: 'media',
    enable_letters: true,
    words: ['no', 'yes', 'probably', 'probably not', 'dont know', 'don\'t know', 'do not know', 'back']
  })
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