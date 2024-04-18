interface AssociativeArray {
  [key: string]: Message
}

export type Message = {
  title: () => string
  text: (num: any) => string
  success: () => string
}

const messages: AssociativeArray = {
  uklidPokoje: {
    title: () => 'Úklid pokoje',
    text: (num: any) => `Právě se nacházíte v pokoji ${num}. Přejete si uklidit?`,
    success: () => 'Vaše přání jsme zaznamenali a Váš pokoj uklidíme ještě během tohoto dne.'
  }
}

export default messages
