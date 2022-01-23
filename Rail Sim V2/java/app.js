// Global variables
var box = new SelectionBox(document.querySelector(".selection-box"));
var config = new ConfigBox(document.querySelector(".config-box"));
var statboxs = [];
/**
 * flag to automatically push all moved cars as far down a track as possible
 */
var autopush = true;
// building the yard div elements

// track variables
var trackLengths = [36, 34, 26, 22, 21, 10, 10];
var yard = {
  track1: { spots: new Array(36).fill(null), length: 36 },
  track2: { spots: new Array(34).fill(null), length: 34 },
  track3: { spots: new Array(26).fill(null), length: 26 },
  track4: { spots: new Array(22).fill(null), length: 22 },
  track5: { spots: new Array(21).fill(null), length: 21 },
  track6: { spots: new Array(10).fill(null), length: 10 },
  track7: { spots: new Array(10).fill(null), length: 10 },
};

// used to clear a track out
function clearTrack(trackID) {
  let spots = document.getElementById(trackID).childNodes;
  spots.forEach((spot) => {
    if (spot.hasChildNodes()) {
      let car = spot.firstChild;
      spot.removeChild(car);
    }
  });
}

// function to take string variable and fill track array with either empty, loaded or bo cars
function initCars(string, track) {
  let reg = /(\d+BO)|(\d+L)|(\d+E)/gi;

  if (reg.test(string)) {
    let matchs = string.match(reg);
    let reg2 = /(\d+)(\w+)/;
    let childIndex = 0;

    // validation to make sure it can fit in the track
    let numreg = /(\d+)/g;
    let numMatch = string.match(numreg);
    let trackLength = document.getElementById(track).childNodes.length;
    let givenNumber = numMatch.map(Number).reduce((a, b) => {
      return a + b;
    }, 0);

    if (givenNumber > trackLength) {
      console.log("to many cars");
      return;
    }

    // clearing track
    clearTrack(track);

    // itterating through groups and building tracks
    // offest index is used to push everycar down the track when there is space;
    let offsetIndex = trackLength - givenNumber;
    matchs.forEach((m) => {
      let className = "";
      let match = m.match(reg2);
      let number = match[1];
      let type = match[2];
      if (type == "L" || type == "l") {
        className = "car loaded";
      } else if (type == "BO" || type == "bo") {
        className = "car bo";
      } else if (type == "E" || type == "e") {
        className = "car empty";
      }

      // creating car div
      for (let i = 0; i < number; i++) {
        let carDiv = document.createElement("div");
        carDiv.className = className;
        carDiv.setAttribute("draggable", "false");
        document.getElementById(track).childNodes[childIndex + offsetIndex].appendChild(carDiv);
        childIndex++;
      }
    });
  }
}

function initTracks() {
  for (let i = 6; i >= 0; i--) {
    // track wrapper
    let trackWrapper = document.createElement("div");
    trackWrapper.className = "track-wrapper";
    trackWrapper.id = "track-wrapper-" + (i + 1);

    // track div
    let trackDiv = document.createElement("div");
    trackDiv.className = "track";
    trackDiv.id = "track-" + (i + 1);

    // track stat box div
    let trackStatBoxDiv = document.createElement("div");
    trackStatBoxDiv.className = "track-stat-box";
    trackStatBoxDiv.id = "track-stat-box-" + (i + 1);

    // track numbers wrapper
    let spotNumbersWrapper = document.createElement("div");
    spotNumbersWrapper.className = "track-numbers-wrapper";

    // track spots
    for (let j = 0; j < trackLengths[i]; j++) {
      let spotDiv = document.createElement("div");
      spotDiv.className = "spot";

      // spot numbers
      let spotNumberDiv = document.createElement("div");
      spotNumberDiv.className = "spot number";

      // text
      if ((j + 1) % 5 === 0) {
        let spotText = document.createElement("P");
        spotText.innerText = j + 1;
        spotNumberDiv.appendChild(spotText);
      }

      trackDiv.appendChild(spotDiv);
      spotNumbersWrapper.appendChild(spotNumberDiv);
    }

    // putting track and statbox inside wrapper
    trackWrapper.appendChild(trackDiv);
    trackWrapper.appendChild(trackStatBoxDiv);
    trackWrapper.appendChild(spotNumbersWrapper);

    // adding them to the dom
    document.querySelector(".container").appendChild(trackWrapper);
  }
}

function initStatBoxs() {
  for (let i = 0; i < 7; i++) {
    statboxs[i] = new StatBox(document.getElementById("track-stat-box-" + (i + 1)));
  }
}

function updateStatBoxs() {
  statboxs.forEach((e) => {
    e.updateCarCounts();
  });
}

function initEventHandlers() {
  let isMouseDown = false;

  function click(e) {
    config.click(e);
  }

  function input(e) {
    config.input(e);
  }

  function configKeyDown(e) {
    config.keyDown(e);
  }

  function mouseDown(e) {
    // updating selection box intial coordinates
    isMouseDown = true;
    box.mouseDown(e);
  }

  function mouseMove(e) {
    box.mouseMove(e, isMouseDown);
  }

  function mouseUp(e) {
    isMouseDown = false;
    box.mouseUp(e);
  }

  function dragStart(e) {
    box.dragStart(e);
  }

  function dragEnter(e) {
    box.dragEnter(e);
  }

  function dragOver(e) {
    box.dragOver(e);
  }

  function dragEnd(e) {
    box.dragEnd(e);
    config.updateTrackConfigurations();
    config.updateTextInput();

    updateStatBoxs();
  }

  // document.addEventListener("mousedown", mouseDown);
  // document.addEventListener("mousemove", mouseMove);
  // document.addEventListener("mouseup", mouseUp);
  document.getElementById("container-id").addEventListener("mousedown", mouseDown);
  document.getElementById("container-id").addEventListener("mousemove", mouseMove);
  document.getElementById("container-id").addEventListener("mouseup", mouseUp);
  document.getElementById("container-id").addEventListener("dragstart", dragStart);

  // for config box
  document.getElementById("track-selection-list").addEventListener("click", click);
  document.getElementById("track-config-text").addEventListener("input", input);
  document.getElementById("track-config-text").addEventListener("keydown", configKeyDown);

  // drag events
  document.querySelectorAll(".spot:not(.number)").forEach((e) => {
    e.addEventListener("dragenter", dragEnter);
    e.addEventListener("dragend", dragEnd);
  });
}

function init() {
  initTracks();
  initEventHandlers();
  //initCars("36L", "track-1");
  initCars("14L15E2BO", "track-2");
  initStatBoxs();
}

init();
