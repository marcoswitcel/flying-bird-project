
declare module ApplicationTypes {
  
  interface World {
    name: string,
    levels: string[]
  }

  interface CampaignJson {
    worlds: World[]
  }
}
