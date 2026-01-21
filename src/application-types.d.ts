
declare module ApplicationTypes {
  
  interface World {
    name: string,
    levels: string[]
  }

  /**
   * Definição do arquivo 'campaign.json'
   */
  interface CampaignJson {
    worlds: World[]
  }
}
