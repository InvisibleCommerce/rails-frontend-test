import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    'overlay',
    'modal'
  ]

  show(e) {
    e.preventDefault();

    this.modalTarget.open = true
    this.overlayTarget.hidden = false

    this.modalTarget.querySelectorAll('x-transition').forEach((transition) => {
      transition.open = true
    })
  }

  hide(e) {
    e.preventDefault()

    this.modalTarget.querySelectorAll('x-transition').forEach((transition) => {
      transition.open = false
    })

    this.modalTarget.open = false
    this.overlayTarget.hidden = true

    this.dispatch('closed')
  }
}
