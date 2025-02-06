<template>

    <div v-if="!selectGame" class="p-6 bg-white rounded-lg shadow-lg text-center">
      <h1 class="text-2xl font-bold mb-4">ゲームを選んでください</h1>
      <div class="space-x-4">
          <button 
              @click="selectGame = 'ゴミ分別ゲーム'" 
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              ゴミ分別ゲーム
          </button>
          <button 
              @click="selectGame ='神経衰弱ゲーム'" 
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              神経衰弱ゲーム
          </button>
      </div>
    </div>
  
    <sortingGame v-if="selectGame == 'ゴミ分別ゲーム'"></sortingGame>
    <shinkeiGame v-if="selectGame == '神経衰弱ゲーム'"></shinkeiGame>
  
  </template>
  
  <script setup>
  
  import sortingGame from "./components/sortingGame.vue";
  import shinkeiGame from "./components/shinkeiGame.vue";
  
  import { ref} from "vue";
  const selectGame = ref(null)
  
  </script>