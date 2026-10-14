// A made-up dance studio's recital, for "Try an example": 22 routines and an intermission, set out the way a planner
// might first jot it down (little ones before the interval, seniors after), with one dancer back to back and 27 quick
// changes at three numbers between. The names are invented.

const CLASSES: { name: string; size: number; from: number }[] = [
  { name: 'Ballet 3–4', size: 8, from: 0 },
  { name: 'Tap 3–4', size: 8, from: 0 },
  { name: 'Ballet 5–7', size: 10, from: 8 },
  { name: 'Jazz 5–7', size: 10, from: 8 },
  { name: 'Acro 5–7', size: 7, from: 12 },
  { name: 'Hip Hop 8–11', size: 9, from: 18 },
  { name: 'Jazz 8–11', size: 9, from: 22 },
  { name: 'Lyrical 8–11', size: 8, from: 24 },
  { name: 'Contemporary Teens', size: 8, from: 31 },
  { name: 'Hip Hop Teens', size: 8, from: 33 },
  { name: 'Tap Teens', size: 5, from: 35 },
  { name: 'Ballet Seniors', size: 7, from: 39 },
  { name: 'Lyrical Seniors', size: 6, from: 40 },
]

const FIRST = ['Amara', 'Bea', 'Callie', 'Darcy', 'Elsie', 'Freya', 'Gigi', 'Hattie', 'Isla', 'Juno', 'Kenzie', 'Lyra', 'Maeve', 'Nia', 'Orla', 'Priya', 'Quinn', 'Rosa', 'Saoirse', 'Tilly', 'Uma', 'Vera', 'Willa', 'Ximena', 'Yara', 'Zara', 'Ari', 'Bodhi', 'Cass', 'Dev', 'Eden', 'Finn', 'Gael', 'Hugo', 'Ira', 'Jude', 'Kit', 'Leo', 'Milo', 'Noor', 'Otis', 'Pip', 'Remy', 'Sol', 'Teo', 'Wren']
const LAST = ['Achebe', 'Byrne', 'Castillo', 'Dubois', 'Eriksen', 'Fairweather', 'Gallagher', 'Haddad', 'Ivanova', 'Jansen', 'Kowalski', 'Lindqvist', 'Moreau', 'Nakamura', 'Okafor', 'Petrov', 'Quintero', 'Rossi', 'Sato', 'Tremblay', 'Ueda', 'Vasquez', 'Whitlock']

/** The example as lines to paste: "Routine: dancer, dancer", with an intermission. */
export function exampleText(): string {
  const dancer = (i: number) => `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`
  const cls = (name: string) => {
    const c = CLASSES.find((x) => x.name === name)!
    return Array.from({ length: c.size }, (_, k) => dancer(c.from + k))
  }
  const company = [31, 32, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44].map(dancer)
  const lines = [
    `Opening Company: ${company.join(', ')}`,
    `Hip Hop 8–11: ${cls('Hip Hop 8–11').join(', ')}`,
    `Ballet 5–7: ${cls('Ballet 5–7').join(', ')}`,
    `Tap 3–4: ${cls('Tap 3–4').join(', ')}`,
    `Jazz 8–11: ${cls('Jazz 8–11').join(', ')}`,
    `Tap Teens: ${cls('Tap Teens').join(', ')}`,
    `Acro 5–7: ${cls('Acro 5–7').join(', ')}`,
    `${dancer(39).split(' ')[0]} Solo: ${dancer(39)}`,
    `Ballet 3–4: ${cls('Ballet 3–4').join(', ')}`,
    `Contemporary Teens: ${cls('Contemporary Teens').join(', ')}`,
    `Jazz 5–7: ${cls('Jazz 5–7').join(', ')}`,
    'Intermission',
    `Ballet Seniors: ${cls('Ballet Seniors').join(', ')}`,
    `Lyrical 8–11: ${cls('Lyrical 8–11').join(', ')}`,
    `Lyrical Seniors: ${cls('Lyrical Seniors').join(', ')}`,
    `${dancer(41).split(' ')[0]} Solo: ${dancer(41)}`,
    `Hip Hop Teens: ${cls('Hip Hop Teens').join(', ')}`,
    `Senior Trio: ${[dancer(42), dancer(43), dancer(44)].join(', ')}`,
    `${dancer(33).split(' ')[0]} & ${dancer(35).split(' ')[0]} Duet: ${dancer(33)}, ${dancer(35)}`,
    `Contemporary Seniors: ${[39, 40, 41, 42, 43].map(dancer).join(', ')}`,
    `${dancer(24).split(' ')[0]} Solo: ${dancer(24)}`,
    `Acro Showcase: ${[...cls('Acro 5–7').slice(0, 4), dancer(25), dancer(27)].join(', ')}`,
    `Finale Company: ${company.join(', ')}`,
  ]
  return lines.join('\n')
}
