import { Character } from '@salutejs/scenario'
import translate from '@vitalets/google-translate-api'
// import translate from 'google-translate-api'
//@ts-ignore
// import translatte from 'translatte'

export function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(arr.length * Math.random())]
}

export async function translateFromEnToRu(text: string, appeal: Character["appeal"]) {
  console.log('text', text)
  let translatedText = checkCustomTranslate(text)
  if (!translatedText){
    try {
      const translated = await translate(text, { from: 'en', to: 'ru' } )
      translatedText = translated.text
      console.log('translatedText', translatedText)
    } catch (e) {
      console.log('translate Error', e)
      return 'Произошла ошибка'
    }
  }
  return changeAppealText(translatedText, appeal)
}

const customTranslateObj = {
  'Is your character real?': 'Ваш персонаж реальный?',
  'Is your character a real person?': 'Является ли ваш персонаж реальным человеком?',
  'Does your character have special powers?': 'Есть ли у вашего персонажа особые способности?',
  'Does the name of your character appear in the title of a movie?': 'Имя вашего персонажа фигурирует в названии фильма?',
}

function checkCustomTranslate(text: string): string{
  const question = Object.keys(customTranslateObj).find(item => item === text)
  //@ts-ignore
  if (question) return customTranslateObj[question]
  return ''
}

const youObjNoOfficial = {
  'Ваш': 'Твой',
  'Вашего': 'Твоего',
  'Вас': 'Тебя',
}
const youObjOfficial = {
  'Твой': 'Ваш',
  'Твоего': 'Вашего',
  'Тебя': 'Вас',
}

function changeAppealText(text: string, appeal: Character["appeal"]): string{
  let keys: string[]
  let newText: string = text
  if (appeal === 'official') {
    keys = Object.keys(youObjOfficial)
    keys.forEach((key) => {
      if (text.toLowerCase().includes(key.toLowerCase())) {
        //@ts-ignore
        newText = text.replace(key, youObjOfficial[key])
        //@ts-ignore
        newText = newText.replace(key.toLowerCase(), youObjOfficial[key].toLowerCase())
      }
    })
  } else {
    keys = Object.keys(youObjNoOfficial)
    keys.forEach((key) => {
      if (text.toLowerCase().includes(key.toLowerCase())) {
        //@ts-ignore
        newText = text.replace(key, youObjNoOfficial[key])
        //@ts-ignore
        newText = newText.replace(key.toLowerCase(), youObjNoOfficial[key].toLowerCase())
      }
    })
  }
  return newText
}

const spellingMistakes = {
  'chararter': 'character'
}

export const fixSpellingMistakes = (text: string) => {
  let newText: string = text
  const keys = Object.keys(spellingMistakes)
  keys.forEach((key) => {
    if (text.toLowerCase().includes(key.toLowerCase())) {
      //@ts-ignore
      newText = text.replace(key, spellingMistakes[key])
      //@ts-ignore
      newText = newText.replace(key.toLowerCase(), spellingMistakes[key].toLowerCase())
    }
  })
  return newText
}

/*спорные переводы:
Is your character real? -
Is your character a real person? - Ваш персонаж настоящий человек?
Does your character have special powers? - Есть ли у вашего персонажа специальные силы?
*/