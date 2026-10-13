// An example workbook made in the browser, with made-up people (emails at example.org, phone numbers from Ofcom's
// range for drama), so the check can be tried without a real file. It hides data in several of the usual places.

const SS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
const SM = 'application/vnd.openxmlformats-officedocument.spreadsheetml.'

const MEMBERS: [string, string, string, string][] = [
  ['Aoife Brennan', 'aoife.brennan@example.org', '1984-03-12', 'Central'],
  ['Tomasz Nowak', 'tomasz.nowak@example.org', '1979-11-02', 'Northgate'],
  ['Kwame Mensah', 'kwame.mensah@example.org', '1991-06-25', 'Central'],
  ['Lena Fischer', 'lena.fischer@example.org', '1968-01-30', 'Riverside'],
  ['Rahul Iyer', 'rahul.iyer@example.org', '2001-09-14', 'Northgate'],
  ['Mei Tanaka', 'mei.tanaka@example.org', '1995-12-08', 'Riverside'],
  ['Owen Price', 'owen.price@example.org', '1957-04-19', 'Central'],
  ['Sara Lindqvist', 'sara.lindqvist@example.org', '1988-07-03', 'Hillside'],
]
const BRANCHES = ['Central', 'Northgate', 'Riverside', 'Hillside']

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const str = (ref: string, v: string, style = '') => `<c r="${ref}" t="inlineStr"${style}><is><t>${x(v)}</t></is></c>`
const num = (ref: string, v: number, style = '') => `<c r="${ref}"${style}><v>${v}</v></c>`
const head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'

/** The example's parts, by name. */
function parts(): [string, string][] {
  const visits = [1243, 881, 640, 395]
  const sheet1 =
    `${head}<worksheet xmlns="${SS}" xmlns:r="${R}"><sheetData>` +
    `<row r="1">${str('A1', 'Library visits, April to June 2026 (FOI 2026-0412)')}</row>` +
    `<row r="3">${str('A3', 'Branch')}${str('B3', 'Visits')}</row>` +
    BRANCHES.map((b, i) => `<row r="${4 + i}">${str(`A${4 + i}`, b)}${num(`B${4 + i}`, visits[i])}${i === 0 ? num(`D${4 + i}`, 40417, ' s="1"') : ''}</row>`).join('') +
    MEMBERS.slice(0, 3)
      .map((m, i) => `<row r="${10 + i}" hidden="1">${str(`A${10 + i}`, m[0])}${str(`B${10 + i}`, m[1])}</row>`)
      .join('') +
    `<row r="300">${str('A300', 'Spoke to Owen Price about his complaint: 01632 960123')}</row>` +
    `</sheetData><legacyDrawing r:id="rId2"/></worksheet>`
  const sheet2 =
    `${head}<worksheet xmlns="${SS}"><sheetData>` +
    `<row r="1">${['Name', 'Email', 'Date of birth', 'Branch'].map((h, i) => str(`${'ABCD'[i]}1`, h)).join('')}</row>` +
    MEMBERS.map((m, i) => `<row r="${i + 2}">${m.map((v, j) => str(`${'ABCD'[j]}${i + 2}`, v)).join('')}</row>`).join('') +
    `</sheetData></worksheet>`
  const cacheDef =
    `${head}<pivotCacheDefinition xmlns="${SS}" xmlns:r="${R}" r:id="rId1" refreshedBy="Tomasz Nowak" recordCount="${MEMBERS.length}">` +
    `<cacheSource type="worksheet"><worksheetSource ref="A1:D${MEMBERS.length + 1}" sheet="Members"/></cacheSource><cacheFields count="4">` +
    ['Name', 'Email', 'Date of birth'].map((f, j) => `<cacheField name="${f}" numFmtId="0"><sharedItems count="${MEMBERS.length}">${MEMBERS.map((m) => `<s v="${x(m[j])}"/>`).join('')}</sharedItems></cacheField>`).join('') +
    `<cacheField name="Branch" numFmtId="0"><sharedItems count="${BRANCHES.length}">${BRANCHES.map((b) => `<s v="${b}"/>`).join('')}</sharedItems></cacheField></cacheFields></pivotCacheDefinition>`
  const records = `${head}<pivotCacheRecords xmlns="${SS}" count="${MEMBERS.length}">${MEMBERS.map((m, i) => `<r><x v="${i}"/><x v="${i}"/><x v="${i}"/><x v="${BRANCHES.indexOf(m[3])}"/></r>`).join('')}</pivotCacheRecords>`
  const pivotTable =
    `${head}<pivotTableDefinition xmlns="${SS}" name="Members by branch" cacheId="1" dataCaption="Values"><location ref="F3:G8" firstHeaderRow="1" firstDataRow="1" firstDataCol="1"/>` +
    `<pivotFields count="4"><pivotField dataField="1" showAll="0"/><pivotField showAll="0"/><pivotField showAll="0"/><pivotField axis="axisRow" showAll="0"><items count="5">${BRANCHES.map((_, i) => `<item x="${i}"/>`).join('')}<item t="default"/></items></pivotField></pivotFields>` +
    `<rowFields count="1"><field x="3"/></rowFields><dataFields count="1"><dataField name="Members" fld="0" subtotal="count"/></dataFields></pivotTableDefinition>`
  const rels = (items: [string, string, string][]) => `${head}<Relationships xmlns="${PKG}">${items.map(([id, type, target]) => `<Relationship Id="${id}" Type="${type.includes('/') ? type : `${R}/${type}`}" Target="${target}"/>`).join('')}</Relationships>`
  return [
    [
      '[Content_Types].xml',
      `${head}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="vml" ContentType="application/vnd.openxmlformats-officedocument.vmlDrawing"/>` +
        [
          ['/xl/workbook.xml', `${SM}sheet.main+xml`],
          ['/xl/worksheets/sheet1.xml', `${SM}worksheet+xml`],
          ['/xl/worksheets/sheet2.xml', `${SM}worksheet+xml`],
          ['/xl/styles.xml', `${SM}styles+xml`],
          ['/xl/comments1.xml', `${SM}comments+xml`],
          ['/xl/pivotCache/pivotCacheDefinition1.xml', `${SM}pivotCacheDefinition+xml`],
          ['/xl/pivotCache/pivotCacheRecords1.xml', `${SM}pivotCacheRecords+xml`],
          ['/xl/pivotTables/pivotTable1.xml', `${SM}pivotTable+xml`],
          ['/docProps/core.xml', 'application/vnd.openxmlformats-package.core-properties+xml'],
        ]
          .map(([n, t]) => `<Override PartName="${n}" ContentType="${t}"/>`)
          .join('') +
        '</Types>',
    ],
    ['_rels/.rels', rels([['rId1', 'officeDocument', 'xl/workbook.xml'], ['rId2', 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties', 'docProps/core.xml']])],
    [
      'docProps/core.xml',
      `${head}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Tomasz Nowak</dc:creator><cp:lastModifiedBy>Aoife Brennan</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-07-01T09:12:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-07-04T16:40:00Z</dcterms:modified></cp:coreProperties>`,
    ],
    [
      'xl/workbook.xml',
      `${head}<workbook xmlns="${SS}" xmlns:r="${R}"><sheets><sheet name="Visits" sheetId="1" r:id="rId1"/><sheet name="Members" sheetId="2" state="hidden" r:id="rId2"/></sheets><pivotCaches><pivotCache cacheId="1" r:id="rId3"/></pivotCaches></workbook>`,
    ],
    ['xl/_rels/workbook.xml.rels', rels([['rId1', 'worksheet', 'worksheets/sheet1.xml'], ['rId2', 'worksheet', 'worksheets/sheet2.xml'], ['rId3', 'pivotCacheDefinition', 'pivotCache/pivotCacheDefinition1.xml'], ['rId4', 'styles', 'styles.xml']])],
    [
      'xl/styles.xml',
      `${head}<styleSheet xmlns="${SS}"><numFmts count="1"><numFmt numFmtId="164" formatCode=";;;"/></numFmts><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    ],
    ['xl/worksheets/sheet1.xml', sheet1],
    ['xl/worksheets/_rels/sheet1.xml.rels', rels([['rId1', 'pivotTable', '../pivotTables/pivotTable1.xml'], ['rId2', 'vmlDrawing', '../drawings/vmlDrawing1.vml'], ['rId3', 'comments', '../comments1.xml']])],
    ['xl/worksheets/sheet2.xml', sheet2],
    ['xl/comments1.xml', `${head}<comments xmlns="${SS}"><authors><author>Tomasz Nowak</author></authors><commentList><comment ref="B4" authorId="0"><text><r><t>Numbers from the March report: check with Kwame before release</t></r></text></comment></commentList></comments>`],
    ['xl/drawings/vmlDrawing1.vml', '<xml xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"></xml>'],
    ['xl/pivotCache/pivotCacheDefinition1.xml', cacheDef],
    ['xl/pivotCache/_rels/pivotCacheDefinition1.xml.rels', rels([['rId1', 'pivotCacheRecords', 'pivotCacheRecords1.xml']])],
    ['xl/pivotCache/pivotCacheRecords1.xml', records],
    ['xl/pivotTables/pivotTable1.xml', pivotTable],
    ['xl/pivotTables/_rels/pivotTable1.xml.rels', rels([['rId1', 'pivotCacheDefinition', '../pivotCache/pivotCacheDefinition1.xml']])],
  ]
}

/** The example as an .xlsx file: a zip with its parts stored, not compressed. */
export function exampleWorkbook(): File {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const [name, text] of parts()) {
    const data = encoder.encode(text)
    const nameBytes = encoder.encode(name)
    const crc = crc32(data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, data.length, true)
    local.setUint32(22, data.length, true)
    local.setUint16(26, nameBytes.length, true)
    locals.push(new Uint8Array(local.buffer), nameBytes, data)
    const central = new DataView(new ArrayBuffer(46))
    central.setUint32(0, 0x02014b50, true)
    central.setUint16(4, 20, true)
    central.setUint16(6, 20, true)
    central.setUint32(16, crc, true)
    central.setUint32(20, data.length, true)
    central.setUint32(24, data.length, true)
    central.setUint16(28, nameBytes.length, true)
    central.setUint32(42, offset, true)
    centrals.push(new Uint8Array(central.buffer), nameBytes)
    offset += 30 + nameBytes.length + data.length
  }
  const size = centrals.reduce((n, c) => n + c.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, centrals.length / 2, true)
  end.setUint16(10, centrals.length / 2, true)
  end.setUint32(12, size, true)
  end.setUint32(16, offset, true)
  return new File([...locals, ...centrals, new Uint8Array(end.buffer)] as BlobPart[], 'Example - library visits.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

let table: Uint32Array | null = null

function crc32(b: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < b.length; i++) c = table[(c ^ b[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
