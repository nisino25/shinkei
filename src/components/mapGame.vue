<template>
    <div class="max-w-5xl mx-auto p-4">
        <header class="mb-3 flex items-center justify-between">
            <h1 class="text-xl font-bold">北海道 すごろく（クリックで開拓）</h1>
            <button class="px-3 py-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100" @click="resetAll">
                初期化
            </button>
        </header>

        <div class="bg-white rounded-2xl p-3 shadow">
            <div class="mb-2 text-sm text-slate-600">
                Active: <b>{{ activeCount }}</b> / {{ tiles.length }}
                <span v-if="activeCount === 0" class="ml-1 text-emerald-700">(最初はどこでもOK)</span>
            </div>

            <svg viewBox="0 0 100 100" class="w-full h-auto select-none">
                <!-- outline (friendly blob style) -->
                <polygon
                    :points="polygonStr"
                    fill="none"
                    stroke="#64748b"
                    stroke-width="0.7"
                    stroke-linejoin="round"
                />
                <!-- small islands (outline only; non-clickable) -->
                <!-- <g fill="none" stroke="#94a3b8" stroke-width="0.5">
                    <circle v-for="(is, i) in islands" :key="i" :cx="is[0]" :cy="is[1]" :r="is[2]" />
                </g> -->

                <!-- tiles -->
                <g>
                    <rect
                        v-for="t in tiles"
                        :key="t.key"
                        :x="t.x"
                        :y="t.y"
                        :width="cellW"
                        :height="cellH"
                        rx="1" ry="1"
                        :fill="t.active ? '#22c55e' : '#e2e8f0'"
                        :stroke="strokeColor(t)"
                        stroke-width="0.35"
                        class="cursor-pointer"
                        :style="{ opacity: isClickable(t) || t.active ? 1 : 0.55 }"
                        @click="toggle(t)"
                    />
                </g>
            </svg>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

/**
 * Rounded Hokkaidō silhouette (0..100)
 * blobスタイル（宗谷の尖りをなだらかに／知床・根室・渡島を丸く）
 */
// REPLACE the polygon with this one
// smoother, friendlier Hokkaidō (clockwise, 0..100 coords)
// cleaner, more Hokkaido-ish (clockwise; viewBox 0..100)
const polygon = ref([
        // Sōya–Wakkanai ridge (rounded)
        [38,12],[41,11],[53,30],
        [60,30],[64,24],[66,26],[62,32],[64,35],[68,36],[69,38],[58,42],
        [56,39],[40,53],[30,42],
        [26,45],[23,43],
]);

const polygonStr = computed(() =>
        polygon.value.map(p => p.join(',')).join(' ')
);

/** tiny islands (outline only) — Rishiri/Rebun & Teuri/Yagishiri + tiny SW islet */
// const islands = ref([
//     [39, 18, 1.2], [41.5, 14.5, 1.4],  // 礼文/利尻あたり
//     [26, 30, 0.8], [28, 28, 0.8],      // 天売/焼尻あたり
//     [14, 78, 1.2],                      // 渡島小島っぽい
// ]);

/** fixed density (no UI) */
const cols = ref(24);                  // 調整なし
const cellW = computed(() => 100 / cols.value);
const cellH = computed(() => 100 / Math.round(cols.value * 0.8));
const rows  = computed(() => Math.round(100 / cellH.value));

/** point-in-polygon */
function insidePolygon(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-6) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/** build tiles only inside main island polygon */
const tiles = ref([]);
function buildTiles() {
    const list = [];
    const cw = cellW.value, ch = cellH.value;
    let id = 0;
    for (let r = 0; r < rows.value; r++) {
        for (let c = 0; c < cols.value; c++) {
            const x = c * cw, y = r * ch;
            const cx = x + cw / 2, cy = y + ch / 2;
            if (insidePolygon(cx, cy, polygon.value)) {
                list.push({ key: `t${id++}`, r, c, x, y, active: false });
            }
        }
    }
    tiles.value = list;
}

/** connectivity rule */
const activeCount = computed(() => tiles.value.filter(t => t.active).length);

function getTileAt(r, c) {
    return tiles.value.find(t => t.r === r && t.c === c);
}
function hasActiveNeighbor(t) {
    const n1 = getTileAt(t.r - 1, t.c);
    const n2 = getTileAt(t.r + 1, t.c);
    const n3 = getTileAt(t.r, t.c - 1);
    const n4 = getTileAt(t.r, t.c + 1);
    return [n1, n2, n3, n4].some(n => n?.active);
}
function isClickable(t) {
    if (t.active) return true;               // オフはいつでもOK
    if (activeCount.value === 0) return true; // 最初の1マスは自由
    return hasActiveNeighbor(t);             // 以降は連結必須
}
function strokeColor(t) {
    if (t.active) return '#16a34a';
    return isClickable(t) ? '#94a3b8' : '#cbd5e1';
}
function toggle(t) {
    if (!t.active) {
        if (!isClickable(t)) return;
        t.active = true;
    } else {
        t.active = false;
    }
    persist();
}

/** persistence */
const LS_KEY = 'hokkaido_momo_blob_v1';
function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(tiles.value.map(t => ({ r: t.r, c: t.c, active: t.active }))));
}
function restore() {
    buildTiles();
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
        const data = JSON.parse(raw);
        for (const saved of data) {
            const t = getTileAt(saved.r, saved.c);
            if (t) t.active = !!saved.active;
        }
}

onMounted(restore);
</script>

<style scoped>
/* Tailwind handles the visuals */
</style>
