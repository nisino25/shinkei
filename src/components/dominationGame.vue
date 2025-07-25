<template>
  <div class="p-6 bg-yellow-100 min-h-screen text-gray-800">
    <h2 class="text-2xl font-bold mb-4">ドミネーションバトル</h2>

    <p class="mb-4 text-lg font-semibold">
      🧠 {{ currentPlayer === 'red' ? '🔴赤のターン' : '🔵青のターン' }}
    </p>

    <!-- ボード -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(area, areaIndex) in areas"
        :key="areaIndex"
        class="p-4 border-2 rounded-lg shadow"
        :class="{
          'border-red-500 bg-red-100': area.lockedBy === 'red',
          'border-blue-500 bg-blue-100': area.lockedBy === 'blue'
        }"
      >
        <h3 class="text-sm font-bold mb-2">エリア {{ areaIndex + 1 }}</h3>
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="(tile, tileIndex) in area.tiles"
            :key="tileIndex"
            class="h-12 w-12 flex items-center justify-center rounded-md text-xl font-bold cursor-pointer transition-all"
            :class="[
              tile.owner === 'red' ? 'bg-red-300' : '',
              tile.owner === 'blue' ? 'bg-blue-300' : '',
              area.lockedBy ? 'pointer-events-none' : 'hover:bg-green-200 bg-gray-200'
            ]"
            @click="handleTileClick(areaIndex, tileIndex)"
          >
            {{ getTileEmoji(tile.type) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 勝者表示 -->
    <div v-if="winner" class="mt-8 text-2xl font-bold text-center text-green-700">
      🎉 {{ winner === 'red' ? '🔴赤' : '🔵青' }} が3エリア制覇！勝利！！
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// 定義
// const TILE_TYPES = ['空', '植物', '昆虫', '動物']

// 各エリアの状態
const areas = reactive(
  Array.from({ length: 5 }, () => ({
    lockedBy: null,
    tiles: Array.from({ length: 9 }, () => ({
      type: '空',
      owner: null
    }))
  }))
)

const currentPlayer = ref('red')
const winner = ref(null)

// 絵文字取得
function getTileEmoji(type) {
  return {
    '空': '',
    '植物': '🌱',
    '昆虫': '🐛',
    '動物': '🦊'
  }[type]
}

// クリック時の処理
function handleTileClick(areaIdx, tileIdx) {
  if (winner.value) return

  const area = areas[areaIdx]
  if (area.lockedBy) return

  const tile = area.tiles[tileIdx]
  if (tile.type !== '空') return

  // 次に置くべきタイルを判定
  const tileToPlace = decideNextTile(area, currentPlayer.value)

  // タイル配置
  tile.type = tileToPlace
  tile.owner = currentPlayer.value

  // 動物ならエリアロック
  if (tileToPlace === '動物') {
    lockArea(area, currentPlayer.value)
  }

  // 勝利判定
  const winCount = areas.filter(a => a.lockedBy === currentPlayer.value).length
  if (winCount >= 3) {
    winner.value = currentPlayer.value
  }

  // ターン交代
  currentPlayer.value = currentPlayer.value === 'red' ? 'blue' : 'red'
}

// 次のタイルの種類を判定（進化ロジック）
function decideNextTile(area, player) {
  const plants = area.tiles.filter(t => t.owner === player && t.type === '植物').length
  const bugs = area.tiles.filter(t => t.owner === player && t.type === '昆虫').length

  if (bugs >= 2) return '動物'
  if (plants >= 2) return '昆虫'
  return '植物'
}

// エリア制圧処理
function lockArea(area, player) {
  area.lockedBy = player
  area.tiles.forEach(tile => {
    tile.owner = player
    // if (tile.type === '空') tile.type = '植物'
  })
}
</script>

<style scoped>
/* Tailwindでスタイル済みなので必要なければ空でOK */
</style>
