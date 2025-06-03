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
      <div v-else-if="step === 'chat'">
        <h2 class="text-xl font-bold text-center mb-2">ルーム: {{ roomId }}</h2>
        <div class="h-64 overflow-y-auto bg-gray-100 rounded p-2 space-y-1 mb-3">
          <!-- <div v-for="(msg, i) in messages" :key="i" class="bg-white px-3 py-1 rounded shadow text-sm">
            <span class="font-bold">{{ msg.name }}：</span>{{ msg.text }}
          </div> -->
          <div v-for="(msg, i) in messages" :key="i"
     :class="['flex', msg.name === username ? 'justify-end' : 'justify-start']">
  <div
    :class="[
      'px-3 py-2 rounded-lg max-w-[75%] text-sm shadow',
      msg.name === username
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-gray-200 text-gray-800 rounded-bl-none'
    ]"
  >
    <p class="text-xs font-semibold mb-1" v-if="msg.name !== username">{{ msg.name }}</p>
    <p>{{ msg.text }}</p>
  </div>
</div>

        </div>
        <div class="flex">
          <input v-model="newMessage" @keyup.enter="sendMessage" class="flex-1 p-2 border rounded-l" placeholder="メッセージを入力..." />
          <button @click="sendMessage" class="bg-blue-500 text-white px-4 py-2 rounded-r">送信</button>
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
const messages = vueRef([])
const newMessage = vueRef("")

let unsub = null // for onSnapshot unsubscribe

async function createRoom() {
  if (!username.value) return alert("ユーザー名を入力してください")
  roomId.value = Math.floor(10000 + Math.random() * 90000).toString()

  const roomRef = doc(db, "rooms", roomId.value)
  const messagesRef = collection(roomRef, "messages")

  // create empty room document + initial system message
  await setDoc(roomRef, { createdAt: Date.now() })
  await addDoc(messagesRef, {
    name: "システム",
    text: `${username.value} さんがルームを作成しました`,
    createdAt: Date.now()
  })

  listenToMessages(roomId.value)
  step.value = "chat"
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
  listenToMessages(roomId.value)
  step.value = "chat"
}

function listenToMessages(roomId) {
  const messagesRef = collection(db, "rooms", roomId, "messages")
  const q = query(messagesRef, orderBy("createdAt"))

  // cleanup old listener if any
  if (unsub) unsub()

  unsub = onSnapshot(q, snapshot => {
    messages.value = snapshot.docs.map(doc => doc.data())
  })
}

async function sendMessage() {
  if (!newMessage.value.trim()) return

  const messagesRef = collection(db, "rooms", roomId.value, "messages")
  await addDoc(messagesRef, {
    name: username.value,
    text: newMessage.value,
    createdAt: Date.now()
  })
  newMessage.value = ""
}
</script>
