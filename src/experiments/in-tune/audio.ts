import { detectPitch, midiToHz } from './model.ts'

/**
 * The microphone and the reference tones. Samples are read straight from the
 * microphone into pitch detection and never stored or sent anywhere.
 */
export class Engine {
  private stream: MediaStream
  private analyser: AnalyserNode
  private samples: Float32Array<ArrayBuffer>
  /** While a reference note plays, the microphone would hear it too, so readings pause. */
  private quietUntil = 0
  readonly ctx: AudioContext

  private constructor(ctx: AudioContext, stream: MediaStream) {
    this.ctx = ctx
    this.stream = stream
    const source = ctx.createMediaStreamSource(stream)
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    source.connect(this.analyser)
    this.samples = new Float32Array(this.analyser.fftSize)
  }

  /** Must run from a tap: browsers allow sound and ask for the microphone only then. */
  static async start(): Promise<Engine> {
    const ctx = new AudioContext()
    void ctx.resume()
    try {
      // Voice processing meant for calls smooths away the very pitch we want to see.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      return new Engine(ctx, stream)
    } catch (error) {
      void ctx.close()
      throw error
    }
  }

  /** A soft, clear tone at the note, and a pause in listening while it sounds. */
  play(midi: number, seconds = 1.3) {
    const now = this.ctx.currentTime
    const hz = midiToHz(midi)
    const out = this.ctx.createGain()
    out.gain.setValueAtTime(0.0001, now)
    out.gain.exponentialRampToValueAtTime(0.35, now + 0.03)
    out.gain.setValueAtTime(0.35, now + seconds - 0.35)
    out.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
    out.connect(this.ctx.destination)
    for (const [type, multiple, level] of [['triangle', 1, 1], ['sine', 2, 0.25]] as const) {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = type
      osc.frequency.value = hz * multiple
      gain.gain.value = level
      osc.connect(gain).connect(out)
      osc.start(now)
      osc.stop(now + seconds + 0.05)
    }
    this.quietUntil = now + seconds + 0.25
  }

  get playing() {
    return this.ctx.currentTime < this.quietUntil
  }

  /** The pitch being sung right now, if any. */
  read(): { hz: number; clarity: number } | null {
    if (this.playing) return null
    this.analyser.getFloatTimeDomainData(this.samples)
    return detectPitch(this.samples, this.ctx.sampleRate)
  }

  private stopped = false

  /** Releases the microphone. Safe to call more than once. */
  stop() {
    if (this.stopped) return
    this.stopped = true
    for (const track of this.stream.getTracks()) track.stop()
    void this.ctx.close().catch(() => {})
  }
}
