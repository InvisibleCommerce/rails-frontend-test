import {Controller} from "@hotwired/stimulus"

const debounce = (func, wait, immediate) => {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export default class extends Controller {
  static targets = ["visibilityButton", "reasonListItem"]

  connect() {
    // Debounce the updateOrder function to prevent overloading the server with requests
    this.updateOrder = debounce(this.updateOrder.bind(this), 500);
  }

  grabHandle(event) {
    event.currentTarget.classList.add('cursor-grabbing');
  }

  startDrag(event) {
    event.currentTarget.classList.add('opacity-75');
    event.dataTransfer.setData("text", event.currentTarget.dataset.reasonId);
    event.dataTransfer.effectAllowed = 'move';
  }


  dragOver(event) {
    event.preventDefault();

    event.dataTransfer.dropEffect = 'move';

    if (event.target.hasAttribute("data-reason-target")) {
      event.target.classList.add('bg-gray-400');
    }
  }

  dragLeave(event) {
    if (event.target.hasAttribute("data-reason-target")) {
      event.target.classList.remove('bg-gray-400');
    }
  }

  drop(event) {
    event.preventDefault();
    event.target.classList.remove('bg-gray-400');

    const draggedReasonId = event.dataTransfer.getData("text");
    const draggedElement = document.querySelector(`[data-reason-id="${draggedReasonId}"]`);

    if (draggedElement) {
      draggedElement.classList.remove('opacity-75');
      const dropTarget = event.target.closest('[data-reason-target="reasonListItem"]');

      if (dropTarget && dropTarget !== draggedElement) {
        this.element.insertBefore(draggedElement, dropTarget);
        this.updateOrder();
      }
    }
  }

  updateOrder() {
    this.reasonListItemTargets.forEach((item, index) => {
      const reasonId = item.dataset.reasonId;
      fetch(`/reasons/update_order/${reasonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify({new_order: index})
      });
    });
  }

  updateVisibility(event) {
    const buttonElement = event.currentTarget;
    const reasonId = buttonElement.dataset.reasonButtonId;
    const nextSibling = buttonElement.nextElementSibling;

    fetch(`/reasons/update_visibility/${reasonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
      },
      body: JSON.stringify({id: reasonId})
    })
      .then(response => response.json())
      .then(data => {
        if (data.updated) {
          const childDivs = buttonElement.querySelectorAll("div");
          childDivs.forEach(div => {
            div.classList.toggle("hidden");
          });

          if (data.active) {
            nextSibling.classList.add("text-zinc-800");
            nextSibling.classList.remove("text-zinc-500");
          } else {
            nextSibling.classList.add("text-zinc-500");
            nextSibling.classList.remove("text-zinc-800");
          }
        }
      });
  }
}
