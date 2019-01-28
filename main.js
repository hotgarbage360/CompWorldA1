var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
    this.active = false;
}

Animation.prototype.rowMode = function(){
    this.totalTime = this.frameDuration * this.sheetWidth;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.active = true;
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop){
            this.elapsedTime = 0;
        } else {
            this.active = false
        }
        
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.drawFrameFromRow = function (tick, ctx, x, y, row) {
    this.active = true;
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop){
            this.elapsedTime = 0;
        } else {
            this.active = false
        }
        
    }
    var frame = this.currentFrameFixedRow();
    // var imgheight =  (this.frames/this.sheetWidth)*this.frameHeight;
    var yidx = this.frameHeight*row;
    ctx.drawImage(this.spriteSheet,
                frame * this.frameWidth, yidx,  // source from sheet
                this.frameWidth, this.frameHeight,
                x, y,
                this.frameWidth * this.scale,
                this.frameHeight * this.scale);
}


Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

//take sprites from one particular row
Animation.prototype.currentFrameFixedRow = function () {
    return Math.floor(this.elapsedTime / this.frameDuration)%this.sheetWidth;
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};


function Player(game, walksheet, shootsheet) {
    this.animation = new Animation(walksheet, 64, 64, 8, .12, 32, true, 1.5);
    this.shootanimation = new Animation(shootsheet,64,64, 7, .12, 28, true, 1.5);
    this.walksheet = walksheet;
    this.shootsheet = shootsheet;
    this.shootanimation.rowMode();
    this.animation.rowMode();
    this.maxSpeed = 200;
    this.xspeed = 200;
    this.yspeed = 0;
    this.changeTimer = 0;
    this.ctx = game.ctx;
    this.movedir = 3;
    //this.shooting = false;
    Entity.call(this, game, 0, 500);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    let time = this.game.clockTick
    /*if(this.game.space){
        this.shooting = true;
    } else*/ if(/*!this.shooting &&*/ !this.game.space && !this.shootanimation.active){
        this.changeTimer += time;
        if (this.x >= 700){
            this.xspeed = Math.min(this.xspeed, -this.xspeed);
            this.movedir = 1;
        }else if (this.x < -50){
            this.xspeed = Math.max(this.xspeed, -this.xspeed);
            this.movedir = 3;
        } else if(600<=this.y || this.y<-10){
            this.yspeed = this.y<-10?Math.max(this.yspeed, -this.yspeed):Math.min(this.yspeed, -this.yspeed);
            if(this.xspeed === 0){
                this.movedir = this.y<-10?2:0;
            } else {
                this.movedir = this.xspeed>0?3:1;
            }
        } else if(this.changeTimer>=4){
            this.newRandDir();
            this.changeTimer = 0;
        }
        this.x += time * this.xspeed;
        this.y += time * this.yspeed;
    }
    Entity.prototype.update.call(this);
}

Player.prototype.newRandDir = function() {
    let choice = Math.floor(Math.random()*7);
    switch(choice){
        //up
        case 0:
            this.movedir = 0;
            this.yspeed = -200;
            this.xspeed = 0;
            break;
        //up left
        case 1:
            this.movedir = 1;
            this.yspeed = -100;
            this.xspeed = -100;
            break;
        //left
        case 2:
            this.movedir = 1;
            this.xspeed = -200;
            this.yspeed = 0;
            break;
        //down left
        case 3:
            this.movedir = 1;
            this.yspeed = 100;
            this.xspeed = -100;
            break;
        //down
        case 4:
            this.movedir = 2;
            this.yspeed = 200;
            this.xspeed = 0;
            break;
        //down right
        case 5:
            this.movedir = 3;
            this.yspeed = 100;
            this.xspeed = 100;
            break;
        //right
        case 6:
            this.movedir = 3;
            this.xspeed = 200;
            this.yspeed = 0;
            break;
        //up right
        case 7:
            this.movedir = 3;
            this.yspeed = -100;
            this.xspeed = 100;
            break;
    }
}


// Player.prototype.draw = function () {
//     if(this.shootanimation.isDone() && !this.game.space){
//         this.shooting = false;
//         this.shootanimation.elapsedTime = 0;
//     }
//     if(this.shooting && !this.shootanimation.isDone()){
//         this.shootanimation.drawFrameFromRow(this.game.clockTick, this.ctx, this.x, this.y, this.movedir);
//     } else {
//         this.shooting = false;
//         this.animation.drawFrameFromRow(this.game.clockTick, this.ctx, this.x, this.y, this.movedir);
//     }
//     Entity.prototype.draw.call(this);
// }
Player.prototype.draw = function () {
    if(this.game.space || this.shootanimation.active){
       this.shootanimation.loop = this.game.space?true:false;
        this.shootanimation.drawFrameFromRow(this.game.clockTick, this.ctx, this.x, this.y-2, this.movedir);
    } else {

        this.animation.drawFrameFromRow(this.game.clockTick, this.ctx, this.x, this.y, this.movedir);
    }
    Entity.prototype.draw.call(this);
}

// function Camera()

// function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {

AM.queueDownload("./img/castle_hall.png");
AM.queueDownload("./img/charwalk.png");
AM.queueDownload("./img/charshoot_loop.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/castle_hall.png")));
    gameEngine.addEntity(new Player(gameEngine, AM.getAsset("./img/charwalk.png"), AM.getAsset("./img/charshoot_loop.png")));
    console.log("All Done!");
});