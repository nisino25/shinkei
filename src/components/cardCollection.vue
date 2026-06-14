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
                <div>

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

                        <select
                            v-model="newCard.location"
                            class="border rounded-lg p-3"
                        >
                            <option value="">
                                ロケーション
                            </option>

                            <option
                                v-for="location in availableLocations"
                                :key="location"
                                :value="location"
                            >
                                {{ location }}
                            </option>
                        </select>

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

                    <hr>

                    <div class="mt-4 flex flex-wrap gap-2">
                        <span
                            v-for="animal in AnimalCardsDB"
                            :key="animal.id || animal.label"
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200"
                        >
                            {{ animal.label }}
                        </span>
                    </div>

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

    const AnimalCardsDB = ref([
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
        },
        {
            id: 'bear',
            label: 'ヒグマ',
            area: 'land',
            location: '釧路',
            level: 4,
            imgSrc: '/img/bear.png'
        },
    ])


    const availableLocations = computed(() => {
        return [...new Set(
            AnimalCardsDB.value.map(card => card.location)
        )]
    })



    // location: 'collection'
    // location: 'playing'
    // location: 'market'
    // location: 'deck'
    // location: 'discard'
    // location: 'wilds'

    // const cardInstancesDB = [
    //     {
    //         uniqueId: 'c001',
    //         cardId: 'ant',

    //         ownerId: 'p001',

    //         status: 'collection', // collection, playing, trade, deck, discard

    //         location: 'collection',
    //     },
    //     {
    //         uniqueId: 'c002',
    //         cardId: 'hawk',

    //         ownerId: 'p002',

    //         status: 'playing',

    //         location: 'field'
    //     }
    // ]

    // const playersDB = [
    //     {
    //         id: 'p001',
    //         name: 'Nozo',
                // teamBelongId: 't001'
    //         cardCollection: [
    //             'c001',
    //             'c003',
                    // c001３３３ぽkぽ
                    // c004,
                    // c005,
                    // c006,
    //         ],
                // itemCollection: [
                //     'i001',
                //     'i002'
                // ]
    //     },
    //     {
    //         id: 'p002',
    //         name: 'Becca',
    //         cardCollection: [
    //             'c002'
    //         ]
    //     }
    // ]


    // const itemDB = [
    //     {
    //         id: 'ant',
    //         label: '節水',
    //         imgSrc: '/img/ant.png'
    //         type: 'いいことカード'
    //     },
    //     {
    //         id: '',
    //         label: 'ずきん',
    //         imgSrc: '/img/ant.png'
    //         type: '防災'
    //     },
    // ]

    // const itemInstancesDB = [
    //     {
    //         uniqueId: '1',
    //         cardId: 'ant'
    //     },
    //     {
    //         uniqueId: '2',
    //         cardId: 'ant',
                // status: 'playing',
    //     },
    //     {
    //         uniqueId: '3',
    //         cardId: 'hawk'
    //     },
    // ]

    // const playersDB = [
    //     {
    //         id: 'p001',
    //         name: 'Nozo',
    //     },
    //     {
    //         id: 'p002',
    //         name: 'Becca',
    //     }
    // ]


    // teamDB


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


    // function registerCard() {
    //     const uniqueId = crypto.randomUUID()

    //     AnimalCardsDB.push({
    //         uniqueId,
    //         cardId: selectedCardId.value
    //     })

    //     alert(`カード登録完了: ${uniqueId}`)
    // }

    const newCard = ref({
        id: '',
        label: '',
        area: '',
        location: '',
        level: 1,
        imgSrc: ''
    })

    function createCardType() {
        AnimalCardsDB.value.push(newCard.value)

        newCard.value = {
            id: '',
            label: '',
            area: '',
            location: '',
            level: 1,
            imgSrc: ''
        }

        alert("カードを登録しました")
    }
</script>

<style scoped>
/* Tailwind handles the visuals */
</style>
