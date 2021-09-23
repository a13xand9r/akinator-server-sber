import translate from '@vitalets/google-translate-api'

export function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(arr.length * Math.random())]
}

export async function translateFromEnToRu(text: string) {
  try {
    const translatedText = await translate(text, { from: 'en', to: 'ru' })
    console.log('text', text)
    console.log('translatedText', translatedText)
    return translatedText.text
  } catch (e) {
    console.log('translate Error', e)
    return 'Произошла ошибка'
  }
}
