// The names inside a compound file, the format of .xls, .doc, .ppt, and .msg files and of Office files protected
// with a password to open. Read from its directory alone, without reading any stream, to tell those apart.

const END = 0xfffffffa

/** The names of the file's directory entries (storages and streams), or null if it isn't a compound file this can
 * follow. */
export async function compoundNames(file: Blob): Promise<string[] | null> {
  const header = new DataView(await file.slice(0, 512).arrayBuffer())
  if (header.byteLength < 512 || header.getUint32(0, true) !== 0xe011cfd0 || header.getUint32(4, true) !== 0xe11ab1a1) return null
  const shift = header.getUint16(30, true)
  if (shift !== 9 && shift !== 12) return null
  const sector = 1 << shift
  const at = (s: number) => (s + 1) * sector
  const read = async (s: number) => new DataView(await file.slice(at(s), at(s) + sector).arrayBuffer())
  const fatCount = header.getUint32(44, true)
  // Where the allocation table's own sectors are: the first 109 in the header, the rest in a chain of sectors.
  const fat: number[] = []
  for (let i = 0; i < 109 && fat.length < fatCount; i++) {
    const s = header.getUint32(76 + i * 4, true)
    if (s >= END) break
    fat.push(s)
  }
  let more = header.getUint32(68, true)
  for (let n = header.getUint32(72, true); n > 0 && more < END && fat.length < fatCount; n--) {
    const d = await read(more)
    if (d.byteLength < sector) return null
    for (let i = 0; i < sector / 4 - 1 && fat.length < fatCount; i++) {
      const s = d.getUint32(i * 4, true)
      if (s < END) fat.push(s)
    }
    more = d.getUint32(sector - 4, true)
  }
  // The directory's chain of sectors, followed through the table, reading only the table sectors it passes.
  const perSector = sector / 4
  const tables = new Map<number, DataView>()
  const next = async (s: number): Promise<number> => {
    const which = Math.floor(s / perSector)
    if (which >= fat.length) return END
    let t = tables.get(which)
    if (!t) {
      t = await read(fat[which])
      tables.set(which, t)
    }
    return t.byteLength < sector ? END : t.getUint32((s % perSector) * 4, true)
  }
  const names: string[] = []
  const seen = new Set<number>()
  for (let s = header.getUint32(48, true); s < END && names.length < 10_000; s = await next(s)) {
    // A chain that comes back on itself would never end.
    if (seen.has(s)) return null
    seen.add(s)
    const d = await read(s)
    if (d.byteLength < sector) break
    for (let e = 0; e + 128 <= sector; e += 128) {
      const type = d.getUint8(e + 66)
      const length = d.getUint16(e + 64, true)
      if (type === 0 || length < 2 || length > 64) continue
      let name = ''
      for (let i = 0; i < length / 2 - 1; i++) name += String.fromCharCode(d.getUint16(e + i * 2, true))
      names.push(name)
    }
  }
  return names
}
