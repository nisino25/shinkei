<template>
  <div class="max-w-5xl mx-auto py-4">
    <div class="wrap">
      <canvas ref="canvasEl"></canvas>
      <!-- Controller overlay -->
        <div class="absolute bottom-6 left-6 flex space-x-2">
        <!-- D-Pad -->
        <div class="grid grid-cols-3 gap-1">
            <div></div>
            <button class="w-12 h-12 bg-gray-700/70 text-white rounded"
                    @touchstart.prevent="press('w')" @touchend.prevent="release('w')">▲</button>
            <div></div>
            <button class="w-12 h-12 bg-gray-700/70 text-white rounded"
                    @touchstart.prevent="press('a')" @touchend.prevent="release('a')">◀</button>
            <button class="w-12 h-12 bg-gray-700/70 text-white rounded"
                    @touchstart.prevent="press('s')" @touchend.prevent="release('s')">▼</button>
            <button class="w-12 h-12 bg-gray-700/70 text-white rounded"
                    @touchstart.prevent="press('d')" @touchend.prevent="release('d')">▶</button>
        </div>
        </div>

        <!-- Action buttons -->
        <div class="absolute bottom-6 right-6 flex space-x-3">
        <button class="w-20 h-20 bg-blue-600/80 text-white font-bold rounded-full shadow"
                @touchstart.prevent="press('e')" @touchend.prevent="release('e')">話す</button>
        <button class="w-20 h-20 bg-red-600/80 text-white font-bold rounded-full shadow"
                @touchstart.prevent="press('r')" @touchend.prevent="release('r')">リセット</button>
        </div>

        <!-- Modal -->
<!-- Modal -->
<div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-5xl w-full text-center overflow-auto">
        
        <!-- Header -->
        <h2 class="text-2xl font-bold mb-4">🚪 Monitor Room</h2>
        
        <!-- Layout: top mini-map, then news + status + players -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Left Column: Mini Map + News -->
            <div class="space-y-4">
                
                <!-- Mini-map -->
                <div>
                    <h3 class="text-lg font-semibold mb-2">🗺️ Mini Map</h3>
                    <div class="bg-gray-100 p-2 rounded-lg flex justify-center">
                        <div class="grid grid-cols-10 grid-rows-5 gap-0.5">
                            <div v-for="(tile, index) in miniMap" :key="index"
                                :class="[
                                    'w-6 h-6 border',
                                    tile === '#' ? 'bg-gray-800' :
                                    tile === '.' ? 'bg-green-200' :
                                    tile === 'x' ? 'bg-yellow-400' : 'bg-white'
                                ]">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Latest News -->
                <div>
                    <h3 class="text-lg font-semibold mb-2">📰 最新ニュース</h3>
                    <ul class="text-left list-disc list-inside bg-gray-50 p-2 rounded-lg max-h-32 overflow-auto">
                        <li v-for="(news, idx) in latestNews" :key="idx">{{ news }}</li>
                    </ul>
                </div>
            </div>
            
            <!-- Right Column: Livestock + Active Players -->
            <div class="space-y-4">

                <!-- Animal / Livestock Status -->
                <div>
                    <h3 class="text-lg font-semibold mb-2">🐄 動物の状況</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="bg-gray-100 p-2 rounded-lg shadow">
                            <p>牛: {{ livestock.cows }} 頭</p>
                            <p>健康: {{ livestock.cowHealthy }} 頭</p>
                            <p>病気: {{ livestock.cowSick }} 頭</p>
                        </div>
                        <div class="bg-gray-100 p-2 rounded-lg shadow">
                            <p>羊: {{ livestock.sheep }} 頭</p>
                            <p>健康: {{ livestock.sheepHealthy }} 頭</p>
                            <p>病気: {{ livestock.sheepSick }} 頭</p>
                        </div>
                        <div class="bg-gray-100 p-2 rounded-lg shadow">
                            <p>鶏: {{ livestock.chickens }} 羽</p>
                            <p>健康: {{ livestock.chickenHealthy }} 羽</p>
                            <p>病気: {{ livestock.chickenSick }} 羽</p>
                        </div>
                    </div>
                </div>

                <!-- Active Players -->
                <div>
                    <h3 class="text-lg font-semibold mb-2">🎮 アクティブプレイヤー</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div v-for="(p, idx) in activePlayers" :key="idx"
                             class="bg-gray-100 p-2 rounded-lg shadow flex justify-between">
                            <span>{{ p.name }}</span>
                            <span>{{ p.score }} pts</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>

        <!-- Close Button -->
        <div class="mt-6 flex justify-center">
            <button class="px-6 py-2 bg-blue-600 text-white rounded-lg shadow" @click="showModal = false">閉じる</button>
        </div>
    </div>
</div>



    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from "vue";

    const canvasEl = ref(null);
    let canvas, ctx;

    // import { ref } from "vue";

    const showModal = ref(false);


   


        const TILE = 32;
        // const VIEW_W = 640;
        // const VIEW_H = 480;
        let VIEW_W = window.innerWidth;
        let VIEW_H = 480;
        // let VIEW_H = window.innerHeight;

        const MAP_ROWS = [
            "##################x#####################################",
            "#...........C..............####...........C.............#",
            "#..#####.............####......####.....................#",
            "#..#...#.............#..#..........#...................#",
            "#..#...##########....#..#..N.......#.............#####..#",
            "#..#.................#..#..........##............#...#..#",
            "#..#########..########..############.............#.C.#..#",
            "#................................................#...#..#",
            "#......C.........................C................#####..#",
            "#.......................................................#",
            "########################################################",
        ];

        const mapH = MAP_ROWS.length;
        const mapW = MAP_ROWS[0].length;

        

        const coins = [];
        let npc = null;

        for (let r = 0; r < mapH; r++) {
            for (let c = 0; c < mapW; c++) {
                const ch = MAP_ROWS[r][c];
                if (ch === 'C') coins.push({ x: (c + 0.5) * TILE, y: (r + 0.5) * TILE, taken: false });
                if (ch === 'N') npc = { x: (c + 0.5) * TILE, y: (r + 0.5) * TILE };
            }
        }

        const fireImg = new Image();
        // fireImg.src = "./src/fire_animation.png";
        fireImg.src = "../rpg-src/fire_animation.png";

        const fire = {
            frameIndex: 0,
            frameTimer: 0,
            frameDuration: 300,
            frameWidth: 64,
            frameHeight: 30,
            frames: 5,
            col: 0,
            x: 185,
            y: 225
        };

        // 1️⃣ Preload images with cols/rows info
        const floorImg = {
            img: new Image(),
            cols: 3,
            rows: 10
        };
        // floorImg.img.src = "./src/decorative_cracks_floor.png";
        floorImg.img.src = "../rpg-src/decorative_cracks_floor.png";
        // fireImg.src = "../rpg-src/fire_animation.png";

        const wallImg = {
            img: new Image(),
            cols: 6,
            rows: 32
        };
        // wallImg.img.src = "./src/decorative_cracks_walls.png";
        wallImg.img.src = "../rpg-src/decorative_cracks_walls.png";

        const doorImg = {
            img: new Image(),
            cols: 5,
            rows: 6
        };
        // wallImg.img.src = "./src/decorative_cracks_walls.png";
        doorImg.img.src = "../rpg-src/doors_lever_chest_animation.png";

        const tileMap = {
            "#": { img: wallImg, tileX: 0, tileY: 0 },
            ".": { img: floorImg, tileX: 1, tileY: 9 },
            "x": { img: doorImg, tileX: 1, tileY: 1 },
            "C": { img: floorImg, tileX: 1, tileY: 9 },
            "N": { img: floorImg, tileX: 2, tileY: 0 }
        };


        const player = { x: 2.5*TILE, y: 2.5*TILE, w: TILE*0.6, h: TILE*0.6, speed: 300 };
        const camera = { x: 0, y: 0 };
        const keys = {};

        const onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; e.preventDefault(); };
        const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };

        function isWallAt(c,r){ return r<0||r>=mapH||c<0||c>=mapW||MAP_ROWS[r][c]==='#'; }
        function rectHitsWall(cx,cy,w,h){
            const hw=w/2, hh=h/2;
            const corners=[{x:cx-hw,y:cy-hh},{x:cx+hw,y:cy-hh},{x:cx-hw,y:cy+hh},{x:cx+hw,y:cy+hh}];
            return corners.some(p=>isWallAt(Math.floor(p.x/TILE),Math.floor(p.y/TILE)));
        }


        function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
        function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }

        // function resizeForDPR(){
        //     const dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
        //     canvas.style.width = VIEW_W + "px";
        //     canvas.style.height = VIEW_H + "px";
        //     canvas.width = VIEW_W*dpr;
        //     canvas.height = VIEW_H*dpr;
        //     ctx.setTransform(dpr,0,0,dpr,0,0);
        // }

        function resizeForDPR() {
            VIEW_W = window.innerWidth;
            //   VIEW_H = window.innerHeight;
            let VIEW_H = 480;

            const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

            canvas.style.width = VIEW_W + "px";
            canvas.style.height = VIEW_H + "px";
            canvas.width = VIEW_W * dpr;
            canvas.height = VIEW_H * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }


        const talk = { open:false, shownOnce:false, lines:["Welcome, traveler.","Collect coins and explore.","Come back later for more quests!"], i:0 };
        function resetGame(){ player.x=2.5*TILE; player.y=2.5*TILE; coins.forEach(c=>c.taken=false); talk.open=false; talk.shownOnce=false; }

        function update(dt){
            if(showModal.value) return;

            if(keys['r']) resetGame();
            let vx=0,vy=0;
            let movedFlag = false;
            if(keys['a']||keys['arrowleft']) {
                movedFlag = true;
                vx-=1;
            }
            if(keys['d']||keys['arrowright']) {
                movedFlag = true;
                vx+=1;
            } 
            if(keys['w']||keys['arrowup']){
                movedFlag = true;
                vy-=1;
            } 
            if(keys['s']||keys['arrowdown']) {
                movedFlag = true;
                vy+=1;
            } 
            if(vx!==0 && vy!==0){ const inv=1/Math.sqrt(2); vx*=inv; vy*=inv; }
            const nextX=player.x+vx*player.speed*dt;
            if(!rectHitsWall(nextX,player.y,player.w,player.h)) player.x=nextX;
            const nextY=player.y+vy*player.speed*dt;
            if(!rectHitsWall(player.x,nextY,player.w,player.h)) player.y=nextY;
            player.x=clamp(player.x, player.w*0.5,mapW*TILE-player.w*0.5);
            player.y=clamp(player.y, player.h*0.5,mapH*TILE-player.h*0.5);
            camera.x=clamp(player.x-VIEW_W/2,0,mapW*TILE-VIEW_W);
            camera.y=clamp(player.y-VIEW_H/2,0,mapH*TILE-VIEW_H);
            coins.forEach(c=>{ if(!c.taken && dist(player,c)<TILE*0.6) c.taken=true; });

            // 🔑 Door check here
            const playerCol = Math.floor(player.x / TILE);
            const playerRow = Math.floor(player.y / TILE);
            if (MAP_ROWS[playerRow] && MAP_ROWS[playerRow][playerCol] === "x"  && movedFlag) {
                showModal.value = true;
            }

            if(npc){
                const near=dist(player,npc)<TILE*1.2;
                if(near && keys['e'] && !talk.open){ talk.open=true; talk.i=0; talk.shownOnce=true; }
                else if(talk.open && keys['e']){ talk.i++; if(talk.i>=talk.lines.length) talk.open=false; }
            }

            // Fire animation
            fire.frameTimer += dt*1000;
            if(fire.frameTimer>fire.frameDuration){
                fire.frameIndex = (fire.frameIndex+1)%fire.frames;
                fire.frameTimer=0;
            }
        }


        function drawTile(col, row) {
            const ch = MAP_ROWS[row][col];
            const x = col * TILE - camera.x;
            const y = row * TILE - camera.y;

            const t = tileMap[ch];
            if (!t || !t.img.img.complete) return;

            const tileW = t.img.img.width / t.img.cols;
            const tileH = t.img.img.height / t.img.rows;

            ctx.drawImage(
                t.img.img,
                t.tileX * tileW,
                t.tileY * tileH,
                tileW,
                tileH,
                x,
                y,
                TILE,
                TILE
            );
        }

        const latestNews = ref([
            "ニュース1: 今日の天気は晴れです。",
            "ニュース2: 新しいイベントが始まりました。",
            "ニュース3: コインを集めるとボーナスがあります。"
        ]);

        const activePlayers = ref([
            { name: "Player1", score: 120 },
            { name: "Player2", score: 90 },
            { name: "Player3", score: 45 }
        ]);



        const livestock = ref({
        cows: 10,
        cowHealthy: 8,
        cowSick: 2,
        sheep: 15,
        sheepHealthy: 14,
        sheepSick: 1,
        chickens: 20,
        chickenHealthy: 19,
        chickenSick: 1
        });




        

        function render(){
            ctx.fillStyle="#0b1020";
            ctx.fillRect(0,0,VIEW_W,VIEW_H);

            const c0=Math.floor(camera.x/TILE), r0=Math.floor(camera.y/TILE);
            const c1=Math.ceil((camera.x+VIEW_W)/TILE), r1=Math.ceil((camera.y+VIEW_H)/TILE);
            for(let r=r0;r<r1;r++) for(let c=c0;c<c1;c++) if(r>=0&&r<mapH&&c>=0&&c<mapW) drawTile(c,r);

            coins.forEach(c=>{
                if(c.taken) return;
                ctx.beginPath();
                ctx.fillStyle="#facc15";
                ctx.arc(c.x-camera.x,c.y-camera.y,TILE*0.2,0,Math.PI*2);
                ctx.fill();
                ctx.strokeStyle="#f59e0b";
                ctx.lineWidth=2;
                ctx.stroke();
            });

            if(fireImg.complete){
                ctx.drawImage(fireImg, fire.col*fire.frameWidth, fire.frameIndex*fire.frameHeight, fire.frameWidth, fire.frameHeight, fire.x-camera.x, fire.y-camera.y, fire.frameWidth, fire.frameHeight);
            }

            if(npc){
                ctx.fillStyle="#ef4444";
                ctx.fillRect(npc.x-camera.x-TILE*0.3,npc.y-camera.y-TILE*0.35,TILE*0.6,TILE*0.7);
            }

            ctx.fillStyle="#60a5fa";
            ctx.fillRect(player.x-camera.x-player.w*0.5,player.y-camera.y-player.h*0.5,player.w,player.h);
        }

        let last=performance.now(), rafId=0;
        function loop(now){ const dt=Math.min(0.033,(now-last)/1000); last=now; update(dt); render(); rafId=requestAnimationFrame(loop); }

        onMounted(()=>{
            canvas = canvasEl.value;
            ctx = canvas.getContext("2d"); // ✅ now works
            canvas = canvasEl.value;
            
            resizeForDPR();
            window.addEventListener('resize', resizeForDPR);
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            requestAnimationFrame(loop);
        });

        onBeforeUnmount(()=>{
            window.removeEventListener('resize', resizeForDPR);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            if(rafId) cancelAnimationFrame(rafId);
        });


        function press(key) {
            keys[key] = true;
        }
        function release(key) {
            keys[key] = false;
        }


</script>

<style scoped>
/* Tailwind handles the visuals */
</style>
