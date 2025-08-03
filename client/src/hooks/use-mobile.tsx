import * as React from "react"

const MOBILE_BREAKPOINT = 1024 // Aumentado para incluir tablets
const TOUCH_DEVICE_QUERY = '(hover: none) and (pointer: coarse)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    const screenMql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const touchMql = window.matchMedia(TOUCH_DEVICE_QUERY)
    
    const onChange = () => {
      const screenMatch = window.innerWidth < MOBILE_BREAKPOINT
      const touchMatch = touchMql.matches
      setIsMobile(screenMatch)
      setIsTouchDevice(touchMatch)
    }
    
    screenMql.addEventListener("change", onChange)
    touchMql.addEventListener("change", onChange)
    onChange() // Initial check
    
    return () => {
      screenMql.removeEventListener("change", onChange)
      touchMql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    const touchMql = window.matchMedia(TOUCH_DEVICE_QUERY)
    const onChange = () => setIsTouchDevice(touchMql.matches)
    
    touchMql.addEventListener("change", onChange)
    onChange()
    
    return () => touchMql.removeEventListener("change", onChange)
  }, [])

  return isTouchDevice
}
