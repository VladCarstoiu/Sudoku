//Create variables
var timer;
var timeRemaining;
var lives;
var selectedNum;
var selectedTile;
var disableSelect;
var difficulty;

//Global val
let midDif;
let hardDif;

window.onload = function () {
  fetch('./difficulty.json')
    .then((response) => response.json())
    .then(function (json) {
      difficulty = json;
      loading();
    })
}

function loading() {
  //Run startgame function when button is clicked
  id("start-btn").addEventListener("click", startGame);
  //Add event listener to each number in number container
  for (let i = 0; i < id("number-container").children.length; i++) {
    id("number-container").children[i].addEventListener("click", function () {
      //If selecting not disabled
      if (!disableSelect) {
        //If number is already selected
        if (this.classList.contains("selected")) {
          this.classList.remove("selected");
          selectedNum = null;
        } else {
          //Deselect all other numbers
          for (let i = 0; i < 9; i++) {
            id("number-container").children[i].classList.remove("selected");
          }
          //Select it and updated selectedNum var
          this.classList.add("selected");
          selectedNum = this;
          updateMove();
        }
      }
    });
  }
}

function startGame() {
  //Choose board difficulty
  let board;
  midDif = Math.floor(Math.random() * 15);
  hardDif = Math.floor(Math.random() * 9);
  if (id("diff-1").checked) board = difficulty.easy[0].table;
  else if (id("diff-2").checked) board = difficulty.medium[midDif].table;
  else board = difficulty.hard[hardDif].table;
  //Set lives and enable selecting numbers and tiles
  livesSelected();
  disableSelect = false;
  //Create board
  generateBoard(board);
  //Starts the timer
  startTimer();
  //Sets theme based on input
  if (id("theme-1").checked) {
    qs("body").classList.remove("dark");
  } else {
    qs("body").classList.add("dark");
  }
  //Show number container
  id("number-container").classList.remove("hidden");
}

function startTimer() {
  //Sets time remaining based on input
  if (id("time-1").checked) timeRemaining = 300;
  else if (id("time-2").checked) timeRemaining = 600;
  else timeRemaining = 1200;
  //Sets timer for first second
  id("timer").textContent = timeConversion(timeRemaining);
  //Sets timer to update every second
  timer = setInterval(function () {
    timeRemaining--;
    //If no time remaining end game
    if (timeRemaining === 0) endGame();
    id("timer").textContent = timeConversion(timeRemaining);
  }, 1000)
}

//Converts seconds into string of MM:SS format
function timeConversion(time) {
  let minutes = Math.floor(time / 60);
  if (minutes < 10) minutes = "0" + minutes;
  let seconds = time % 60;
  if (seconds < 10) seconds = "0" + seconds;
  return minutes + ":" + seconds;
}

function livesSelected() {
  //Sets lives based on input
  if (id("life-5").checked) lives = 5;
  else if (id("life-3").checked) lives = 3;
  else lives = 1;
  //Sets lives
  id("lives").textContent = "Lives Remaining: " + lives;
}

function generateBoard(board) {
  //Clear board
  clearPrevious();
  //Let used to increment tile ids
  let idCount = 0;
  //Create 81 tiles
  for (let i = 0; i < 81; i++) {
    //Create new paragraph element
    let tile = document.createElement("p");
    //If tile is not supposed to be blank
    if (board.charAt(i) != "-") {
      //Set tile text to correct number
      tile.textContent = board.charAt(i);
    } else {
      //Add event listener to tile
      tile.addEventListener("click", function () {
        //If selecting not disabled
        if (!disableSelect) {
          //If tile selected
          if (tile.classList.contains("selected")) {
            //Remove selection
            tile.classList.remove("selected");
            selectedTile = null;
          } else {
            //Deselect tiles
            for (let i = 0; i < 81; i++) {
              qsa(".tile")[i].classList.remove("selected");
            }
            // Add selection and update var
            tile.classList.add("selected");
            selectedTile = tile;
            updateMove();
          }
        }
      });
    }
    //Assign tile id
    tile.id = idCount;
    //Increment for next tile
    idCount++;
    //Add tile class to all tiles
    tile.classList.add("tile");
    if ((tile.id > 17 && tile.id < 27) || (tile.id > 44 & tile.id < 54)) {
      tile.classList.add("bottomBorder");
    }
    if ((tile.id + 1) % 9 == 3 || (tile.id + 1) % 9 == 6) {
      tile.classList.add("rightBorder");
    }
    //Add tile to board
    id("board").appendChild(tile);
  }
}

function updateMove() {
  //If tile and number selected
  if (selectedTile && selectedNum) {
    //Set tile to corrent num
    selectedTile.textContent = selectedNum.textContent;
    //If num matches number in solution
    if (checkCorrect(selectedTile)) {
      //Deselect tiles
      selectedTile.classList.remove("selected");
      selectedNum.classList.remove("selected");
      //Clear selected var
      selectedNum = null;
      selectedTile = null;
      //Check if board completed
      if (checkDone()) {
        endGame();
      };
      //If num not match solution
    } else {
      //Disable selecting new num for 1 sec
      disableSelect = true;
      //Turn tile red
      selectedTile.classList.add("incorrect");
      //Run in 1 sec
      setTimeout(function () {
        //Substract lives
        lives--;
        //If no lives
        if (lives === 0) {
          endGame();
        } else {
          //If lives left
          //Update lives text
          id("lives").textContent = "Lives Remaining: " + lives;
          //Reenable selecting
          disableSelect = false;
        }
        //Restore tile
        selectedTile.classList.remove("incorrect");
        selectedTile.classList.remove("selected");
        selectedNum.classList.remove("selected");
        //Clear tiles
        selectedTile.textContent = "";
        selectedTile = null;
        selectedNum = null;
      }, 1000);
    }
  }
}

function checkDone() {
  let tiles = qsa(".tile");
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].textContent == "") return false;
  }
  return true;
}

function endGame() {
  //Disable moves, stop timer
  disableSelect = true;
  clearTimeout(timer);
  //Display win or loss message
  if (lives === 0 || timeRemaining === 0) {
    id("lives").textContent = "You Lost!";
  } else {
    id("lives").textContent = "You Won!"
  }
}

function checkCorrect(tile) {
  //Set solution based on dif selection
  let solution;
  if (id("diff-1").checked) solution = difficulty.easy[0].answer;
  else if (id("diff-2").checked) solution = difficulty.medium[midDif].answer;
  else solution = difficulty.hard[hardDif].answer;
  // If tile num equal to solution num
  if (solution.charAt(tile.id) === tile.textContent) return true;
  else return false;
}

function clearPrevious() {
  //Access all of the tiles
  let tiles = qsa(".tile");
  //Remove tiles
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].remove();
  }
  //If there is a timer clear it
  if (timer) clearTimeout(timer)
  //Deselect numbers
  for (let i = 0; i < id("number-container").children.length; i++) {
    id("number-container").children[i].classList.remove("selected");
  }
  //Clear selected var
  selectedTile = null;
  selectedNum = null;
}


//Helper functions
function id(id) {
  return document.getElementById(id);
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return document.querySelectorAll(selector);
}
