export default class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.verticalVelocity = 0;
    }

    update(left, right, jump) { 
        let dx = 0;
        let onGround = tryMove(this.x, this.y, 0, 1).dy <= 0.01;
        
        if(left) dx -= 8;
        if(right) dx += 8;
        if(onGround) {
            if(jump) this.verticalVelocity = -20;
            else this.verticalVelocity = 0;
        } else this.verticalVelocity += 1;

        let d = tryMove(this.x, this.y, dx, this.verticalVelocity);
        this.x += d.dx;
        this.y += d.dy;
    }
}

function tryMove(_x, y, dx, dy) {
    if(y + dy < 400) return {dx, dy};
    else return {dx: dx, dy: 400 - y};
}
