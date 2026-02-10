<template>
    <div class="tiles-app flex gap-6 px-6">
        <aside class="w-80 flex-shrink-0 flex flex-col gap-4">
            <div class="space-y-3">
                    <h2 class="text-lg font-semibold">プレイヤー</h2>
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
                            <!-- <div class="text-xs text-gray-500">チーム {{ player.id }}</div> -->
                            <div class="text-xs font-semibold text-gray-700 mt-1">スコア: {{ player.score }}</div>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <div
                            v-for="card in getDisplayHand(hands[player.id])"
                            :key="card.id"
                            class="inline-flex items-center gap-2
                                px-3 py-1 rounded-full
                                text-xs font-medium
                                    text-slate-700
                                border border-slate-300"
                            :class="areaBadgeClass(card.area)"
                        >
                            <span class="text-[10px] text-slate-500">
                                Lv{{ card.tier }}
                            </span>
                            <span>
                                {{ card.label }}
                            </span>
                            <span class="text-slate-500">
                                ×{{ card.holdingCount }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <h3 class="text-sm font-medium">アクションボタン</h3>
                <div class="flex flex-col gap-2">
                    <button
                        class="w-full px-3 py-2 rounded-md border bg-gray-200 text-sm"
                        @click="resetTiles"
                    >
                        タイルをリセット
                    </button>
                </div>
            </div>
            <div class="space-y-2">
                <h3 class="text-sm font-medium">色の説明</h3>
                <div class="grid grid-cols-3 gap-2">
                    <div
                        v-for="item in terrainList"
                        :key="item.key"
                        class="flex items-center gap-2"
                    >
                        <div
                            class="w-4 h-4 rounded-full"
                            :style="{ background: areaColors[item.key] }"
                        ></div>
                        <span class="text-xs">{{ item.label }}</span>
                    </div>
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
                        'scale-[1.03] ring-4 ring-offset-1': tile.selected
                    }"
                    @click="onTileClick(tile)"
                    :style="tileStyle(tile)"
                >
                    <div 
                        v-if="tile.validForSelection"
                        class="
                        animate-pulse
                        absolute
                        top-1/2
                        left-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                        bg-golden
                        w-[70%]
                        rounded-full
                        aspect-square
                        bg-yellow-100"
                        >
                    </div>
                    <div v-if="tile.ownerTeam !== null">
                        <div class="
                            block
                            absolute
                            top-1/2
                            left-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            bg-white
                            w-[60%]
                            rounded-full
                            aspect-square
                        "
                        ></div>
                        <div
                            class="absolute left-1/2 top-1/2 w-1/2 aspect-square rounded-full border-[6px] bg-opacity-90 transform -translate-x-1/2 -translate-y-1/2 tile-circle z-10"
                            :style="{
                                background: typeColors[tile.type],
                                borderColor: teamColor(tile.ownerTeam)
                            }"
                        ></div>
                    </div>

                </div>
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

        return {
            cols,
            rows,
            tiles: [],
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
            },
            areaTypes: ['town', 'forest', 'river', 'sea'],
            areaColors: {
                town: '#E59A4F',       // darker grey
                forest: '#5FA86E',
                dirt: '#D7B899',       // lighter dirt
                river: '#6EC4E8',
                sea: '#3A83C3',
                undeveloped: '#4A4A4A' // reddish, new
            },
            terrainList: [
                { key: 'town', label: '町' },
                { key: 'forest', label: '森' },
                { key: 'dirt', label: '土' },
                { key: 'river', label: '川' },
                { key: 'sea', label: '海' },
                { key: 'undeveloped', label: '未開発地' },
            ],

            landAreaCards: [
                { id: 'モンシロチョウ', label: 'モンシロチョウ', tier: 1, area: 'land', count: 6 },
                { id: 'mimizu', label: 'ミミズ', tier: 1, area: 'land', count: 6 },
                { id: 'shimaenaga', label: 'シマエナガ', tier: 2, area: 'land', count: 4 },
                { id: 'kitakitsune', label: 'キタキツネ', tier: 3, area: 'land', count: 3 }
            ],

            waterAreaCards: [
                { id: 'gengoro', label: 'げんごろう', tier: 1, area: 'water', count: 6 },
                { id: 'yago', label: 'やご', tier: 1, area: 'water', count: 6 },
                { id: 'tanago', label: 'タナゴ', tier: 2, area: 'water', count: 4 },
                { id: 'dojo', label: 'ドジョウ', tier: 3, area: 'water', count: 3 }
            ],

            allCards: [
                {
                    id:'オオワシ', get label(){return this.id},
                    area: 'land', count: 1,
                },
                {
                    id:'キタキツネ', get label(){return this.id},
                    area: 'land', count: 2,
                },
                {
                    id:'エゾタヌキ', get label(){return this.id},
                    area: 'land', count: 2,
                },
                {
                    id:'エゾリス', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'オコジョ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'カヤネズミ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'エゾウサギ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'ミミズ', get label(){return this.id},
                    area: 'land', count: 10,
                },
                {
                    id:'アブラムシ', get label(){return this.id},
                    area: 'land', count: 4,
                },
                {
                    id:'カナブン', get label(){return this.id},
                    area: 'land', count: 4,
                },
                {
                    id:'シオカラトンボ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'モンシロチョウ', get label(){return this.id},
                    area: 'land', count: 4,
                },
                {
                    id:'カマキリ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'ミツバチ', get label(){return this.id},
                    area: 'land', count: 4,
                },
                {
                    id:'シジミチョウ', get label(){return this.id},
                    area: 'land', count: 4,
                },
                {
                    id:'イトウ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'オショロコマ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'ニジマス', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'ヤマメ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'ウグイ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'ヤゴ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'カゲロウの幼虫', get label(){return this.id},
                    area: 'water', count: 2,
                },
                {
                    id:'ゲンゴロウ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'川エビ', get label(){return this.id},
                    area: 'water', count: 4,
                },
                {
                    id:'オタマジャクシ', get label(){return this.id},
                    area: 'water', count: 4,
                },
                {
                    id:'シマエナガ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'エゾモモンガ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'ヒグマ', get label(){return this.id},
                    area: 'land', count: 1,
                },
                {
                    id:'タンチョウツル', get label(){return this.id},
                    area: 'land', count: 1,
                },
                {
                    id:'エゾサンショウウオ', get label(){return this.id},
                    area: 'water', count: 1,
                },
                {
                    id:'シマフクロウ', get label(){return this.id},
                    area: 'land', count: 1,
                },
                {
                    id:'ヒメネズミ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'モグラ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'アカガエル', get label(){return this.id},
                    area: 'water', count: 3,
                },
                {
                    id:'アブ', get label(){return this.id},
                    area: 'land', count: 3,
                },
                {
                    id:'エゾシカ', get label(){return this.id},
                    area: 'land', count: 2,
                },
            ],

            // プレイヤーごとの手札
            hands: {}


        }
    },
    methods: {
        onTileClick(tile) {
            if(tile.area === 'undeveloped') {
                alert("まだ動物たちが住めないから、環境をなおしてね")
                return; // cannot select undeveloped
            }
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
            this.generateTiles()
            this.initializeHands()

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
            // const base = {
            //     background: this.typeColors[tile.type] || '#ccc',
            //     width: '100%',
            //     aspectRatio: '1 / 1'
            // }
            const base = {
                background: this.areaColors[tile.area] || '#ccc',
                width: '100%',
                aspectRatio: '1 / 1'
            }



            // pulse for valid tiles
            //if (tile.validForSelection) {
                //base.animation = 'pulse 1s infinite'
                //base.background = 'gold'
                //return base
            //}

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
                    console.log(t)
                    if(t.area === "undeveloped") return t.validForSelection = false
                    if(t.ownerTeam === null) t.validForSelection = true
                })
            }

            if(this.currentType === 'bug') {
                this.tiles.forEach(t => {
                    if(t.area === "undeveloped") return t.validForSelection = false
                    if(t.ownerTeam !== null) return
                    const neighbors = this.getNeighbors(t)
                    const touchingGrass = neighbors.filter(n => n.type === 'grass')
                    if(touchingGrass.length >= 2) t.validForSelection = true
                })
            }

            if(this.currentType === 'animal') {
                this.tiles.forEach(t => {
                    if(t.area === "undeveloped") return t.validForSelection = false
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
        randomArea() {
            const list = ['forest', 'dirt']
            return list[Math.floor(Math.random() * list.length)]
        },
        generateTiles() {
                this.tiles = []
                let id = 1

                // blank map
                for (let r = 0; r < this.rows; r++) {
                        for (let c = 0; c < this.cols; c++) {
                                this.tiles.push({
                                        id: id++,
                                        row: r,
                                        col: c,
                                        type: 'none',
                                        selected: false,
                                        ownerTeam: null,
                                        area: null
                                })
                        }
                }

                // oceans and rivers
                this.makeOcean()
                this.makeRivers(3)

                // --- Create town clusters ---
                const townSeeds = 8  // increase for larger towns
                for (let i = 0; i < townSeeds; i++) {
                        const r = Math.floor(Math.random() * this.rows)
                        const c = Math.floor(Math.random() * this.cols)
                        const tile = this.tiles.find(t => t.row === r && t.col === c)
                        if (!tile || tile.area) continue
                        tile.area = 'town'
                }

                // Expand towns more aggressively
                for (let i = 0; i < 400; i++) {
                        const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)]
                        if (tile.area !== 'town') continue
                        
                        const neighbors = this.getNeighbors(tile)
                        neighbors.forEach(n => {
                                if (!n.area && Math.random() < 0.75) {  
                                        n.area = 'town'
                                }
                        })
                }

                // seeds for other land areas
                const seedCount = 12
                for (let i = 0; i < seedCount; i++) {
                        const r = Math.floor(Math.random() * this.rows)
                        const c = Math.floor(Math.random() * this.cols)
                        const tile = this.tiles.find(t => t.row === r && t.col === c)
                        if (!tile || tile.area) continue
                        tile.area = this.randomArea()
                }

                // expand land areas
                for (let i = 0; i < 300; i++) {
                        const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)]
                        if (!tile.area || tile.area === 'sea' || tile.area === 'river') continue
                        const neighbors = this.getNeighbors(tile)
                        neighbors.forEach(n => {
                                if (!n.area && Math.random() < 0.6) n.area = tile.area
                        })
                }

                // leftover / undeveloped tiles
                this.tiles.forEach(t => {
                        if (!t.area) {
                                // ~1 in 7.5 tiles becomes undeveloped
                                if (Math.random() < 1/8) {
                                        t.area = 'undeveloped'
                                } else {
                                        t.area = this.randomArea()
                                }
                        }
                })
        },
        setArea(r, c, area) {
            const t = this.tiles.find(t => t.row === r && t.col === c)
            if (t) t.area = area
        },
        makeRivers(count = 2) {
                for (let r = 0; r < count; r++) {
                        // pick random start edge: top, bottom, left, right
                        const edges = ['top', 'bottom', 'left', 'right']
                        const startEdge = edges[Math.floor(Math.random() * edges.length)]
                        let row, col

                        switch(startEdge) {
                                case 'top':
                                        row = 0
                                        col = Math.floor(Math.random() * this.cols)
                                        break
                                case 'bottom':
                                        row = this.rows - 1
                                        col = Math.floor(Math.random() * this.cols)
                                        break
                                case 'left':
                                        row = Math.floor(Math.random() * this.rows)
                                        col = 0
                                        break
                                case 'right':
                                        row = Math.floor(Math.random() * this.rows)
                                        col = this.cols - 1
                                        break
                        }

                        // random walk until reaching opposite side or map edge
                        const maxSteps = this.rows * this.cols
                        let steps = 0

                        while (steps < maxSteps) {
                                this.setArea(row, col, 'river')

                                // random direction: up/down/left/right
                                const dirs = []
                                if (row > 0) dirs.push([-1, 0])
                                if (row < this.rows - 1) dirs.push([1, 0])
                                if (col > 0) dirs.push([0, -1])
                                if (col < this.cols - 1) dirs.push([0, 1])

                                const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)]
                                row += dr
                                col += dc

                                steps++

                                // stop early if river hits ocean
                                const tile = this.tiles.find(t => t.row === row && t.col === col)
                                if (tile && tile.area === 'sea') break
                        }
                }
        },
        makeOcean() {
                const edges = ['top', 'bottom', 'left', 'right']

                // pick 1–4 edges randomly
                const oceanEdges = edges.filter(() => Math.random() < 0.5)
                if (oceanEdges.length === 0) oceanEdges.push(edges[Math.floor(Math.random() * edges.length)])

                const seeds = []

                oceanEdges.forEach(edge => {
                        let positions = []
                        if (edge === 'top') positions = Array.from({length: this.cols}, (_, i) => ({row: 0, col: i}))
                        if (edge === 'bottom') positions = Array.from({length: this.cols}, (_, i) => ({row: this.rows - 1, col: i}))
                        if (edge === 'left') positions = Array.from({length: this.rows}, (_, i) => ({row: i, col: 0}))
                        if (edge === 'right') positions = Array.from({length: this.rows}, (_, i) => ({row: i, col: this.cols - 1}))

                        const count = Math.max(3, Math.floor(Math.random() * positions.length * 0.5)) // bigger starting ocean
                        for (let i = 0; i < count; i++) {
                                const p = positions[Math.floor(Math.random() * positions.length)]
                                seeds.push(p)
                                this.setArea(p.row, p.col, 'sea')
                        }
                })

                // expand ocean inward more aggressively
                for (let i = 0; i < 800; i++) {  // more iterations = bigger ocean blobs
                        const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)]
                        if (tile.area !== 'sea') continue

                        const neighbors = this.getNeighbors(tile)
                        neighbors.forEach(n => {
                                if (!n.area && Math.random() < 0.8) {  // 50% chance to expand
                                        n.area = 'sea'
                                }
                        })
                }
        },
        makeTowns(count = 4) {
                const townSeeds = []

                // 1. pick random town center seeds
                for (let i = 0; i < count; i++) {
                        let tile = null

                        // avoid water
                        while (!tile || tile.area === 'sea' || tile.area === 'river') {
                                tile = this.tiles[Math.floor(Math.random() * this.tiles.length)]
                        }

                        tile.area = 'town'
                        townSeeds.push(tile)
                }

                // 2. town expansion
                for (let i = 0; i < 300; i++) {
                        const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)]
                        if (tile.area !== 'town') continue

                        const neighbors = this.getNeighbors(tile)
                        neighbors.forEach(n => {
                                if (n.area === null || n.area === 'forest' || n.area === 'dirt') {
                                        if (Math.random() < 0.4) {
                                                n.area = 'town'
                                        }
                                }
                        })
                }
        },

        // initializeHands() {
        //     this.players.forEach(player => {
        //         this.hands[player.id] = [
        //             // ...this.buildSortedHand(this.landAreaCards),
        //             // ...this.buildSortedHand(this.waterAreaCards)
        //             ...this.buildSortedHand(this.allCards)
        //         ];

        //     });
        // },
        shuffleArray(array) {
            const arr = array.slice();
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },

        buildDeck(cardDefs) {
            return cardDefs.flatMap(card => {
                return Array.from({ length: card.count }, (_, index) => ({
                    id: card.id,
                    label: card.label,
                    area: card.area,
                    tier: card.tier,
                    // optional: unique instance id
                    instanceId: `${card.id}-${index}`
                }));
            });
        },


        initializeHands() {
             const deck = this.shuffleArray(
                this.buildDeck(this.allCards)
            );

            console.log("Shuffled Deck:", deck);

            const playerCount = this.players.length;
            const cardsPerPlayer = Math.floor(deck.length / playerCount);

            this.players.forEach((player, index) => {
                this.hands[player.id] = deck.slice(
                    index * cardsPerPlayer,
                    (index + 1) * cardsPerPlayer
                );
            });
        },

        // buildSortedHand(cardDefs) {
        //     // tier昇順 → label順
        //     return cardDefs
        //         .slice()
        //         .sort((a, b) => {
        //             if (a.tier !== b.tier) {
        //                 return a.tier - b.tier;
        //             }
        //             return a.label.localeCompare(b.label, 'ja');
        //         })
        //         .map(card => ({
        //                     id: card.id,
        //             label: card.label,
        //             tier: card.tier,
        //             count: card.count,
        //             area: card.area   // ← これ重要
        //         }));
        // },
        areaBadgeClass(area) {
            switch (area) {
                case 'land':
                    return 'bg-[#D7B899] text-[#6B4E2E] border-[#C5A57E]';
                case 'water':
                    return 'bg-[#9ECAD6] text-[#355F6B] border-[#7FB3C8]';
                default:
                    return 'bg-slate-100 text-slate-700 border-slate-300';
            }
        },

        sortHandByArea(hand) {
            return hand?.slice().sort((a, b) => {
                // area
                if (a.area !== b.area) {
                    return a.area.localeCompare(b.area, 'ja');
                }

                // tier
                if (a.tier !== b.tier) {
                    return a.tier - b.tier;
                }

                // label
                return a.label.localeCompare(b.label, 'ja');
            });
        },
        compressHand(sortedHand) {
            if(!sortedHand) return [];
            const map = new Map();

            sortedHand?.forEach(card => {
                const key = card.label;

                if (!map.has(key)) {
                    map.set(key, {
                        ...card,
                        holdingCount: 1,
                    });
                } else {
                    map.get(key).holdingCount++;
                }
            });

            return Array.from(map.values());
        },
        getDisplayHand(hand) {
            if(!hand) return [];
            return this.compressHand(
                this.sortHandByArea(hand)
            );
        },



    },
    mounted() {
        console.clear()

        this.initializeHands();

        // set the first player as the current player on mount
        if (this.players.length > 0) {
            this.currentPlayer = this.players[0].id
        }
        
        this.generateTiles();
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
