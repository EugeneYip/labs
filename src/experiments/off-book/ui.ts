const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
export const area = `${control} w-full py-2 leading-relaxed`
export const select = `${control} h-11 cursor-pointer sm:h-10`
export const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
export const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
export const outline = `${button} border border-rule hover:bg-ink/5`
export const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
/** A toggle button in a group: dark when on. */
export const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`

/** Your own lines are tinted, so they stand out from everyone else's. */
export const MINE = 'bg-amber-100/70 dark:bg-amber-900/30'

// Cues read aloud with the device's speech voices (some browsers' voices work online).

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'

export function speak(text: string) {
  if (!canSpeak() || !text.trim()) return
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  // Scripts are usually in the reader's own language, so use the device's voice for it.
  utterance.lang = navigator.language
  utterance.rate = 1
  speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel()
}
