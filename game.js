const game = document.getElementById('game')
game.width = 700
game.height = 400
const ctx = game.getContext('2d')

let p1 = document.getElementById('p1')
let p2 = document.getElementById('p2')
const winner = document.getElementById('winner')
const homeBtn = document.getElementById('home-button')
const score = document.getElementById('score')
homeBtn.addEventListener('click', backToHome)

class Player {
    constructor(x, color) {
        this.y = game.height/2
        this.x = x
        this.defX = x
        this.color = color
        this.w = 10
        this.h = 100
        this.tapSpeed = 2
        this.score = 0
        this.name = ''
        this.textPos = (this.x < game.width/2 ? game.width/2-200 : game.width/2+200)
        this.posDir = {
            up: () => { return this.y - this.h / 2 },
            down: () => { return this.y + this.h / 2 },
            left: () => { return this.x - this.w / 2 },
            right: () => { return this.x + this.w / 2 },
        }
    }
    addScore() {
        this.score++
    }
    update(dir) {
        if(!((this.y <= 0 && dir < 0) || (this.y >= game.height && dir > 0))) {
            this.y += this.tapSpeed*dir;
        }
    }
    draw() {
        drawRect((this.x-this.w/2), (this.y-this.h/2), this.w, this.h, this.color)
        drawText(this.name, this.textPos, 20)
        drawText(this.score, this.textPos, 50)
    }
    setDefault() {
        this.y = game.height/2
        this.x = this.defX
    }
    allDefault() {
        this.y = game.height/2
        this.x = this.defX
        this.score = 0
    }
    changeName(name) {
        this.name = name
    }
}
class Ball {
    constructor() {
        this.x = game.width/2
        this.y = game.height/2
        this.r = 10
        this.speed = 1
        this.xDir = 1
        this.yDir = -1
        this.posDir = {
            up: () => { return this.y - this.r },
            down: () => { return this.y + this.r },
            left: () => { return this.x - this.r },
            right: () => { return this.x + this.r },
        }
    }
    touching(xDir, yDir) {
        this.xDir *= xDir
        this.yDir *= yDir
    }
    update() {
        this.x += this.speed*this.xDir
        this.y += this.speed*this.yDir
    }
    draw() {
        drawRound(this.x, this.y, this.r, 0, Math.PI*2, true, 'white')
    }
    setDefault(xTo) {
        this.x = game.width/2
        this.y = game.height/2
        this.speed = 1
        this.randDirX(xTo)
    }
    setNormalSpeed() {
        this.speed = 1
    }
    addSpeed() {
        this.speed *= 1.1
    }
    randDir() {
        this.xDir = getRandNumAss()
        this.yDir = (Math.random() * 2.6) + 0.7 * getRandNumAss()
    }
    randDirX(xTo) {
        this.xDir = xTo
        this.yDir = (Math.random() * 2.6) + 0.7 * getRandNumAss()
    }
}

const player = new Player(20, 'blue')
const bot = new Player(game.width-20, 'red')
const ball = new Ball()

const controller = {
    KeyW : {pressed: false, funct: () => player.update(-1)},
    KeyS : {pressed: false, funct: () => player.update(1)},
    ArrowUp : {pressed: false, funct: () => bot.update(-1)},
    ArrowDown : {pressed: false, funct: () => bot.update(1)},
}

let drawInterval;

// S:Main function
    function playGame() {
        player.changeName(p1.value)
        bot.changeName(p2.value)
        playTheGame()
        gameDisplay()
    }
    function playTheGame() {
        ball.randDir()
        drawInterval = setInterval(update, 1)
    }
    function update() {
        draw()
        controllPlayer()
        ballCollision()
    }
    function draw() {
        drawBackground()
        drawGame()
    }
    function drawBackground() {
        drawRect(0, 0, game.width, game.height, 'green')
        drawLine(game.width/2, 0, game.width/2, game.height, 'white', 5)
    }
    function drawGame() {
        player.draw()
        bot.draw()
        ball.draw()
    }
    function gameStop() {
        clearInterval(drawInterval)
    }
// S:Main function

// S:Display function
    const splashScreen = document.getElementById('splash')
    const gameScreen = document.getElementById('game')
    const overScreen = document.getElementById('over')

    function splashDisplay() {
        splashScreen.style.display = 'flex'
        gameScreen.style.display = 'none'
        overScreen.style.display = 'none'
    }
    function gameDisplay() {
        splashScreen.style.display = 'none'
        gameScreen.style.display = 'block'
        overScreen.style.display = 'none'
    }
    function overDisplay() {
        splashScreen.style.display = 'none'
        gameScreen.style.display = 'none'
        overScreen.style.display = 'flex'
    }
// S:Display function

// S:Controller
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)
    function keyDownHandler(e) {
        if(controller[e.code]){
            controller[e.code].pressed = true
        }
    }
    function keyUpHandler(e) {
        if(controller[e.code]){
            controller[e.code].pressed = false
        }
    }
    function controllPlayer() {
        Object.keys(controller).forEach((keyCode, i) => {
            if(controller[keyCode].pressed) {
                controller[keyCode].funct()
            }
        })
    }
// S:Controller

// S:Collision check
    function ballCollision() {
        // wall
        if(ball.posDir.left() <= 0) { playerScore('bot') }
        if(ball.posDir.right() >= game.width) { playerScore('player') }
        if(ball.posDir.up() <= 0) { ball.touching(1, -1) }
        if(ball.posDir.down() >= game.height) { ball.touching(1, -1) }

        // Player
        if(ball.posDir.left() <= player.posDir.right() && ball.posDir.left() > player.posDir.left()) {
            if(ball.posDir.down() > player.posDir.up() && ball.posDir.up() < player.posDir.down()) {
                ball.touching(-1, 1)
                ball.addSpeed()
            }
        }
        if(ball.posDir.right() >= bot.posDir.left() && ball.posDir.right() < bot.posDir.right()) {
            if(ball.posDir.down() > bot.posDir.up() && ball.posDir.up() < bot.posDir.down()) {
                ball.touching(-1, 1)
                ball.addSpeed()
            }
        }
        
        ball.update()
    }
// S:Collision check

// S:Score and over function
    function playerScore(p) {
        if(p == 'bot') {
            bot.addScore()
            ball.setDefault(1)
        } if(p == 'player') {
            player.addScore()
            ball.setDefault(-1)
        }
        player.setDefault()
        bot.setDefault()
        checkWinner()
    }
    function checkWinner() {
        if(player.score >= 10) {
            gameOver(player.name)
        } if(bot.score >= 10) {
            gameOver(bot.name)
        }
    }
    function gameOver(winner_name) {
        winner.innerText = winner_name
        score.innerText = player.score+' : '+bot.score
        gameStop()
        overDisplay()
        player.allDefault()
        bot.allDefault()
    }
    function backToHome() {
        splashDisplay()
    }
// E:Score and over function

// S:Draw object function
    function drawLine(xs, ys, xe, ye, color, lw, dashed = false)
    {
        ctx.beginPath()
        // if(dashed) ctx.setLineDash([5, 15])
        ctx.moveTo(xs, ys)
        ctx.lineTo(xe, ye)
        ctx.strokeStyle = color
        ctx.lineWidth = lw
        ctx.stroke()
        ctx.closePath()
    }
    function drawText(text, x, y, font = '24px sans-serif')
    {
        ctx.beginPath()
        ctx.font = font
        ctx.textAlign = 'center'
        ctx.fillStyle = 'white'
        ctx.fillText(text, x, y)
        ctx.strokeText(text, x, y)
        ctx.closePath()
    }
    function drawRect(x, y, w, h, fColor, sColor = 'transparent', lw = 0)
    {
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.fillStyle = fColor
        ctx.strokeStyle = sColor
        ctx.lineWidth = lw
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }
    function drawRound(x, y, r, sAngle, eAngle, cw, fColor, sColor = 'transparent', lw = 0)
    {
        ctx.beginPath()
        ctx.arc(x, y, r, sAngle, eAngle, cw)
        ctx.fillStyle = fColor
        ctx.strokeStyle = sColor
        ctx.lineWidth = lw
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }
// E:Draw object function

// S:Other function
    function getRandNumAss() {
        let randNum = Math.round(Math.random() * 2) - 1
        if(randNum == 0) randNum = getRandNumAss()
        return randNum
    }
// E:Other function