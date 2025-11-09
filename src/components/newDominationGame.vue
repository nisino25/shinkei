<template>
    <div class="tiles-app flex gap-6 px-6">
        <aside class="w-72 flex-shrink-0 flex flex-col gap-4">
            <div class="space-y-3">
                <h2 class="text-lg font-semibold">Players</h2>
                <div
                    v-for="player in players"
                    :key="player.id"
                    class="p-3 border rounded-md flex flex-col gap-2 relative"
                    :style="{ background: currentPlayer === player.id ? '#FFC72C' : '' }"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-7 h-7 rounded-md" :style="{ background: player.color }"></div>
                        <div class="flex-1 text-sm">
                            <div class="font-medium">{{ player.name }}</div>
                            <div class="text-xs text-gray-500">Team {{ player.id }}</div>
                            <div class="text-xs font-semibold text-gray-700 mt-1">Score: {{ player.score }}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                      <template v-for="(color, type) in typeColors" :key="type">
                        <button
                            v-if="type !== 'none'"
                            class="flex-1 px-2 py-1 text-xs rounded-md text-black border transition-colors duration-200"
                            :style="{
                                borderColor: color,
                                background:
                                    currentPlayer === player.id && currentType === type
                                        ? color
                                        : 'transparent',
                            }"
                            @click="setSelectType(player.id, type)"
                        >
                            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                        </button>
                      </template>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <h3 class="text-sm font-medium">Actions</h3>
                <div class="flex flex-col gap-2">
                    <button
                        class="w-full px-3 py-2 rounded-md border bg-white text-sm hover:bg-gray-50"
                        @click="resetTiles"
                    >
                        Reset All Tiles
                    </button>
                </div>
            </div>
        </aside>

        <main class="flex-1">
            <div class="w-full rounded-md bg-gray-200 p-4">
                <div
                    class="grid gap-1 w-full h-full"
                    :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
                >
                <div
    v-for="tile in tiles"
    :key="tile.id"
    class="relative rounded-sm transition-transform duration-150 cursor-pointer"
    :class="{
        'scale-[1.03] ring-4 ring-offset-1': tile.selected,
        'animate-pulse': tile.validForSelection
    }"
    @click="onTileClick(tile)"
    :style="tileStyle(tile)"
>
<div
                            v-if="tile.ownerTeam !== null"
                            class="absolute left-1/2 top-1/2 w-1/2 aspect-square rounded-full border-[3px] bg-white bg-opacity-90 transform -translate-x-1/2 -translate-y-1/2 "
                            :style="{ background: teamColor(tile.ownerTeam) }"
                        ></div></div>

                
                    <!-- <div
                        v-for="tile in tiles"
                        :key="tile.id"
                        class="relative rounded-sm transition-transform duration-150 cursor-pointer"
                        :class="{ 'scale-[1.03] ring-4 ring-offset-1': tile.selected }"
                        @click="onTileClick(tile)"
                        :style="tileStyle(tile)"
                    >
                        
                    </div> -->
                </div>
            </div>
        </main>
    </div>
</template>

<script>
export default {
    // name: 'Tiles20x20',
    data() {
        const cols = 15
        const rows = 15
        const tiles = []
        let id = 1
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                tiles.push({
                    id: id++,
                    row: r,
                    col: c,
                    type: 'none',
                    selected: false,
                    ownerTeam: null
                })
            }
        }

        return {
            cols,
            rows,
            tiles,
            currentPlayer: null,
            currentType: null,
            players: [
                { id: 1, name: 'Player 1', color: '#2563eb', score: 0 },
                { id: 2, name: 'Player 2', color: '#7c3aed', score: 0 },
                { id: 3, name: 'Player 3', color: '#f97316', score: 0 }
            ],
            typeColors: {
                grass: '#7ED957', // green
                bug: 'blue', // brown
                animal: '#E04E4E', // red
                none: '#d1d5db' // grey
            },
            typePoints: {
                grass: 1,
                bug: 3,
                animal: 10
            }
        }
    },
    methods: {
        onTileClick(tile) {
          if(tile.ownerTeam !== null) return; // already owned
          if(this.currentType === null) return; // no type selected
          if (!tile.validForSelection) return // not valid for selection

          tile.ownerTeam = this.currentPlayer
          tile.type = this.currentType

          this.currentType = null
          this.updateValidTiles()
          this.updateScores()
          this.goToNextPlayer()
        },
        resetTiles() {
            this.tiles.forEach(t => {
                t.type = 'none'
                t.ownerTeam = null
                t.selected = false
            })
            this.players.forEach(p => (p.score = 0))
        },
        setSelectType(playerId, type) {
            if(this.currentPlayer !== playerId) return
            this.currentPlayer = playerId
            this.currentType = type
            this.updateValidTiles()
        },
        updateScores() {
            this.players.forEach(p => {
                const owned = this.tiles.filter(t => t.ownerTeam === p.id)
                let total = 0
                owned.forEach(t => {
                    total += this.typePoints[t.type] || 0
                })
                p.score = total
            })
        },
        teamColor(teamId) {
            const player = this.players.find(p => p.id === teamId)
            return player ? player.color : '#000'
        },
        tileStyle(tile) {
            const base = {
                background: this.typeColors[tile.type] || '#ccc',
                width: '100%',
                aspectRatio: '1 / 1'
            }

            // pulse for valid tiles
            if (tile.validForSelection) {
                base.animation = 'pulse 1s infinite'
                base.background = 'gold'
                return base
            }

            if (tile.ownerTeam !== null) {
                base.boxShadow = `inset 0 0 0 3px ${this.teamColor(tile.ownerTeam)}55`
            }

            if (tile.selected) {
                base.transform = 'scale(1.03)'
            }

            return base
        },
        goToNextPlayer() {
            if (!this.players.length) return
            this.currentType = null

            const currentIndex = this.players.findIndex(
                (p) => p.id === this.currentPlayer
            )
            const nextIndex = (currentIndex + 1) % this.players.length
            this.currentPlayer = this.players[nextIndex].id
        },

        updateValidTiles() {
            this.tiles.forEach(t => t.validForSelection = false) // reset

            if(this.currentType === 'grass') {
                this.tiles.forEach(t => {
                    if(t.ownerTeam === null) t.validForSelection = true
                })
            }

            if(this.currentType === 'bug') {
                this.tiles.forEach(t => {
                    if(t.ownerTeam !== null) return
                    const neighbors = this.getNeighbors(t)
                    const touchingGrass = neighbors.filter(n => n.type === 'grass')
                    if(touchingGrass.length >= 2) t.validForSelection = true
                })
            }

            if(this.currentType === 'animal') {
                this.tiles.forEach(t => {
                    if(t.ownerTeam !== null) return
                    const neighbors = this.getNeighbors(t)
                    const touchingBugs = neighbors.filter(n => n.type === 'bug')
                    if(touchingBugs.length >= 2) t.validForSelection = true
                })
            }
        },

        getNeighbors(tile) {
            const { row, col } = tile
            return this.tiles.filter(t =>
                (t.row === row && Math.abs(t.col - col) === 1) ||
                (t.col === col && Math.abs(t.row - row) === 1)
            )
        },
    },
   mounted() {
        console.clear()
        // set the first player as the current player on mount
        if (this.players.length > 0) {
            this.currentPlayer = this.players[0].id
        }
    },
}
</script>

<style scoped>
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.7; }
}

/* @keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
} */
/* .animate-pulse {
    background: yellow;
} */
</style>
