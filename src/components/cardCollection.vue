<template>
    <div class="max-w-5xl mx-auto p-6">

        <div class="flex flex-wrap gap-2 border-b mb-6">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="currentTab = tab.id"
                class="px-4 py-2 rounded-t-lg transition"
                :class="getTabClass(tab)"
            >
                {{ tab.label }}
            </button>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
           <div
    v-if="currentTab === 'register'"
    class="bg-white rounded-lg shadow p-6"
>
    <h2 class="text-2xl font-bold mb-6">
        カード登録
    </h2>

    <!-- Mode -->
    <div class="flex gap-2 mb-6">
        <button
            @click="registerMode = 'instance'"
            class="px-4 py-2 rounded-lg"
            :class="registerMode === 'instance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'"
        >
            既存カードから登録
        </button>

        <button
            @click="registerMode = 'master'"
            class="px-4 py-2 rounded-lg"
            :class="registerMode === 'master'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100'"
        >
            新しいカードタイプ
        </button>
    </div>

    <!-- Existing Card -->
    <div v-if="registerMode === 'instance'">

        <label class="block mb-2 font-medium">
            カード種類
        </label>

        <select
            v-model="selectedCardId"
            class="w-full border rounded-lg p-3 mb-4"
        >
            <option value="">
                選択してください
            </option>

            <option
                v-for="card in cardsDB"
                :key="card.id"
                :value="card.id"
            >
                {{ card.label }}
            </option>
        </select>

        <div
            v-if="selectedCard"
            class="border rounded-lg p-4 mb-4"
        >
            <img
                :src="selectedCard.imgSrc"
                :alt="selectedCard.label"
                class="w-32 h-32 object-contain mx-auto mb-4"
            >

            <h3 class="font-bold text-lg">
                {{ selectedCard.label }}
            </h3>

            <p>エリア: {{ selectedCard.area }}</p>
            <p>ロケーション: {{ selectedCard.location }}</p>
            <p>レベル: {{ selectedCard.level }}</p>
        </div>

        <button
            @click="registerCard"
            :disabled="!selectedCardId"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
        >
            カード登録
        </button>

    </div>

    <!-- New Card Type -->
    <div v-else>

        <div class="grid md:grid-cols-2 gap-4">

            <input
                v-model="newCard.id"
                placeholder="id (hawk)"
                class="border rounded-lg p-3"
            >

            <input
                v-model="newCard.label"
                placeholder="名前"
                class="border rounded-lg p-3"
            >

            <select
                v-model="newCard.area"
                class="border rounded-lg p-3"
            >
                <option value="">
                    エリア
                </option>
                <option value="land">
                    land
                </option>
                <option value="air">
                    air
                </option>
            </select>

            <input
                v-model="newCard.location"
                placeholder="ロケーション"
                class="border rounded-lg p-3"
            >

            <input
                v-model.number="newCard.level"
                type="number"
                placeholder="レベル"
                class="border rounded-lg p-3"
            >

            <input
                v-model="newCard.imgSrc"
                placeholder="画像URL"
                class="border rounded-lg p-3 md:col-span-2"
            >
        </div>

        <button
            @click="createCardType"
            class="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg"
        >
            カードタイプ作成
        </button>

    </div>
</div>

            <div v-else-if="currentTab === 'myCards'">
                自分のカード一覧
            </div>

            <div v-else-if="currentTab === 'otherCards'">
                他の人のカード一覧
            </div>

            <div v-else-if="currentTab === 'admin'">
                アドミン管理画面

            </div>
        </div>

    </div>
</template>

<script setup>
    // import { ref, computed, onMounted } from 'vue';
    import { ref,computed } from 'vue'

    const tabs = [
        {
            id: 'register',
            label: '登録',
            color: 'blue'
        },
        {
            id: 'myCards',
            label: 'マイコレクション',
            color: 'blue'
        },
        {
            id: 'otherCards',
            label: '他の人のカード',
            color: 'blue'
        },
        {
            id: 'trade',
            label: '交換用',
            color: 'green'
        },
        {
            id: 'admin',
            label: '管理者画面',
            color: 'red'
        },
    ]

    const cardsDB = [
        {
            id: 'ant',
            label: 'アリ',
            area: 'land',
            location: '京都',
            level: 1,
            imgSrc: '/img/ant.png'
        },
        {
            id: 'hawk',
            label: 'タカ',
            area: 'air',
            location: '平塚',
            level: 4,
            imgSrc: '/img/hawk.png'
        }
    ]

    const cardInstancesDB = [
        {
            uniqueId: 'c001',
            cardId: 'ant'
        },
        {
            uniqueId: 'c002',
            cardId: 'ant'
        },
        {
            uniqueId: 'c003',
            cardId: 'hawk'
        },
    ]

    // const playersDB = [
    //     {
    //         id: 'p001',
    //         name: 'Nozo',
    //         cardCollection: [
    //             'c001',
    //             'c003'
    //         ]
    //     },
    //     {
    //         id: 'p002',
    //         name: 'Becca',
    //         cardCollection: [
    //             'c002'
    //         ]
    //     }
    // ]


    function getTabClass(tab) {
        if (tab.color === 'red') {
            return currentTab.value === tab.id
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
        }

        return currentTab.value === tab.id
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
    }

    const currentTab = ref('register')

    // ---------------------------------

    const registerMode = ref('instance')
    const selectedCardId = ref('')

    const selectedCard = computed(() => {
        return cardsDB.find(
            card => card.id === selectedCardId.value
        )
    })


    function registerCard() {
        const uniqueId = crypto.randomUUID()

        cardInstancesDB.push({
            uniqueId,
            cardId: selectedCardId.value
        })

        alert(`カード登録完了: ${uniqueId}`)
    }

    const newCard = ref({
    id: '',
    label: '',
    area: '',
    location: '',
    level: '',
    imgSrc: ''
})

function createCardType() {
    cardsDB.value.push({
        ...newCard.value
    })

    newCard.value = {
        id: '',
        label: '',
        area: '',
        location: '',
        level: '',
        imgSrc: ''
    }

    registerMode.value = 'instance'
}
</script>

<style scoped>
/* Tailwind handles the visuals */
</style>
