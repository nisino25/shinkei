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

    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from "vue";

    const canvasEl = ref(null);
    let canvas, ctx;

    // import { ref } from "vue";

    const TILE = 32;
    // const VIEW_W = 640;
    // const VIEW_H = 480;
    let VIEW_W = 480;
    let VIEW_H = 480;
    // let VIEW_H = window.innerHeight;

    // const MAP_ROWS = [
    //     "##################x#####################################",
    //     "#...........C..............####...........C.............#",
    //     "#..#####.............####......####.....................#",
    //     "#..#...#.............#..#..........#...................#",
    //     "#..#...##########....#..#..N.......#.............#####..#",
    //     "#..#.................#..#..........##............#...#..#",
    //     "#..#########..########..############.............#.C.#..#",
    //     "#................................................#...#..#",
    //     "#......C.........................C................#####..#",
    //     "#.......................................................#",
    //     "########################################################",
    // ];
    const MAP_ROWS = [
        "#.################",
        "#.#..............#",
        "#.###.##########.#",
        "#...#.....#...C#.#",
        "###.#####.#.#.##.#",
        "#...#.....#.#....#",
        "#.#####.###.#.####",
        "#.#.C...#C#.#.#..#",
        "#.#####.#.###.##.#",
        "#.###...#........#",
        "#...#.##########.#",
        "###.#...#...##C#.#",
        "#.#.###.#.#.##.#.#",
        "#...#.#...#.##...#",
        "#.###.#.###.##.###",
        "#...#.#.#.C.##...#",
        "###C#.#.#.######.#",
        "#.#.#.#.#.#....#.#",
        "#.#.#.#.#.#.##.#.#",
        "#.#.#.#.#.#.##...#",
        "#.#.#...#.#.######",
        "#.#.#####.#.#.####",
        "#.........#.......",
        "##################",
    ]

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
        // ".": { img: floorImg, tileX: 1, tileY: 9 },
        "x": { img: doorImg, tileX: 1, tileY: 1 },
        "C": { img: floorImg, tileX: 20, tileY: 20 },
        "N": { img: floorImg, tileX: 2, tileY: 0 }
    };


    const player = { x: 1.5*TILE, y: 2.5*TILE, w: TILE*0.6, h: TILE*0.6, speed: 300 };
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

    function resizeForDPR() {
        // VIEW_W = window.innerWidth;
        //   VIEW_H = window.innerHeight;
        if(window.innerWidth < 600){
            VIEW_W = window.innerWidth;
            VIEW_H = window.innerHeight - 300;
        }else{
            VIEW_W = 500;
            VIEW_H = 480;
        }

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

        if(keys['r']) resetGame();
        let vx=0,vy=0;
        if(keys['a']||keys['arrowleft']) {
            vx-=1;
        }
        if(keys['d']||keys['arrowright']) {
            vx+=1;
        } 
        if(keys['w']||keys['arrowup']){
            vy-=1;
        } 
        if(keys['s']||keys['arrowdown']) {
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
        // const playerCol = Math.floor(player.x / TILE);
        // const playerRow = Math.floor(player.y / TILE);
        // if (MAP_ROWS[playerRow] && MAP_ROWS[playerRow][playerCol] === "x"  && movedFlag) {
        //     showModal.value = true;
        // }

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
    

    function render(){
        // ctx.fillStyle="#0b1020";
        ctx.fillStyle="#FDF6E3";
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

        // if(fireImg.complete){
        //     ctx.drawImage(fireImg, fire.col*fire.frameWidth, fire.frameIndex*fire.frameHeight, fire.frameWidth, fire.frameHeight, fire.x-camera.x, fire.y-camera.y, fire.frameWidth, fire.frameHeight);
        // }

        if(npc){
            ctx.fillStyle="#ef4444";
            ctx.fillRect(npc.x-camera.x-TILE*0.3,npc.y-camera.y-TILE*0.35,TILE*0.6,TILE*0.7);
        }

        ctx.fillStyle="#60a5fa";
        ctx.fillRect(
            player.x-camera.x-player.w*0.5,
            player.y-camera.y-player.h*0.5,
            player.w,player.h
        );
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
