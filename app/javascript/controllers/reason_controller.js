import { Controller } from "@hotwired/stimulus"

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
    event.currentTarget.classList.add('border-2','border-dashed');
    event.currentTarget.classList.remove('border-b')
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
      draggedElement.classList.remove('border-2','border-dashed');
      draggedElement.classList.add('border-b')
      const dropTarget = event.target.closest('[data-reason-target="reasonListItem"]');

      if (dropTarget && dropTarget !== draggedElement) {
        this.element.insertBefore(draggedElement, dropTarget);
        this.updateOrder();
      }
    }

    event.dataTransfer.clearData();
  }

  updateOrder() {
    let newListOrder = []
    this.reasonListItemTargets.forEach((item, index) => {
      newListOrder.push({[item.dataset.reasonId]: index})
    });

    fetch(`/reasons/update_order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
      },
      body: JSON.stringify({new_order: newListOrder})
    });
  }

  toggleElementVisibility(elements) {
    elements.forEach(e => {
      e.classList.toggle("hidden");
    });
  }

  setModalVisibilityStyle(button, active) {
    const reasonListItem = button.closest('[data-reason-target="reasonListItem"]');
    const activeHeader = button.parentElement.querySelector(".modal-visibility-header-active")
    const inactiveHeader = button.parentElement.querySelector(".modal-visibility-header-inactive")
    const reasonListItemButton = reasonListItem.querySelector('.visibility-toggle')

    this.toggleElementVisibility(reasonListItemButton.querySelectorAll("div"))

    if (active) {
      activeHeader.classList.remove("hidden");
      inactiveHeader.classList.add("hidden");
      reasonListItemButton.nextElementSibling.classList.add("text-zinc-800");
      reasonListItemButton.nextElementSibling.classList.remove("text-zinc-500");
    } else {
      activeHeader.classList.add("hidden");
      inactiveHeader.classList.remove("hidden");
      reasonListItemButton.nextElementSibling.classList.remove("text-zinc-800");
      reasonListItemButton.nextElementSibling.classList.add("text-zinc-500");
    }
  }

  setListItemVisibilityStyle(button, active) {
    const reasonListItem = button.closest('[data-reason-target="reasonListItem"]');
    const activeHeader = reasonListItem.querySelector(".modal-visibility-header-active")
    const inactiveHeader = reasonListItem.querySelector(".modal-visibility-header-inactive")
    const reasonModalButton = reasonListItem.querySelector('.modal-visibility-toggle')

    this.toggleElementVisibility(reasonModalButton.querySelectorAll("div"))

    if (active) {
      activeHeader.classList.remove("hidden");
      inactiveHeader.classList.add("hidden");
      button.nextElementSibling.classList.add("text-zinc-800");
      button.nextElementSibling.classList.remove("text-zinc-500");
    } else {
      activeHeader.classList.add("hidden");
      inactiveHeader.classList.remove("hidden");
      button.nextElementSibling.classList.remove("text-zinc-800");
      button.nextElementSibling.classList.add("text-zinc-500");
    }
  }

  setVisibilityStyling(button, active, isModal) {
    const buttonChildren = button.querySelectorAll("div");

    this.toggleElementVisibility(buttonChildren)

    if (isModal) {
      this.setModalVisibilityStyle(button, active)
    } else {
      this.setListItemVisibilityStyle(button, active)
    }
  }

  updateVisibility(event) {
    const buttonElement = event.currentTarget;
    const reasonId = buttonElement.dataset.reasonButtonId;
    const isModal = buttonElement.dataset.isModal

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
          this.setVisibilityStyling(buttonElement, data.active, isModal)
        }
      });
  }

  deleteReason(event) {
    const deleteButton = event.currentTarget
    const destroyInput = deleteButton.nextElementSibling
    const reasonListItem = deleteButton.closest('[data-reason-target="reasonListItem"]');

    destroyInput.value = 1

    reasonListItem.classList.add('bg-red-200')
  }

  continueEdit(event) {
    const continueButton = event.currentTarget
    const reasonId = continueButton.dataset.reasonId
    const labelInput = document.querySelector(`input[data-reason-id="${reasonId}"]`)
    const reasonListItem = continueButton.closest('[data-reason-target="reasonListItem"]');
    const listItemLabel = reasonListItem.querySelector(".list-item-label")

    if (labelInput.value !== labelInput.defaultValue) {
      reasonListItem.classList.add("bg-sky-200")
      listItemLabel.textContent = labelInput.value
    }
  }
}
