import { Aki, region } from 'aki-api'
import Akinator from 'aki-api/typings/src/Akinator';
import { AnswerType } from './types';

export const runAkinator = async (region: region) => {
  const childMode = false
  const aki = new Aki({ region, childMode });
  try {
    await aki.start();
    console.log(aki.frontaddr, aki.uid)
  } catch (error) {
    console.log('startAkinatorError', error)
  }
  return aki
}

export const nextStep = async (aki: Akinator, answer: AnswerType) => {
  try {
    await aki.step(answer)
  } catch (error) {
    console.log('nextStepError', error)
  }
}

export const checkWin = async (aki: Akinator, wrongPersonId: string | undefined) => {
  console.log('currentStep', aki.currentStep)
  console.log('progress', aki.progress)
  console.log('guessCount', aki.guessCount)
  console.log('\n')
  if (aki.progress > 85 || aki.currentStep >= 50){
    await aki.win()
    console.log('win')
    //@ts-ignore
    if (aki.answers[0].id === wrongPersonId){
      return false
    }
    return true
  }
  return false
}

// runAkinator().catch(console.error);