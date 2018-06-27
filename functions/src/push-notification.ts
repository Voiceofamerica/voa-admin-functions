// Keep this file in sync with the server version, update the version below
// version: 1

export interface IMobileApp {
  appId: string
  name: string
  disabled: boolean
  language?: string
}

export interface IPushNotification {
  title: string
  message: string
  label: string
  deliveryDate?: number
  receipientTimeZone: boolean
  articleId?: number
  target: { id: number; mobileApp: IMobileApp }[]
}
