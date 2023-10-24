
export class Tween {
    /**
     * 
     * @param {number} id 
     * @param {number} startTime 
     * @param {Record<string, any>} target 
     * @param {number} duration 
     * @param {Record<string, any>} params 
     * @param {{onStart?: ()=> void; onFinish?: ()=> void;}} [hooks] 
     */
    constructor(id, startTime, target, duration, params, hooks = {}) {
        this._id = id;
        this._startTime = startTime;
        this._duration = duration;
        this._target = target;
        this._params = params;
        this._progress = 0;
        this._hooks = hooks;

            this._startValues = Object.keys(this._params).reduce((acc, key) => {
            acc[key] = this._target[key];
            return acc;
        }, {});

             this._deltaValues = Object.keys(this._params).reduce((acc, key) => {
            acc[key] = this._params[key] - this._startValues[key];
            return acc
        }, {});
    }

    get id() {
        return this._id;
    }

    get isFinished() {
        return this._progress >= 1;
    }

    onStart() {
        if (this._hooks.onStart) {
            this._hooks.onStart();
        }
    }

    onFinish() {
        if (this._hooks.onFinish) {
            this._hooks.onFinish();
        }
    };

    /**
     * @param {numebr} currentTime 
     */
    update(currentTime) {
        const deltaTime = currentTime - this._startTime;
        this._progress = Math.max(0, Math.min(1, deltaTime / this._duration));

        for (let key in this._params) {
                  this._target[key] = this._startValues[key] + this._deltaValues[key] * this._progress;
        }
    }
}

export class TweenManager {
    constructor(ticker) {
        this._tweens = [];
        this._ticker = ticker;
        this._ticker.add(this._update, this);
    }

    /**
     * 
     * @param {Record<string, any>} target 
     * @param {number} duration 
     * @param {Record<string, any>} params 
     * @param {{onStart?: ()=> void; onFinish?: ()=> void;}} [hooks] 
     */
    createTween(target, duration, params, hooks) {
        const id = Math.floor(Math.random() * 10000);
        const tween = new Tween(id, this._ticker.lastTime, target, duration, params, hooks);
        this._tweens.push(tween);
        tween.onStart();
    }

    _update() {
        const tweensToDelete = this._tweens.filter(tween => tween.isFinished);
        tweensToDelete.forEach(tween => tween.onFinish());

        this._tweens = this._tweens.filter(tween => !tween.isFinished);
        this._tweens.forEach(tween => tween.update(this._ticker.lastTime));
    }
}