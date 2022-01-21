class SelectionBox {
  // this element will be the div box
  element;
  orgX;
  orgY;
  x1;
  x2;
  y1;
  y2;
  isVisible;
  selections;

  constructor(element) {
    this.element = element;
    this.orgX = 0;
    this.orgY = 0;
    this.x1 = 0;
    this.x2 = 0;
    this.y1 = 0;
    this.y2 = 0;
    this.isVisible = false;
    this.selections = null;
  }

  // pass in users mouse coridnates and update size of selection box
  updatetDimensions(x, y) {
    this.x1 = Math.min(this.orgX, x);
    this.y1 = Math.min(this.orgY, y);
    this.x2 = Math.max(this.orgX, x);
    this.y2 = Math.max(this.orgY, y);

    // changing dimensions of selection box
    this.element.style.left = `${this.x1}px`;
    this.element.style.top = `${this.y1}px`;
    this.element.style.width = `${this.x2 - this.x1}px`;
    this.element.style.height = `${this.y2 - this.y1}px`;
  }

  show() {
    this.isVisible = true;
    this.element.style.display = "inline";
    this.element.style.opacity = 1;
  }
  hide() {
    // this.left = 0;
    // this.right = 0;
    // this.top = 0;
    // this.bottom = 0;
    this.isVisible = false;
    this.element.style.display = "none";
    this.element.style.opacity = 0;
  }

  reset() {
    this.element.style.opacity = 0;
    this.isVisible = false;
    this.orgX = 0;
    this.orgY = 0;
    this.x1 = 0;
    this.x2 = 0;
    this.y1 = 0;
    this.y2 = 0;
    this.element.style.left = "0px";
    this.element.style.top = "0px";
    this.element.style.width = "0px";
    this.element.style.height = "0px";
    this.element.style.display = "none";
  }

  /**
   * Method used when after mouse is released looks if any cars are in the selection box area and makes them selected items
   */
  select(elements) {
    let selectedElements = [];
    let firstParent = null;
    // add in validation to only do 1 track at a time
    function isOverLapping(box1, box2) {
      return !(box2.x1 > box1.right || box2.x2 < box1.left || box2.y1 > box1.bottom || box2.y2 < box1.top);
    }

    elements.forEach((element) => {
      let box = element.getBoundingClientRect();
      if (isOverLapping(box, this)) {
        let currentParent = element.parentElement.parentElement;
        firstParent = firstParent === null ? element.parentElement.parentElement : firstParent;

        // updating class
        // this makes it so only 1 track elements can be selected at a time
        if (firstParent == currentParent) {
          element.classList.add("selected");
          element.setAttribute("draggable", "true");
          selectedElements.push(element);
        }
      }
    });
    this.selections = selectedElements;
  }

  unselect(elements) {
    elements.forEach((e) => {
      e.setAttribute("draggable", "false");
      e.classList.remove("selected");
    });
    this.selections = null;
  }

  mouseDown(e) {
    // check to see if there are selections are clicking on draggable element if true dont do anything
    if (this.selections != null && e.target.classList.contains("selected")) {
      // do nothing this will try to move it
    } else {
      if (this.selections != null) {
        this.unselect(this.selections);
      }

      this.orgX = e.clientX;
      this.orgY = e.clientY;
    }
  }

  mouseMove(e, isMouseDown) {
    if (isMouseDown && this.selections == null) {
      this.updatetDimensions(e.clientX, e.clientY);
      if (!this.isVisible) {
        this.show();
      }
    }
  }

  mouseUp(e) {
    if (this.selections == null) {
      this.select(document.querySelectorAll(".car"));
      this.reset();
    }

    this.isMouseDown = false;
  }
}
