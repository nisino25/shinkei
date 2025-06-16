<template>

    <div v-if="!loading" style="display: block; margin: 12.5px auto; text-align: center; font-size: .9em; padding: 0 1em;" >

      <div style="display: flex; justify-content: space-between; width: 100%;font-weight: bold; margin-bottom: 5px; align-items: center;">
        <button class="text-sm" @click="goBackBtn()">戻る</button>
        <p style="font-size: .75em;" v-if="uniqueId">
          ようこそ!&nbsp;<strong>{{ currentUsername }}</strong>さん<br>
        </p>
        <span style="pointer-events: none;" v-if="uniqueId">
          合計得点: <strong style="color: goldenrod;">{{ currentTotalPoints ? currentTotalPoints : 0 }}</strong>
        </span>
      </div>
      <span style="font-weight: bold; color: DarkOrange; font-size: .8em;" v-if="uniqueId && !selectGame">
        <s>合計100点で景品をゲット!(先着３名)</s><br>
        次のイベントをお楽しみに！
      </span>
      <hr>

    </div>

    <div v-if="!selectGame" class="p-6 bg-white rounded-lg shadow-lg text-center">
      <h1 class="text-2xl font-bold mb-4">ゲームを選んでください</h1>
      <div class="space-x-4">
          <button 
              @click="selectGame = 'ゴミ分別ゲーム'" 
              class="px-4 py-2 bg-blue-500 text-white rounded-lg">
              ゴミ分別ゲーム
          </button>
          <button 
              @click="selectGame ='神経衰弱ゲーム'" 
              class="px-4 py-2 bg-green-500 text-white rounded-lg">
              神経衰弱ゲーム
          </button>
          <button v-if="isTesting" 
              @click="selectGame ='チャット'" 
              class="px-4 py-2 bg-blue-500 text-white rounded-lg">
              チャット
          </button>
          <button v-if="isTesting" 
              @click="selectGame ='スイッチ'" 
              class="px-4 py-2 bg-red-500 text-white rounded-lg">
              スイッチ
          </button>
      </div>
    </div>
  
    <sortingGame v-if="selectGame == 'ゴミ分別ゲーム'"></sortingGame>
    <shinkeiGame v-if="selectGame == '神経衰弱ゲーム'"></shinkeiGame>
    <chatDemo v-if="selectGame == 'チャット'"></chatDemo>
    <switchDemo v-if="selectGame == 'スイッチ'"></switchDemo>
  
  </template>
  
  <script setup>

  import { userData } from '@/stores/userData';
  import { storeToRefs } from 'pinia';
  
  import sortingGame from "./components/sortingGame.vue";
  import shinkeiGame from "./components/shinkeiGame.vue";
  import chatDemo from "./components/chatDemo.vue";
  import switchDemo from "./components/switchDemo.vue";

  const isTesting = ref(false);  
  
  // const { gamePoint, selectGame } = storeToRefs(store); // Correct way to access state
  
  import { onMounted, ref } from "vue";
  
  const store = userData();
  const { selectGame, uniqueId, currentUsername, currentTotalPoints, hasPointsReached, loading, computedHref } = storeToRefs(store);

  const goBackBtn = () => {
    if(store.selectGame) return store.selectGame = null;

    if(store.currentUsername) return window.location = `https://www.ce-n.org/hui-yuan-purohuiru/${store.uniqueId}`

    window.location = 'https://www.ce-n.org/'
  };

  onMounted(async () => {
    console.clear();

    const urlParams = new URLSearchParams(window.location.search);
    const isTestingParam = urlParams.get("isTesting");

    if (isTestingParam == 1) isTesting.value = true;

    const id = urlParams.get("uniqueId");

    if (!id) {
      loading.value = false;
      return;
    }

    store.uniqueId = id; // Save uniqueId in Pinia

    try {
      const URL = `https://www.ce-n.org/_functions/findMe?id=${id}`;
      console.log("Fetching:", URL);

      const response = await fetch(URL);
      const result = await response.json();

      if (result.message) {
        console.log("Not found");
        store.setUniqueId(null);
      } else {
        store.uniqueId = null;


        // Update all necessary values in Pinia
        store.uniqueId = id;
        store.currentUsername = result.text4 || "Unknown";
        store.currentTotalPoints = result.totalPoints || 0;
        store.hasPointsReached = result.hasPointsReached || false;
        store.computedHref = `https://www.ce-n.org/hui-yuan-purohuiru/${id}`;

        console.log(computedHref,hasPointsReached)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      loading.value = false;
    }
  });
</script>
<style>
html{
  
}
</style>