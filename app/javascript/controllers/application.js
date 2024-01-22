import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Import and register tsc modal
import { Modal } from "tailwindcss-stimulus-components"
application.register('modal', Modal)

// Configure Stimulus development experience
application.debug = true
window.Stimulus   = application

export { application }
