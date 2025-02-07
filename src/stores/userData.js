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
        },
        async fetchData(url) {
            try {
                const response = await fetch(url, { method: 'GET' });

                if (!response.ok) {
                throw new Error('Network response was not ok');
                }

                return await response.json();
            } catch (error) {
                console.error('Fetch error:', error);
                throw error; 
            }
        },

        async updatePoints(number,id) {
            if(!id) return
            console.log('updating');
            try {
                const data = await this.fetchData(`https://www.ce-n.org/_functions/updatePoints?id=${id}&increment=${number}`);
                console.log('Shinkei point updated:', data);
                this.currentTotalPoints = data[0].totalPoints;
            } catch (error) {
                console.error('Error updating shinkei points:', error);
            }
        },
    }
});
