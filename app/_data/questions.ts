import type { QuizQuestion } from '@/app/_types';

export const questions: QuizQuestion[] = [
  {
    id: 1,
    text: 'Hvordan foretrekker du å starte en ny uke?',
    options: [
      {
        text: 'Hoppe rett inn i nye prosjekter uten en tydelig plan, klar for hva enn som dukker opp.',
        type: 'red'
      },
      {
        text: 'Få med kollegene på en felles kick-off, fylle rommet med latter og entusiasme.',
        type: 'yellow'
      },
      {
        text: 'Sette deg ned med en god venn og dele ideer rolig, over en kopp te.',
        type: 'green'
      },
      {
        text: 'Lage en detaljert liste over oppgaver og prioritere dem i riktig rekkefølge.',
        type: 'blue'
      }
    ]
  },
  {
    id: 2,
    text: 'Hvordan forholder du deg til uventede utfordringer?',
    options: [
      {
        text: 'Kaster deg ut i det, improviserer og utnytter momentum.',
        type: 'red'
      },
      {
        text: 'Samler teamet for et "pep talk"-møte og løser problemet sammen.',
        type: 'yellow'
      },
      {
        text: 'Prøver å megle og skape ro, finner en harmonisk løsning.',
        type: 'green'
      },
      {
        text: 'Setter av tid til å analysere situasjonen og lage en handlingsplan.',
        type: 'blue'
      }
    ]
  },
  {
    id: 3,
    text: 'En venn inviterer deg med på en aktivitet du aldri har prøvd før. Hva gjør du?',
    options: [
      {
        text: 'Hopper på med en gang, uansett hva det er – elsker noe nytt!',
        type: 'red'
      },
      {
        text: 'Spør om dere kan ta med flere venner, gjøre det til en sosial begivenhet.',
        type: 'yellow'
      },
      {
        text: 'Forsikrer deg om at det blir i rolige og hyggelige omgivelser.',
        type: 'green'
      },
      {
        text: 'Les litt om aktiviteten på forhånd, forbereder deg mentalt.',
        type: 'blue'
      }
    ]
  },
  {
    id: 4,
    text: 'Når du skal velge feriedestinasjon:',
    options: [
      {
        text: 'Et ukjent sted, ingen planer – bare frihet og eventyr.',
        type: 'red'
      },
      {
        text: 'Et sted med livlige festivaler og mye sosial interaksjon.',
        type: 'yellow'
      },
      {
        text: 'Et fredelig hytteretreat i naturen, nær en stille innsjø.',
        type: 'green'
      },
      {
        text: 'Et sted med klare reiseruter og kjent kultur – minimal usikkerhet.',
        type: 'blue'
      }
    ]
  },
  {
    id: 5,
    text: 'Hva motiverer deg i hverdagen?',
    options: [
      {
        text: 'Spenningen ved å prøve ut noe ingen andre har turt ennå.',
        type: 'red'
      },
      {
        text: 'Gleden ved å se at folk rundt deg smiler og har det bra.',
        type: 'yellow'
      },
      {
        text: 'Følelsen av balanse, indre ro og gode, nære relasjoner.',
        type: 'green'
      },
      {
        text: 'Å krysse av oppgaver på en liste og vite at alt går etter planen.',
        type: 'blue'
      }
    ]
  },
  {
    id: 6,
    text: 'Hvordan håndterer du konflikter i en gruppe?',
    options: [
      {
        text: 'Kaster inn en vill idé eller aktivitet for å bryte spenningen.',
        type: 'red'
      },
      {
        text: 'Får alle sammen for å snakke det ut, skape en felles forståelse.',
        type: 'yellow'
      },
      {
        text: 'Lytter nøye, foreslår kompromiss og påpeker felles mål.',
        type: 'green'
      },
      {
        text: 'Samler fakta, analyserer problemet og foreslår en logisk løsning.',
        type: 'blue'
      }
    ]
  },
  {
    id: 7,
    text: 'Når du skal lære noe nytt:',
    options: [
      {
        text: 'Lærer best gjennom eksperimentering i praksis, gjerne uten bruksanvisning.',
        type: 'red'
      },
      {
        text: 'Lærer gjennom å diskutere og utforske temaet sammen med andre.',
        type: 'yellow'
      },
      {
        text: 'Lærer i et rolig tempo, gjerne ved å observere og reflektere selv.',
        type: 'green'
      },
      {
        text: 'Lærer best ved å lese strukturert materiale og følge en klar prosess.',
        type: 'blue'
      }
    ]
  },
  {
    id: 8,
    text: 'Din drømmefest:',
    options: [
      {
        text: 'En overraskelsesfest der ingen helt vet hva som skjer neste minutt.',
        type: 'red'
      },
      {
        text: 'Et stort selskap med musikk, dans og mange gode samtaler.',
        type: 'yellow'
      },
      {
        text: 'En rolig sammenkomst med få, nære venner, lave stemmer og dyp samtale.',
        type: 'green'
      },
      {
        text: 'En nøye planlagt middag med en nøyaktig gjesteliste, meny og program.',
        type: 'blue'
      }
    ]
  },
  {
    id: 9,
    text: 'Hvilke gaver liker du best å gi?',
    options: [
      {
        text: 'Noe helt uventet, kanskje et kunstverk laget i full fart.',
        type: 'red'
      },
      {
        text: 'En opplevelse der flere kan delta og kose seg sammen.',
        type: 'yellow'
      },
      {
        text: 'En gjennomtenkt, personlig gave som viser omtanke og kjennskap.',
        type: 'green'
      },
      {
        text: 'En nyttig, praktisk gave som mottakeren kan bruke effektivt.',
        type: 'blue'
      }
    ]
  },
  {
    id: 10,
    text: 'Når du må ta en viktig avgjørelse:',
    options: [
      {
        text: 'Følger magefølelsen og håper på det beste.',
        type: 'red'
      },
      {
        text: 'Spør venner om deres meninger, og lar fellesskapet lede veien.',
        type: 'yellow'
      },
      {
        text: 'Tenker over hvordan dette vil påvirke harmonien i relasjonene dine.',
        type: 'green'
      },
      {
        text: 'Samler informasjon, veier fordeler og ulemper systematisk.',
        type: 'blue'
      }
    ]
  },
  {
    id: 11,
    text: 'Hva gjør deg mest fornøyd etter en lang dag?',
    options: [
      {
        text: 'Å ha opplevd noe helt nytt, uventet og spennende.',
        type: 'red'
      },
      {
        text: 'Å ha delt gode stunder med mange mennesker.',
        type: 'yellow'
      },
      {
        text: 'Å ha hatt en dyp, meningsfull samtale med noen du bryr deg om.',
        type: 'green'
      },
      {
        text: 'Å ha fullført alle oppgaver nøyaktig som planlagt.',
        type: 'blue'
      }
    ]
  },
  {
    id: 12,
    text: 'Når du ser fremover i livet:',
    options: [
      {
        text: 'Gleder du deg til alt det uvisse og ukjente du kan utforske.',
        type: 'red'
      },
      {
        text: 'Ser du for deg et liv fylt med gode venner og mye glede.',
        type: 'yellow'
      },
      {
        text: 'Håper du på stabilitet, nære relasjoner og indre ro.',
        type: 'green'
      },
      {
        text: 'Forestiller du deg et velorganisert, velstrukturert liv med klare mål.',
        type: 'blue'
      }
    ]
  }
];