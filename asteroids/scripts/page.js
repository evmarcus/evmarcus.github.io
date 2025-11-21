/* ------------------- EECS 493 Assignment 3 Starter Code ------------------ */

/* ------------------------ GLOBAL HELPER VARAIBLES ------------------------ */
// Difficulty Helpers
let astProjectileSpeed = 3;            // easy: 1, norm: 3, hard: 5
let gameDifficulty = "Normal";
let spawnRate = 800;                   // easy: 1000, norm: 800, hard: 600

// Game Object Helpers
let currentAsteroid = 1;
let currentShield = 1;
let currentPortal = 1;
const AST_OBJECT_REFRESH_RATE = 15;
const maxPersonPosX = 1218;
const maxPersonPosY = 658;
const PERSON_SPEED = 5;                // #pixels each time player moves by
const portalOccurrence = 6000;         // portal spawns every 6 seconds
const portalGone = 3000;               // portal disappears in 3 seconds
const shieldOccurrence = 9000;         // shield spawns every 9 seconds
const shieldGone = 3000;               // shield disappears in 3 seconds
let asteroidSpawnerId;
let shieldSpawnerId;
let portalSpawnerId;
let scoreUpdaterId;

let playerSpeed = 3;
let playerInitialX = 617;
let playerInitialY = 339;
let playerX = 617;
let playerY = 339;
let hasShield = false;
let playerHit = false;

let restarting = false;
let playing = false;
let finalScore = -1;

// Movement Helpers
let LEFT = false;
let RIGHT = false;
let UP = false;
let DOWN = false;
let hasSeenTutorial = false;
let gamePaused = false;

let volume = 50;
let collectAudio;
let dieAudio;

/* --------------------------------- MAIN ---------------------------------- */
$(document).ready(function () {
  // jQuery selectors
  game_window = $('.game-window');
  game_screen = $("#actual-game");
  asteroid_section = $('.asteroidSection');
  // hide all other pages initially except landing page
  game_screen.hide(); // Comment me out when testing the spawn() effect below

  /* -------------------- ASSIGNMENT 2 SELECTORS BEGIN -------------------- */
    $('#play-button').click(game_toggle);
    $('#exit-button').click(show_landing_page);
  /* --------------------- ASSIGNMENT 2 SELECTORS END --------------------- */

    landing_page = $("#landing-page");
    tutorial_window = $("#tutorial-window");
    gameover_window = $("#gameover-page");
    get_ready_window = $("#get-ready-window");
    pause_button = $("#pause-button");
    score = document.getElementById("score");
    danger = document.getElementById("danger");
    level = document.getElementById("level");
    final_score = document.getElementById("final-score");
    darken = $("#darken");
    pause_window = $("#pause-window");
    restart_confirm_window = $("#restart-confirmation-window");
    restarting_text = $("#restarting-text");
    player = $(".player");

    player_sprite = document.getElementById("player-sprite")

    collectAudio = new Audio("./src/audio/collect.mp3");
    dieAudio = new Audio("./src/audio/die.mp3");

    tutorial_window.hide();
    gameover_window.hide();
    player.hide();

    setInterval(update_player, 20);
});


/* ---------------------------- EVENT HANDLERS ----------------------------- */
// Keydown event handler
document.onkeydown = function (e) {
  if (e.key == 'ArrowLeft') LEFT = true;
  if (e.key == 'ArrowRight') RIGHT = true;
  if (e.key == 'ArrowUp') UP = true;
  if (e.key == 'ArrowDown') DOWN = true;
}

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == 'ArrowLeft') LEFT = false;
  if (e.key == 'ArrowRight') RIGHT = false;
  if (e.key == 'ArrowUp') UP = false;
  if (e.key == 'ArrowDown') DOWN = false;
}

/* ------------------ ASSIGNMENT 2 EVENT HANDLERS BEGIN ------------------ */
function settings_toggle(on) {
    if (on == true) {
        $("#settings-window").show();
    }
    else {
        $("#settings-window").hide();
    }
}

function return_to_portfolio() {
    window.location.href = "../index.html";
}

function tutorial_toggle(on) {
    if (on == true) {
        $("#tutorial-window").show();
    }
    else {
        $("#tutorial-window").hide();
    }
}

function game_toggle() {
    landing_page.hide();
    if (hasSeenTutorial == false) {
        tutorial_window.show();
        hasSeenTutorial = true;
    }
    else {
        tutorial_window.hide();
        game_screen.show();
        if (!gamePaused) {
            reset_game();
        }
    }
}

function toggle_pause() {
    var play_button = document.getElementById("play-button");
    if (gamePaused) {
        darken.hide();
        pause_window.hide();
        play_button.innerHTML = "Play game!";
    }
    else {
        darken.show();
        pause_window.show();
        play_button.innerHTML = "Resume game!";
    }
    gamePaused = !gamePaused;
}

document.addEventListener("keydown", function (event) {
    if (event.key == "Escape" && playing) {
        toggle_pause();
    }
});

function toggle_confirm_restart(on) {
    if (on == true) {
        pause_window.hide();
        restart_confirm_window.show();
        playing = false;
    }
    else {
        pause_window.show();
        restart_confirm_window.hide();
        playing = true;
    }
}

function restart() {
    restart_confirm_window.hide();
    restarting_text.show();
    player.hide();
    playing = false;
    restarting = true;
    clearInterval(asteroidSpawnerId);
    clearInterval(shieldSpawnerId);
    clearInterval(portalSpawnerId);
    setTimeout(toggle_pause, 3000);
    setTimeout(reset_game, 3000);
}

function reset_game() {
    restarting_text.hide();
    restarting = false;
    hasShield = false;
    playerHit = false;
    player.hide();
    start_new_game();
}

function start_new_game() {
    // get the pause button so we can hide it
    let pause_butt = document.querySelector("#score-container button");
    pause_butt.style.visibility = "hidden";
    clear_scoreboard();
    get_ready_window.show();
    setTimeout(function start() {
        get_ready_window.hide();
        set_difficulty(gameDifficulty);
        start_scoreboard();
        pause_butt.style.visibility = "visible";
        playing = true;
        playerX = playerInitialX;
        playerY = playerInitialY;
        player.show();
        clearInterval(asteroidSpawnerId);
        asteroidSpawnerId = setInterval(spawn, spawnRate);

        clearInterval(shieldSpawnerId);
        shieldSpawnerId = setInterval(spawnNewShield, shieldOccurrence);

        clearInterval(portalSpawnerId);
        portalSpawnerId = setInterval(spawnNewPortal, portalOccurrence);
    }, 3000);
}

function clear_scoreboard() {
    clearInterval(scoreUpdaterId);
    danger.innerHTML = "0";
    score.innerHTML = "0";
    level.innerHTML = "0";
}

function start_scoreboard() {
    if (gameDifficulty == "Easy") danger.innerHTML = 10;
    else if (gameDifficulty == "Normal") danger.innerHTML = 20;
    else danger.innerHTML = 30;

    score.innerHTML = 0;
    level.innerHTML = 1;

    clearInterval(scoreUpdaterId);
    scoreUpdaterId = setInterval(update_score, 500);
}

function update_score() {
    if (gamePaused || playerHit) return;

    let currentValue = parseInt(score.innerText); // Convert to int
    let newValue = currentValue + 40;
    score.innerText = newValue.toString(); // Convert back to string and update
}

function travel_through_portal() {
    let currentDanger = parseInt(danger.innerText); // Convert to int
    let newDanger = currentDanger + 2;
    danger.innerText = newDanger.toString(); // Convert back to string and update

    let currentLevel = parseInt(level.innerText); // Convert to int
    let newLevel = currentLevel + 1;
    level.innerText = newLevel.toString(); // Convert back to string and update

    astProjectileSpeed++;
}

function update_player() {
    if (gamePaused) return;

    if (playerHit) {
        player_sprite.src = "./src/player/player_touched.gif";
        return;
    }

    let x_dest = 0;
    let y_dest = 0;

    if (LEFT) x_dest--;
    if (RIGHT) x_dest++;
    if (UP) y_dest--;
    if (DOWN) y_dest++;

    if (hasShield) {
        if (x_dest == 0 && y_dest == 0) player_sprite.src = "./src/player/player_shielded.gif";
        else if (y_dest == 1) player_sprite.src = "./src/player/player_shielded_down.gif";
        else if (y_dest == -1) player_sprite.src = "./src/player/player_shielded_up.gif";
        else if (x_dest == 1) player_sprite.src = "./src/player/player_shielded_right.gif";
        else player_sprite.src = "./src/player/player_shielded_left.gif";
    }
    else {
        if (x_dest == 0 && y_dest == 0) player_sprite.src = "./src/player/player.gif";
        else if (y_dest == 1) player_sprite.src = "./src/player/player_down.gif";
        else if (y_dest == -1) player_sprite.src = "./src/player/player_up.gif";
        else if (x_dest == 1) player_sprite.src = "./src/player/player_right.gif";
        else player_sprite.src = "./src/player/player_left.gif";
    }

    // move
    playerY += y_dest * playerSpeed;
    playerX += x_dest * playerSpeed;

    // don't exceed the limits of the screen
    if (playerX < 30) playerX = 30;
    if (playerX > 1250) playerX = 1250;
    if (playerY < 40) playerY = 40;
    if (playerY > 680) playerY = 680;

    // update asteroid's css position
    player.css('top', playerY);
    player.css('left', playerX);
}

function show_landing_page() {
    game_screen.hide();
    tutorial_window.hide();
    gameover_window.hide();
    landing_page.show();
}

function game_over() {
    clearInterval(asteroidSpawnerId);
    clearInterval(shieldSpawnerId);
    clearInterval(portalSpawnerId);

    let finalScore = parseInt(score.innerText); // Convert to int
    final_score.innerText = finalScore.toString(); // Convert back to string and update

    gameover_window.show();
    game_screen.hide();
    tutorial_window.hide();
    landing_page.hide();
}

function set_difficulty(difficulty) {
    if (difficulty == "Easy") {
        astProjectileSpeed = 1;            // easy: 1, norm: 3, hard: 5
        gameDifficulty = "Easy";
        spawnRate = 1000;                   // easy: 1000, norm: 800, hard: 600
    }
    else if (difficulty == "Normal") {
        astProjectileSpeed = 3;            // easy: 1, norm: 3, hard: 5
        gameDifficulty = "Normal";
        spawnRate = 800;                   // easy: 1000, norm: 800, hard: 600

    }
    else {
        astProjectileSpeed = 5;            // easy: 1, norm: 3, hard: 5
        gameDifficulty = "Hard";
        spawnRate = 600;                   // easy: 1000, norm: 800, hard: 600

    }
}

document.addEventListener("DOMContentLoaded", () => {
    var slider = document.getElementById("myRange");
    var output = document.getElementById("sliderValue");
    output.innerHTML = slider.value; // Display the default slider value

    slider.oninput = function () {
        output.innerHTML = this.value;
        volume = this.value;
    };


    // Button selection stuff for Settings menu
    const buttons = document.querySelectorAll("#settings-buttons button");

    function selectButton(button) {
        // Remove 'selected' class from all buttons
        // Add 'selected' class to the clicked button
        // Save the selected button to localStorage

        buttons.forEach(butt => butt.classList.remove("selected"));
        button.classList.add("selected");
        localStorage.setItem("selectedDifficulty", button.textContent);
        gameDifficulty = button.innerHTML;
    }

    // Set default button on page load
    const savedDifficulty = localStorage.getItem("selectedDifficulty");

    // If a saved difficulty exists, select the corresponding button
    // If no saved difficulty, select 'Normal' by default
    if (savedDifficulty) {
        const selectedButton = Array.from(buttons).find(b => b.textContent === savedDifficulty);
        if (selectedButton) {
            selectedButton.classList.add("selected");
            gameDifficulty = selectedButton.innerHTML;
        }
    } else {
        const defaultButton = Array.from(buttons).find(b => b.textContent === "Normal");
        if (defaultButton) {
            defaultButton.classList.add("selected");
            gameDifficulty = defaultButton.innerHTML;
        }
    }

    // Add event listeners to buttons to handle selection
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            selectButton(button);
        });
    });
});
/* ------------------- ASSIGNMENT 2 EVENT HANDLERS END ------------------- */

class Shield {
    // constructs a shield object
    constructor() {
        /*------------------------Public Member Variables------------------------*/
        // create a new Shield div and append it to DOM so it can be modified later
        const objectString = "<div id = 's-" + currentShield + "' class = 'curShield' > <img src = 'src/shield.gif'/></div>";
        asteroid_section.append(objectString);
        // select id of this Shield
        this.id = $('#s-' + currentShield);
        currentShield++; // ensure each Shield has its own id
        // current x, y position of this Shield
        this.cur_x = 0; // number of pixels from right
        this.cur_y = 0; // number of pixels from top

        /*------------------------Private Member Variables------------------------*/
        // member variables for how to move the Asteroid
        this.x_dest = 0;
        this.y_dest = 0;
        // member variables indicating when the Asteroid has reached the border
        this.hide_axis = 'x';
        this.hide_after = 0;
        this.sign_of_switch = 'neg';
        // spawn an Asteroid at a random location on a random side of the board
        this.#spawnShield();
        console.log("Shield " + this.id + " spawned at " + this.cur_x + ", " + this.cur_y);
    }

    // Requires: this method should ONLY be called by the constructor
    // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
    // Effects: randomly determines an appropriate starting/ending location for this Shield
    #spawnShield() {
        this.cur_x = getRandomNumber(0, 1280);
        this.cur_y = getRandomNumber(0, 720);
        // show this Shield's initial position on screen
        this.id.css("top", this.cur_y);
        this.id.css("right", this.cur_x);
    }
}

// Spawns a Shield
function spawnNewShield() {
    if (gamePaused) return;

    console.log("spawning shield");
    // create a shield object in the DOM
    const shield = new Shield();

    startShieldLifetime(shield);
}

function startShieldLifetime(shield) {
    let shieldRemoved = false;
    //shield.id.classList.add("fade-out");
    const shieldLifetime = setInterval(function () {

        if (restarting) {
            shieldRemoved = true;
            // remove this Shield from DOM (using jQuery .remove() method)
            shield.id.remove();
            // clear the interval that moves this Asteroid
            clearInterval(shieldLifetime);
        }

        if (isColliding(shield.id, player)) {
            shieldRemoved = true;

            collectAudio.volume = volume / 100; // Set volume (range: 0.0 to 1.0)
            collectAudio.play(); // Play the audio

            shield.id.remove();

            hasShield = true;
            // clear the interval that checks collision
            clearInterval(shieldLifetime);
        }
    }, AST_OBJECT_REFRESH_RATE);

    const killShield = setTimeout(function () {
        if (shieldRemoved) return;

        console.log("removing shield " + shield.id);
        // remove this Shield from DOM (using jQuery .remove() method)
        shield.id.fadeOut(shieldGone);
        clearInterval(shieldLifetime);
        setTimeout(shield.id.remove, shieldGone)
    }, shieldGone);
}

/* ---------------------------- PORTALS --------------------------------- */

class Portal {
    // constructs a Portal object
    constructor() {
        /*------------------------Public Member Variables------------------------*/
        // create a new Portal div and append it to DOM so it can be modified later
        const objectString = "<div id = 'p-" + currentPortal + "' class = 'curPortal' > <img src = 'src/port.gif'/></div>";
        asteroid_section.append(objectString);
        // select id of this Portal
        this.id = $('#p-' + currentPortal);
        currentPortal++; // ensure each Portal has its own id
        // current x, y position of this Portal
        this.cur_x = 0; // number of pixels from right
        this.cur_y = 0; // number of pixels from top

        // spawn a Portal at a random location
        this.#spawnPortal();
        console.log("Portal " + this.id + " spawned at " + this.cur_x + ", " + this.cur_y);
    }

    // Requires: this method should ONLY be called by the constructor
    // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
    // Effects: randomly determines an appropriate starting/ending location for this Asteroid
    //          all asteroids travel at the same speed
    #spawnPortal() {
        // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
        this.cur_x = getRandomNumber(0, 1280);
        this.cur_y = getRandomNumber(0, 720);
        // show this Shield's initial position on screen
        this.id.css("top", this.cur_y);
        this.id.css("right", this.cur_x);
        // normalize the speed s.t. all Asteroids travel at the same speed
        //const speed = Math.sqrt((this.x_dest) * (this.x_dest) + (this.y_dest) * (this.y_dest));
        //this.x_dest = this.x_dest / speed;
        //this.y_dest = this.y_dest / speed;
    }
}

// Spawns a Portal
function spawnNewPortal() {
    if (gamePaused) return;

    console.log("spawning Portal");
    // create a shield object in the DOM
    const portal = new Portal();
    // move this Asteroid across the screen
    //move(asteroid);

    startPortalLifetime(portal);
}

function startPortalLifetime(portal) {
    let portalRemoved = false;
    //shield.id.classList.add("fade-out");
    const portalLifetime = setInterval(function () {
        // HINT: Consider checking collision and other game states here

        if (restarting) {
            portalRemoved = true;
            // remove this portal from DOM (using jQuery .remove() method)
            portal.id.remove();
            // clear the interval that updates this portal
            clearInterval(portalLifetime);
            return;
        }

        if (isColliding(portal.id, player) && !portalRemoved) {
            portalRemoved = true;
            console.log("Portal!");
            portal.id.remove();

            collectAudio.volume = volume / 100; // Set volume (range: 0.0 to 1.0)
            collectAudio.play(); // Play the audio

            // Update the danger and level
            travel_through_portal()

            // clear the interval that checks collision
            clearInterval(portalLifetime);
            return;
        }
    }, AST_OBJECT_REFRESH_RATE);

    const killPortal = setTimeout(function () {
        if (portalRemoved) return;

        console.log("removing portal " + portal.id);
        // remove this Shield from DOM (using jQuery .remove() method)
        portal.id.fadeOut(portalGone);
        clearInterval(portalLifetime);
        setTimeout(portal.id.remove, portalGone)
    }, portalGone);
}

/* ---------------------------- GAME FUNCTIONS ----------------------------- */
// Starter Code for randomly generating and moving an asteroid on screen
class Asteroid {
  // constructs an Asteroid object
  constructor() {
    /*------------------------Public Member Variables------------------------*/
    // create a new Asteroid div and append it to DOM so it can be modified later
    const objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAsteroid' > <img src = 'src/asteroid.png'/></div>";
    asteroid_section.append(objectString);
    // select id of this Asteroid
    this.id = $('#a-' + currentAsteroid);
    currentAsteroid++; // ensure each Asteroid has its own id
    // current x, y position of this Asteroid
    this.cur_x = 0; // number of pixels from right
    this.cur_y = 0; // number of pixels from top

    /*------------------------Private Member Variables------------------------*/
    // member variables for how to move the Asteroid
    this.x_dest = 0;
    this.y_dest = 0;
    // member variables indicating when the Asteroid has reached the border
    this.hide_axis = 'x';
    this.hide_after = 0;
    this.sign_of_switch = 'neg';
    // spawn an Asteroid at a random location on a random side of the board
      this.#spawnAsteroid();

  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
    // get the current position of interest (either the x position or the y position):
    const cur_pos = this.hide_axis === "x" ? this.cur_x : this.cur_y;
    // determine if the asteroid has reached its destination:
    return this.sign_of_switch === "pos" ? (cur_pos > this.hide_after) : (cur_pos < this.hide_after);
  }

    // Requires: called by the user
    // Modifies: cur_y, cur_x
    // Effects: move this Asteroid 1 unit in its designated direction
    updatePosition() {
        if (gamePaused) return;

        // ensures all asteroids travel at current level's speed
        this.cur_y += this.y_dest * astProjectileSpeed;
        this.cur_x += this.x_dest * astProjectileSpeed;
        // update asteroid's css position
        this.id.css('top', this.cur_y);
        this.id.css('right', this.cur_x);
    }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
    #spawnAsteroid() {
    // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
    const x = getRandomNumber(0, 1280);
    const y = getRandomNumber(0, 720);
    const floor = 784;
    const ceiling = -64;
    const left = 1344;
    const right = -64;
    const major_axis = Math.floor(getRandomNumber(0, 2));
    const minor_aix = Math.floor(getRandomNumber(0, 2));
    let num_ticks;

    if (major_axis == 0 && minor_aix == 0) {
      this.cur_y = floor;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 0 && minor_aix == 1) {
      this.cur_y = ceiling;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = 784;
      this.sign_of_switch = 'pos';
    }
    if (major_axis == 1 && minor_aix == 0) {
      this.cur_y = y;
      this.cur_x = left;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 1 && minor_aix == 1) {
      this.cur_y = y;
      this.cur_x = right;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = 1344;
      this.sign_of_switch = 'pos';
    }
    // show this Asteroid's initial position on screen
    this.id.css("top", this.cur_y);
    this.id.css("right", this.cur_x);
    // normalize the speed s.t. all Asteroids travel at the same speed
    const speed = Math.sqrt((this.x_dest) * (this.x_dest) + (this.y_dest) * (this.y_dest));
    this.x_dest = this.x_dest / speed;
    this.y_dest = this.y_dest / speed;
  }
}

// Spawns an Asteroid travelling from one side to another
function spawn() {
    if (gamePaused) return;

  console.log("spawning asteroid");
  // create an Asteroid object in the DOM
  const asteroid = new Asteroid();
  // move this Asteroid across the screen
  move(asteroid);
}

function move(asteroid) {
  // create an interval to move an Asteroid (i.e. repeatedly update an Asteroid's position)
  const astermovement = setInterval(function () {
      // HINT: Consider checking collision and other game states here

      if (restarting) {
          // remove this Asteroid from DOM (using jQuery .remove() method)
          asteroid.id.remove();
          // clear the interval that moves this Asteroid
          clearInterval(astermovement);
      }

      if (isColliding(asteroid.id, player)) {
          console.log("Collision!");
          
          if (hasShield) hasShield = false;
          else {
              // comment out for invulnerability
              playerHit = true;

              dieAudio.volume = volume / 100; // Set volume (range: 0.0 to 1.0)
              dieAudio.play(); // Play the audio

              setTimeout(game_over, 1000);
          }

          asteroid.id.remove();
          // clear the interval that checks collision
          clearInterval(astermovement);
      }

    // update Asteroid position on screen
    asteroid.updatePosition();
    // determine whether Asteroid has reached its end position
    if (asteroid.hasReachedEnd()) { // i.e. outside the game border
      // remove this Asteroid from DOM (using jQuery .remove() method)
      asteroid.id.remove();
      // clear the interval that moves this Asteroid
      clearInterval(astermovement);
    }
  }, AST_OBJECT_REFRESH_RATE);
}

/* --------------------- Additional Utility Functions  --------------------- */
// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  if (gamePaused) return false;
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}
