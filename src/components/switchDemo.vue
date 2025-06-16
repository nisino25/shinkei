<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
      
      <!-- スタート画面 -->
      <div v-if="step === 'start'" class="space-y-4">
        <h1 class="text-2xl font-bold text-center">チャットルーム</h1>
        <button @click="step = 'create'" class="w-full bg-blue-500 text-white py-2 rounded">ルームを作成</button>
        <button @click="step = 'join'" class="w-full bg-green-500 text-white py-2 rounded">ルームに参加</button>
      </div>

      <!-- ルーム作成 -->
      <div v-else-if="step === 'create'" class="space-y-4">
        <h2 class="text-lg font-semibold text-center">ユーザー名を入力してください</h2>
        <input v-model="username" type="text" class="w-full p-2 border rounded" placeholder="例：なまえ" />
        <button @click="createRoom" class="w-full bg-blue-500 text-white py-2 rounded">ルーム作成</button>
        <button @click="step = 'start'" class="text-sm text-gray-500">← 戻る</button>
      </div>

      <!-- ルーム参加 -->
      <div v-else-if="step === 'join'" class="space-y-4">
        <h2 class="text-lg font-semibold text-center">ユーザー名とルーム番号を入力</h2>
        <input v-model="username" type="text" class="w-full p-2 border rounded" placeholder="例：べっか" />
        <input v-model="joinCode" maxlength="5" class="w-full p-2 border rounded" placeholder="ルーム番号（5桁）" />
        <button @click="joinRoom" class="w-full bg-green-500 text-white py-2 rounded">参加する</button>
        <button @click="step = 'start'" class="text-sm text-gray-500">← 戻る</button>
      </div>

      <!-- チャット画面 -->
      <div v-else-if="step === 'lightSwitch'">
        <h2 class="text-xl font-bold text-center mb-2">ルーム: {{ roomId }}</h2>
        <div class="h-64 overflow-y-auto bg-gray-100 rounded p-2 space-y-1 mb-3">
          <!-- <div v-for="(msg, i) in switchInfo" :key="i" class="bg-white px-3 py-1 rounded shadow text-sm">
            <span class="font-bold">{{ msg.name }}：</span>{{ msg.text }}
          </div> -->
          <div class="switch-container flex justify-between border" v-if="switchInfo.length && switchInfo[switchInfo.length - 1].switchInfo">
            <template v-for="(item,index) in switchInfo[switchInfo.length - 1].switchInfo.data" :key="index">
              <button class="switch-button" :style="{background: item.color}" :class="item.state" @click="toggleSwitch(index)">
                click me
              </button>
            </template>
          </div>

        </div>
        <div class="flex">
          <input v-model="newMessage" @keyup.enter="sendSwitchInfo" class="flex-1 p-2 border rounded-l" placeholder="メッセージを入力..." />
          <button @click="sendSwitchInfo" class="bg-blue-500 text-white px-4 py-2 rounded-r">送信</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { userData } from '@/stores/userData';
const store = userData();

import { ref as vueRef } from 'vue'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import db from '../firebase.js'

const step = vueRef("start") // 'start' | 'create' | 'join' | 'chat'
const username = vueRef(store.currentUsername) || vueRef("")
const roomId = vueRef("")
const joinCode = vueRef("")
const switchInfo = vueRef([])
const newMessage = vueRef("")

let unsub = null // for onSnapshot unsubscribe

async function createRoom() {
  if (!username.value) return alert("ユーザー名を入力してください")
  roomId.value = Math.floor(10000 + Math.random() * 90000).toString();

  const roomRef = doc(db, "rooms", roomId.value)
  const switchInfoRef = collection(roomRef, "switchInfo")

  const baseInfo = [
    {color: "red", state: "inactive"},
    {color: "green", state: "inactive"},
    {color: "blue", state: "inactive"},
    {color: "yellow", state: "inactive"}
  ]

  // create empty room document + initial system message
  await setDoc(roomRef, { createdAt: Date.now() })
  await addDoc(switchInfoRef, {
    name: "システム",
    switchInfo: { data: baseInfo },
    createdAt: Date.now()
  })

  listenToSwitchInfo(roomId.value)

  step.value = "lightSwitch"
}

async function joinRoom() {
  if (!username.value || joinCode.value.length !== 5) {
    alert("ユーザー名と5桁のルーム番号を入力してください")
    return
  }

  const roomRef = doc(db, "rooms", joinCode.value)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) {
    alert("そのルームは存在しません")
    return
  }

  roomId.value = joinCode.value
  listenToSwitchInfo(roomId.value)
  step.value = "lightSwitch"
}

function listenToSwitchInfo(roomId) {
  const switchInfoRef = collection(db, "rooms", roomId, "switchInfo")
  const q = query(switchInfoRef, orderBy("createdAt"))

  // cleanup old listener if any
  if (unsub) unsub()

  unsub = onSnapshot(q, snapshot => {
    switchInfo.value = snapshot.docs.map(doc => doc.data());
  })

  console.log(switchInfo.value);
}

async function sendSwitchInfo() {
  if (!newMessage.value.trim()) return

  const switchInfoRef = collection(db, "rooms", roomId.value, "switchInfo")
  await addDoc(switchInfoRef, {
    name: username.value,
    text: newMessage.value,
    createdAt: Date.now()
  })
  newMessage.value = ""
}

async function toggleSwitch(index) {
    // 最新の switchInfo（履歴の一番最後）
    const latestEntry = switchInfo.value[switchInfo.value.length - 1];

    if (!latestEntry || !latestEntry.switchInfo || !latestEntry.switchInfo.data) {
        console.error("switchInfo data is not available yet.");
        return;
    }

    // ボタン情報の配列（状態を更新する用）
    const latestSwitchData = latestEntry.switchInfo.data;

    // 新しい状態を作成（元を直接いじらずにコピー）
    const updated = latestSwitchData.map((item, i) => ({
        ...item,
        state: i === index
            ? item.state === "inactive" ? "active" : "inactive"
            : item.state
    }));

    // Firestore に新しい状態として push
    const switchInfoRef = collection(db, "rooms", roomId.value, "switchInfo");
    await addDoc(switchInfoRef, {
        name: username.value,
        switchInfo: { data: updated },
        createdAt: Date.now()
    });

    // 入力欄リセット（必要に応じて）
    newMessage.value = "";
}

</script>

<style>
  .switch-button{
    transition: all .5s ease-in-out;
  }
  .active{
    opacity: 1;
  }

  .inactive{
    opacity: .5;
  }
</style>
