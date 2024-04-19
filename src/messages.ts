interface AssociativeArray {
  [key: string]: Message
}

export type Message = {
  title: () => string
  text: (num: any) => string
  successTitle: () => string
  successText: () => string
  buttonCTA: () => string
  website: () => string
}

const messages: AssociativeArray = {
  uklidPokoje: {
    title: () => 'Úklid pokoje',
    text: (num: any) => `Právě se nacházíte v pokoji ${num}. Přejete si uklidit?`,
    successTitle: () => 'Mockrát děkujeme',
    successText: () => 'Vaše přání jsme zaznamenali a Váš pokoj uklidíme ještě během tohoto dne.',
    buttonCTA: () => 'Přejít na stránku hotelu',
    website: () => 'https://www.kapkaresort.cz/'
  }
}

export default messages
