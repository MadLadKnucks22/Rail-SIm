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
  autopush;
  dragInfo = {
    selectionLength: null,
    selectionTrack: null,

    targetTrack: null,
    targetSpaceStart: null,
    targetSpaceEnd: null,
    validDrop: false,
  };

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
    this.autopush = true;
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

  #hasNextSpace(arry, index) {
    if (index + 1 >= arry.length) {
      return false;
    }

    if (arry[index + 1].hasChildNodes()) {
      return false;
    } else {
      return true;
    }
  }

  #hasPreviousSpace(arry, index) {
    if (index - 1 < 0) {
      return false;
    }

    if (arry[index - 1].hasChildNodes()) {
      return false;
    } else {
      return true;
    }
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

  dragStart(e) {
    //look at how many items are moving and how much space we will need
    e.dataTransfer.setData("text", "");
    this.dragInfo.selectionLength = this.selections.length;
    this.dragInfo.selectionTrack = e.target.parentElement.parentElement.id;
  }

  dragEnter(e) {
    // maybe update track effects or something here if it is a valid drop location
    // or color of selected cars to validate drop target

    // get track
    this.dragInfo.targetTrack = e.target.parentElement.id;

    // get space avalaible
    // looking to the right

    // look at space
    if (this.dragInfo.targetTrack != this.dragInfo.selectionTrack && e.target.classList[0] != "car") {
      let nodes = Array.from(e.srcElement.parentElement.childNodes);
      let index = nodes.indexOf(e.srcElement);
      let rCount = 0;
      let lCount = 0;
      while (this.#hasNextSpace(nodes, index + rCount)) {
        rCount++;
      }
      while (this.#hasPreviousSpace(nodes, index - lCount)) {
        lCount++;
      }

      this.dragInfo.targetSpaceStart = this.autopush
        ? index + rCount + 1 - this.dragInfo.selectionLength
        : index - lCount;
      this.dragInfo.targetSpaceEnd = this.autopush ? index + rCount : index + this.dragInfo.selectionLength;

      if (this.dragInfo.targetSpaceEnd - this.dragInfo.targetSpaceStart + 1 >= this.dragInfo.selectionLength) {
        this.dragInfo.validDrop = true;
      } else {
        this.dragInfo.validDrop = false;
      }

      console.log(this.dragInfo);
    }
  }

  dragOver(e) {
    e.preventDefault();
  }

  dragEnd(e) {
    let counter = 0;
    if (this.dragInfo.validDrop) {
      let spotNodes = document.getElementById(this.dragInfo.targetTrack).childNodes;
      this.selections.forEach((car) => {
        spotNodes[this.dragInfo.targetSpaceStart + counter].appendChild(car);
        counter++;
      });
    }
  }
}
