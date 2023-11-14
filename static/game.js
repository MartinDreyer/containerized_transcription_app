// Game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gravity = 1;
let gameRunning = false;
let speed = 5;
let score = 0;
let obstacles = [];
let gameSpeedIncrement = 0.25; // How much to increase speed after each jump

// Dino variables

const dinoImage = new Image();
dinoImage.src = "../static/styles/tv2-fyn-bil.png"; // Replace with the path to your dino image
const dino = {
  x: 50,
  y: 150,
  width: 55,
  height: 35,
  jumpPower: 15,
  velocityY: 0,
  jumping: false,
  grounded: false,
  draw: function () {
    ctx.drawImage(dinoImage, this.x, this.y, this.width, this.height);
  },
  jump: function () {
    if (!this.jumping && this.grounded) {
      this.jumping = true;
      this.grounded = false;
      this.velocityY = -this.jumpPower;
    }
  },
  update: function () {
    if (this.jumping) {
      this.y += this.velocityY;
      this.velocityY += gravity;
    }
    if (this.y >= 150) {
      this.jumping = false;
      this.grounded = true;
      this.y = 150;
      this.velocityY = 0;
    }
  },
};

// Obstacle constructor
function Obstacle(x, width) {
  this.x = x;
  this.y = 150;
  this.width = width;
  this.height = 40;
  this.draw = function () {
    ctx.fillStyle = "#444";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  this.update = function () {
    this.x -= speed;
  };
}

// Input handling
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (!gameRunning) {
      startGame();
    }
    dino.jump();
  }
});

// Start the game
function startGame() {
  gameRunning = true;
  speed = 5;
  obstacles = [];
  score = 0;

  // Add the first obstacle
  addObstacle();

  requestAnimationFrame(updateGame);
}

// Add a new obstacle
function addObstacle() {
  const minWidth = 20;
  const maxWidth = 40;
  const width =
    Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
  obstacles.push(new Obstacle(canvas.width, width));
}

// Update game state
function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dino.update();
  dino.draw();

  // Adding and updating obstacles
  if (gameRunning && obstacles[obstacles.length - 1].x < canvas.width - 300) {
    addObstacle();
  }
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].update();
    obstacles[i].draw();

    // Collision detection
    if (
      dino.x < obstacles[i].x + obstacles[i].width &&
      dino.x + dino.width > obstacles[i].x &&
      dino.y < obstacles[i].y + obstacles[i].height &&
      dino.y + dino.height > obstacles[i].y
    ) {
      // Game over
      gameRunning = false;
      alert("Game over! Score: " + score);
      return;
    }

    if (obstacles[i].x + obstacles[i].width < 0) {
      // Increment score and speed
      score++;
      speed += gameSpeedIncrement;
      obstacles.splice(i, 1);
      i--;
    }
  }

  // Display score
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, canvas.width - 150, 30);

  requestAnimationFrame(updateGame);
}
