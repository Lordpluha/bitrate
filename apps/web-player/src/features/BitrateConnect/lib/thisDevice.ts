const THIS_DEVICE_STORAGE_KEY = 'bitrate-connect-device-id'

/** The device id this browser registered with; null when storage is blocked or empty. */
export const readThisDeviceId = () => {
  try {
    return window.localStorage.getItem(THIS_DEVICE_STORAGE_KEY)
  } catch {
    return null
  }
}

export const writeThisDeviceId = (id: string) => {
  try {
    window.localStorage.setItem(THIS_DEVICE_STORAGE_KEY, id)
  } catch {
    /** Without storage the browser registers a new device on each visit. */
  }
}
