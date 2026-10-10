import { useCallback, useEffect, useRef, useState } from 'react'

export interface Take {
  blob: Blob
  type: string
  ms: number
}

const TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']

/**
 * Records from the microphone, one answer at a time. The microphone stays
 * open between answers, so the browser asks only once, and closes when the
 * interview does. A level meter shows the voice is being picked up.
 */
export function useRecorder(onPart?: (blob: Blob, n: number) => void) {
  // Each second of audio is handed on as it arrives, so it can be saved before the answer ends.
  const partHandler = useRef(onPart)
  partHandler.current = onPart
  const stream = useRef<MediaStream | null>(null)
  const audio = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const startedAt = useRef(0)
  const [state, setState] = useState<'idle' | 'starting' | 'recording'>('idle')
  const [error, setError] = useState('')
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const release = useCallback(() => {
    recorder.current?.state === 'recording' && recorder.current.stop()
    recorder.current = null
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    void audio.current?.ctx.close().catch(() => {})
    audio.current = null
  }, [])
  useEffect(() => release, [release])

  const start = useCallback(async () => {
    setError('')
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('This browser can’t record audio. Try a recent version of Safari, Chrome, Edge, or Firefox.')
      return false
    }
    setState('starting')
    try {
      if (!stream.current?.active) {
        stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        try {
          const ctx = new AudioContext()
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 1024
          ctx.createMediaStreamSource(stream.current).connect(analyser)
          audio.current = { ctx, analyser }
        } catch {
          // The level meter is a nicety; recording works without it.
        }
      }
      const type = TYPES.find((t) => MediaRecorder.isTypeSupported(t))
      const r = new MediaRecorder(stream.current, type ? { mimeType: type } : undefined)
      chunks.current = []
      let n = 0
      r.ondataavailable = (e) => {
        if (!e.data.size) return
        chunks.current.push(e.data)
        partHandler.current?.(e.data, n++)
      }
      r.start(1000)
      recorder.current = r
      startedAt.current = Date.now()
      setElapsed(0)
      setState('recording')
      return r.mimeType || type || 'audio/webm'
    } catch (e) {
      const name = (e as { name?: string }).name
      setError(name === 'NotAllowedError' ? 'The microphone is blocked for this page. Allow it in the browser’s site settings, then try again.' : name === 'NotFoundError' ? 'No microphone was found on this device.' : 'Recording couldn’t start. Check that no other app is using the microphone.')
      setState('idle')
      return false
    }
  }, [])

  const stop = useCallback(
    () =>
      new Promise<Take | null>((resolve) => {
        const r = recorder.current
        if (!r || r.state === 'inactive') return resolve(null)
        r.onstop = () => {
          const type = r.mimeType || chunks.current[0]?.type || 'audio/webm'
          resolve({ blob: new Blob(chunks.current, { type }), type, ms: Date.now() - startedAt.current })
          recorder.current = null
          setState('idle')
          setLevel(0)
        }
        r.stop()
      }),
    [],
  )

  // Leaving the page (switching apps, locking the phone) hands over the last part second, in case the page doesn't come back.
  useEffect(() => {
    if (state !== 'recording') return
    const flush = () => {
      if (document.visibilityState === 'hidden' && recorder.current?.state === 'recording') recorder.current.requestData()
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [state])

  useEffect(() => {
    if (state !== 'recording') return
    const data = new Float32Array(1024)
    const id = setInterval(() => {
      setElapsed(Date.now() - startedAt.current)
      const a = audio.current
      if (!a) return
      a.analyser.getFloatTimeDomainData(data)
      let sum = 0
      for (const v of data) sum += v * v
      setLevel(Math.min(1, Math.sqrt(sum / data.length) * 5))
    }, 100)
    return () => clearInterval(id)
  }, [state])

  return { state, error, level, elapsed, start, stop, release }
}

/** Keeps the screen on while recording, where the browser allows it. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let closed = false
    const request = async () => {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return
      try {
        lock = await navigator.wakeLock.request('screen')
        if (closed) void lock.release()
      } catch {
        // Refused: recording still works.
      }
    }
    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      closed = true
      document.removeEventListener('visibilitychange', request)
      void lock?.release()
    }
  }, [active])
}
