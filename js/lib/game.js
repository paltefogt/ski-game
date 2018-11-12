import {EventEmitter} from "./event.emitter.js";
import {Skier} from "./skier.js";
import {EVENTS} from "./config.js";
import {ObstacleManager} from "./obstacle.manager.js";
import {Utils} from "./utils.js";

export class Game extends EventEmitter {
    constructor() {
        super();

        const utils = new Utils();
        this.gameWidth = utils.gameWidth;
        this.gameHeight = utils.gameHeight;
        this.canvas = $('<canvas></canvas>')
            .attr('width', this.gameWidth * window.devicePixelRatio)
            .attr('height', this.gameHeight * window.devicePixelRatio)
            .css({
                width: this.gameWidth + 'px',
                height: this.gameHeight + 'px'
            });
        $('body').append(this.canvas);
        this.ctx = this.canvas[0].getContext('2d');

        // event listeners
        this.addListener(EVENTS.GAME_INIT_COMPLETE, (event, data) => this.onEvent(event, data));

        // game objects
        this.skier = new Skier(this, 0, 0);
        this.obstacleManager = new ObstacleManager(this);
    }

    setupKeyhandler() {
        const self = this;
        $(window).keydown(function(event) {
            switch(event.which) {
                case 37: // left
                    if(self.skier.direction === 1) {
                        //self.skier.x -= self.skier.speed;
                        self.obstacleManager.placeNewObstacle(self.skier.direction);
                    }
                    else {
                        self.skier.direction === 0 ? self.skier.direction = 1 : --self.skier.direction;
                    }
                    event.preventDefault();
                    break;
                case 39: // right
                    if(self.skier.direction === 5) {
                        //self.skier.x += self.skier.speed;
                        self.obstacleManager.placeNewObstacle(self.skier.direction);
                    }
                    else {
                        self.skier.direction === 0 ? self.skier.direction = 5 : ++self.skier.direction;
                    }
                    event.preventDefault();
                    break;
                case 38: // up
                    if(self.skier.direction === 1 || self.skier.direction === 5) {
                        //self.skier.y -= self.skier.speed;
                        self.obstacleManager.placeNewObstacle(6);
                    }
                    event.preventDefault();
                    break;
                case 40: // down
                    self.skier.direction = 3;
                    event.preventDefault();
                    break;
            }
        });
    };

    initGame() {
        const self = this;
        this.setupKeyhandler();
        this.skier.loadAssets()
            .then(() => self.obstacleManager.loadAssets())
            .then(() => {
                self.obstacleManager.placeInitialObstacles(self.gameWidth, self.gameHeight);
                self.emit(EVENTS.GAME_INIT_COMPLETE);
                //requestAnimationFrame(self.gameLoop());
            })
            .catch(err => {
                console.log('ERROR initGame');
                console.log(err);
            });
    };

    gameLoop() {
        const utils = new Utils();

        this.ctx.save();
        // Retina support
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.clearCanvas();

        this.skier.move();

        utils.checkIfSkierHitObstacle(this.skier, this.obstacleManager.obstacles, this.gameWidth, this.gameHeight);
        this.skier.draw(this.ctx, this.gameWidth, this.gameHeight);
        this.obstacleManager.drawObstacles(this.ctx, this.skier.x, this.skier.y, this.gameWidth, this.gameHeight);
        this.ctx.restore();
        requestAnimationFrame(this.gameLoop.bind(this));
    };

    onEvent(event, data) {
        switch(event) {
            case EVENTS.GAME_INIT_COMPLETE:
                console.log('GAME_INIT_COMPLETE');
                this.gameLoop();
                break;
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    };
}