/**
 * Simple queue to throttle tasks (e.g., API calls) to a specific rate.
 */
class ThrottleQueue {
    constructor(ratePerSecond = 2) {
        this.queue = [];
        this.processing = false;
        this.minDelay = 1000 / ratePerSecond;
        this.lastCallTime = 0;
    }

    /**
     * Adds a task to the queue and returns a promise that resolves when the task is complete.
     * @param {Function} task - A function that returns a promise.
     */
    add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this._process();
        });
    }

    async _process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLastCall = now - this.lastCallTime;
            const delay = Math.max(0, this.minDelay - timeSinceLastCall);

            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const { task, resolve, reject } = this.queue.shift();
            this.lastCallTime = Date.now();

            try {
                const result = await task();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }

        this.processing = false;
    }
}

module.exports = ThrottleQueue;
