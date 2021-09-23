import { Aki } from 'aki-api'
import Akinator from 'aki-api/typings/src/Akinator';

export const runAkinator = async () => {
    const region = 'ru';
    const childMode = false
    const aki = new Aki({ region, childMode });

    await aki.start();
    return aki
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

runAkinator().catch(console.error);