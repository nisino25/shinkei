import { defineStore } from 'pinia';

export const userData = defineStore('game', {
    state: () => ({
        gamePoint: 0,
        selectGame: null,
        loading: null,

        uniqueId: null,
        computedHref: null,

        currentUserRow: null,
        currentUsername: null,
        currentTotalPoints: null,
        hasPointsReached: null,
    }),
    actions: {
        setGamePoint(point) {
            this.gamePoint = point;
        },
        increasePoint() {
            this.gamePoint += 1;
        },
        decreasePoint() {
            if (this.gamePoint > 0) {
                this.gamePoint -= 1;
            }
        }
    }
});
