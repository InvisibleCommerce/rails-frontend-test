import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static draggingElement
  static targets = [
    'list',
    'item'
  ]

  /* When ready, make all list items draggable */
  connect() {
    this.itemTargets.forEach(element => element.draggable = true)
  }

  /* Triggers when a list item is starting to be dragged  */
  dragstart(e) {
    this.draggingElement = e.target
    this.draggingElement.classList.add("opacity-20")
    e.dataTransfer.effectAllowed = "move";
  }

  /* Triggers when a list item is dragged *over* another element */
  dragover(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move";

    const target = e.target

    if(target && target !== this.draggingElement && target.nodeName == 'LI' ){
      const targetIndex   = this.itemTargets.indexOf(target)
      const draggingIndex = this.itemTargets.indexOf(this.draggingElement)

      if( targetIndex > draggingIndex ){
        this.listTarget.insertBefore(this.draggingElement, target.nextSibling)
      }else{
        this.listTarget.insertBefore(this.draggingElement, target)
      }
    }
  }

  dragend(e) {
    e.target.classList.remove("opacity-20")

    this.itemTargets.forEach((element, index) => {
      element.querySelector('.storefront_reasons_ordering input').value = index
    })
  }
}
