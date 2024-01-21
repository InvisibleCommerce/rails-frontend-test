import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="reason"
export default class extends Controller {
  static targets = ["visibilityButton", "reasonListItem"]

  updateVisibility(event) {
    const buttonElement = event.currentTarget;
    const reasonId = buttonElement.dataset.reasonId;
    const nextSibling = buttonElement.nextElementSibling;

    fetch(`/reasons/update_visibility/${reasonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
      },
      body: JSON.stringify({ id: reasonId })
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
