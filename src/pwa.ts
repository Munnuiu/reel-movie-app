export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

declare global {
  interface WindowEventMap {
    "reel:install-ready": CustomEvent<BeforeInstallPromptEvent>
    "reel:update-ready": CustomEvent<ServiceWorkerRegistration>
  }
}

export function registerPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent("reel:install-ready", { detail: event as BeforeInstallPromptEvent }))
  })

  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return

  let refreshing = false
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      const checkForUpdate = () => {
        void registration.update()
      }

      window.addEventListener("online", checkForUpdate)
      window.addEventListener("focus", checkForUpdate)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate()
      })

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing
        if (!worker) return

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent("reel:update-ready", { detail: registration }))
          }
        })
      })

      if (registration.waiting && navigator.serviceWorker.controller) {
        window.dispatchEvent(new CustomEvent("reel:update-ready", { detail: registration }))
      }
    })
  })
}
