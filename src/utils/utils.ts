import translate from '@vitalets/google-translate-api'
// import translate from 'google-translate-api'
//@ts-ignore
import translatte from 'translatte'

export function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(arr.length * Math.random())]
}



export async function translateFromEnToRu(text: string) {
  console.log('text', text)

  try {
    const translatedText = await translate(text, { from: 'en', to: 'ru' } )
    console.log('translatedText', translatedText)
    return translatedText.text
  } catch (e) {
    console.log('translate Error', e)
    return 'Произошла ошибка'
  }
}


/*спорные переводы:
Is your character real? - 
Is your character a real person? - Ваш персонаж настоящий человек?
Does your character have special powers? - Есть ли у вашего персонажа специальные силы?
*/