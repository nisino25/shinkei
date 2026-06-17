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
					<div v-if="currentTab === 'register'" class="bg-white rounded-lg shadow p-6">
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
											class="my-6 px-6 py-3 bg-green-600 text-white rounded-lg"
									>
											作成
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

					<div v-else-if="currentTab === 'playersCards'">

    <h2 class="text-2xl font-bold mb-4">
        カード一覧
    </h2>

    <select
        v-model="selectedPlayer"
        class="border rounded-lg p-2 mb-4"
    >
        <option
            v-for="player in playerOptions"
            :key="player"
            :value="player"
        >
            {{ player }}
        </option>
    </select>

    <table class="w-full border-collapse border">

        <thead>
            <tr>
                <th class="border p-2">
                    プレイヤー
                </th>

                <th class="border p-2">
                    カード
                </th>

                <th class="border p-2">
                    状態
                </th>

                <th class="border p-2">
                    ID
                </th>
            </tr>
        </thead>

        <tbody>
            <tr
                v-for="card in displayedCards"
                :key="card.id"
            >
                <td class="border p-2">
                    {{ card.playerName }}
                </td>

                <td class="border p-2">
                    {{ card.cardName }}
                </td>

                <td class="border p-2">
                    {{ card.status }}
                </td>

                <td class="border p-2">
                    {{ card.id }}
                </td>
            </tr>
        </tbody>

    </table>

</div>

					<div v-else-if="currentTab === 'admin'">

							<h2 class="text-2xl font-bold mb-4">
									カード所持数一覧
							</h2>

							<table class="w-full border-collapse border">

									<thead>
											<tr>
													<th class="border p-2">
															Player
													</th>

													<th
															v-for="card in AnimalCardsDB"
															:key="card.id"
															class="border p-2"
													>
															{{ card.label }}
													</th>
											</tr>
									</thead>

									<tbody>
											<tr
													v-for="row in adminTableRows"
													:key="row.playerName"
											>
													<td class="border p-2">
															{{ row.playerName }}
													</td>

													<td
															v-for="card in AnimalCardsDB"
															:key="card.id"
															class="border p-2 text-center"
													>
															{{ row[card.id] }}
															<button
																	class="ml-2 px-2 bg-green-500 text-white rounded"
																	@click="addCard(row.playerId, card.id)"
															>
																	+
															</button>
													</td>
											</tr>
									</tbody>

							</table>

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
            id: 'playersCards',
            label: 'カード一覧',
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




    // location: 'collection'
    // location: 'playing'
    // location: 'market'
    // location: 'deck'
    // location: 'discard'
    // location: 'wilds'


    const cardInstancesDB = ref([
        {
            id: Date.now(),
            cardId: 'ant',
            ownerId: 'p001',
            status: 'collection'
        },
        {
            id: Date.now() + 1,
            cardId: 'ant',
            ownerId: 'p001',
            status: 'collection'
        },
        {
            id: Date.now() + 2,
            cardId: 'hawk',
            ownerId: 'p001',
            status: 'collection'
        },
        {
            id: Date.now() + 3,
            cardId: 'bear',
            ownerId: 'p002',
            status: 'collection'
        }
    ])

    const playersDB = ref([
				{
						id: 'p001',
						name: '信長'
				},
				{
						id: 'p002',
						name: '家康'
				},
				{
						id: 'p003',
						name: '秀吉'
				},
				{
						id: 'p004',
						name: '政宗'
				}
		])


    const availableLocations = computed(() => {
        return [...new Set(
            AnimalCardsDB.value.map(card => card.location)
        )]
    })

		const playerOptions = computed(() => {
				return [
						'全プレイヤー',
						...playersDB.value.map(player => player.name)
				]
		})
		const selectedPlayer = ref('全プレイヤー')

		const displayedCards = computed(() => {

				return cardInstancesDB.value
						.filter(instance => {

								if (selectedPlayer.value === '全プレイヤー') {
										return true
								}

								const player = playersDB.value.find(player => {
										return player.id === instance.ownerId
								})

								return player?.name === selectedPlayer.value
						})
						.map(instance => {

								const card = AnimalCardsDB.value.find(card => {
										return card.id === instance.cardId
								})

								const player = playersDB.value.find(player => {
										return player.id === instance.ownerId
								})

								return {
										...instance,
										cardName: card?.label ?? '',
										playerName: player?.name ?? ''
								}
						})

		})


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
    const adminTableRows = computed(() => {

			return playersDB.value.map(player => {

					const row = {
							playerName: player.name,
							playerId: player.id
					}

					AnimalCardsDB.value.forEach(card => {

							console.log('card', card)

							row[card.id] = cardInstancesDB.value.filter(instance => {

									console.log('instance', instance)

									return (
											instance.ownerId === player.id &&
											instance.cardId === card.id
									)

							}).length

					})

					return row

			})

    })
        
    // const adminTableRows = computed(() => {

    //     return playersDB.value.map(player => {

    //         const row = {
    //             playerName: player.name
    //         }

    //         AnimalCardsDB.value.forEach(card => {

    //             row[card.id] = cardInstancesDB.value.filter(instance => {
    //                 return (
    //                     instance.ownerId === player.id &&
    //                     instance.cardId === card.id
    //                 )
    //             }).length

    //         })

    //         return row

    //     })

    // })

    function addCard(ownerId, cardId) {

        cardInstancesDB.value.push({
            id: Date.now(),
            ownerId,
            cardId
        })

    }
</script>

<style scoped>
/* Tailwind handles the visuals */
</style>
