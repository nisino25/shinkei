<template>
    <div class="inner">
        <div class="top-menu-for-shinkei">
  
            <template v-if="!showingManual">
              <div style="display: flex; justify-content: space-between; font-size: 90%; align-items: center;">
              <template v-if="!isGameOver">
                <p  style="pointer-events: none;">現在のポイント: {{currentPoint}}</p>
                <button @click="resetGame()" class='back-to-menu'>リセット</button>
              </template>
              <template v-else>
                <p  style="pointer-events: none;"><strong style="color: crimson;">ゲームが終了しました。</strong><br>最終ポイント: {{currentPoint}}</p>
                <button @click="resetGame()" class='back-to-menu'>もう一回遊ぶ</button>
              </template>
              </div>
            </template>
  
        </div>
  
        <div id="shinkei" v-if="chosenGame == 'shinkei'">
  
            <template v-if="showingManual">
                <div class="manual">
                  <div class="flex-container" style="display:flex; justify-content: space-between;">
                    <div class="map-container relative pb-2">
                        <img src="../../public/shinkei-map-demo.png">
                        <template v-for="(info,index) in manualInfo.filter(i => !i.isInternational)" :key="index" >
                            <a class="btn absolute text-sm bg-[#234C6A] py-2 px-2 none text-white" :class="'location-btn-' + info.location" v-if="(!isTesting && !info.isDemo) || (isTesting)" href="#location-intro" @click="selectLocation(info.location)">
                                {{ info.location }}
                            </a>
                        </template>
                        <div class="flag-container absolute right-[15px] bottom-[15px] flex flex-wrap gap-2 text-[37.5px] items-center">
                            <template v-for="(info,index) in manualInfo.filter(i => i.isInternational)" :key="index" >
                                <a v-if="(!isTesting && !info.isDemo) || (isTesting)" href="#location-intro" @click="selectLocation(info.location)" class="btn text-center">
                                    <span v-if="info.countryCode !== 'af'"
                                        :class="`fi fi-${info.countryCode}`" >
                                    </span>
                                    <span v-else>🦁</span>
                                    <small class="block text-[10px]">{{ info.location }}</small>
                                </a>
                            </template>
                        </div>
                    </div>
                  </div>

                    <div v-if="tempLocation">
                      <h4 class="my-3 font-bold" id="location-intro">
                        {{ tempLocation }}
                        ペアの紹介
                        <button class="inline ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="startGame(tempLocation)">スタート</button>
                      </h4>

                      <div v-for="(info,index) in manualInfo" :key="index">
                        <!-- Exclude 'location' key -->
                        <div class="mb-4" v-if="((isTesting) || (!isTesting && !info.isDemo) ) && tempLocation == info.location">
                          <h3 class="text-lg font-medium">{{ info.location }}</h3>

                          <!-- Image Pairing (Food on Top, Hunter on Bottom) -->
                          <div class="flex space-x-2 overflow-x-auto pb-5">
                            <div v-for="(img, index) in getHunterCards(info.location)" :key="'card-group-' + index" class="flex flex-col items-center">
                              <!-- Image Container -->
                              <div class="w-[100px] h-[100px] border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                                <img :src="img.imgSrc" alt="Food Card" class="h-[85%] w-auto">
                              </div>

                              <i class="my-4 fas fa-star text-yellow-400 text-2xl"></i>

                              <div class="w-[100px] h-[100px] border-2 border-gray-300 flex items-center justify-center mt-2 relative">
                                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square rounded-full z-0 opacity-80" :class="getFoodCircle(getFoodCards(info.location)[index].foodType)"></div>
                                <img :src="getFoodCards(info.location)[index].imgSrc" alt="Hunter Card" class="h-auto w-auto max-w-[95%] max-h-[95%] z-10">
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr>
                      </div>
                    </div>

                    
                  
                    <hr class="my-5">
                    <h4 class="font-bold">神経衰弱 (しんけん すいじゃく) の遊び方</h4>
  
                    
                    <p>カードをタップして開こう</p>
                    <span>
                        画面に表示されているカードをタップして開きます。                        
                    </span>
  
                    <p>王とえさの組み合わせを当てよう</p>
                    <span>目的は、王とそのえさの組み合わせを見つけること。正しいペアを見つけると、1ポイントがもらえます。</span>
  
                    <p>スペシャルカード</p>
                    <span>破壊カード (赤いカード) を開けると、1ポイント失います。</span>
                    <span>回復カードを見つけると、1ポイントがもらえます。</span>
  
                    <p>爆弾カードに気をつけて</p>
                    <span>爆弾を引くと、-3ポイントとしてゲームは終了します。</span>
  
                    <p>ゲームスタートボタンをクリック</p>
                    <span>ゲーム開始の1秒間、悪いカードの位置が表示されるので、覚えて避けるようにしましょう。</span>
                    
  
                    
                </div>
            </template>
  
            <template v-else>
                <div class="grid" :style="{ opacity: isGameOver ? '.65' : '1' }">
                    <div v-for="(card, index) in cards" :key="index" class="card" 
                         :class="{ flipped: card.flipped || card.matched }" 
                         @click="canFlip ? flipCard(index) : null">
  
                         <!-- <template v-if="card.flipped || card.matched">
                             <img :src="card.data.imgSrc" alt="">
                             <span v-html="card.data.name"></span>
                         </template> -->
  
                         <div class="card-inner">
                            <div class="card-front">
                                <img src="https://static.wixstatic.com/media/db1732_16e7ec91a13b45dba7805151ee36e0ec~mv2.png" class="front-pic">
                                <div class="number-container" style="opacity: 0;">
                                  <strong >{{index +1}}</strong>
                                </div>
                                <!-- Front of the card -->
                            </div>
                            <div class="card-back relative" :style="getCardStyle(card)">
                                <!-- Back of the card -->
                                <div v-if="card.data.imgSrc.includes('/food/')" class="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square rounded-full z-0 opacity-80" :class="getFoodCircle(card.data.foodType)"></div>
                                <img class="z-10 relative" :src="card.data.imgSrc" alt="">
                                <span v-html="card.data.name"></span>
                            </div>
                        </div>
                    </div>
                </div>
  
                
            </template>
        </div>
    </div>
</template>
  
<script setup>
  import { userData } from '@/stores/userData';
  const store = userData();

  import { ref, onMounted, watch } from 'vue'
  
  const chosenGame = ref(null);
  const currentPoint = ref(0);
  const items = ref([]);
  const cards = ref([]);
  const flippedCards = ref([]);
  
  // const currentIndex = ref(0);
  const canFlip = ref(true);
  const playArea = ref('北海道');
  
  const isGameOver = ref(false);
  const showingManual = ref(false);

  const isTesting = ref(false);

  const manualInfo = ref(
    
    [
      {
        isDemo: false,
        location: '沖縄',
        
        wholeCardSet: [
            {imgSrc: './card-pics/okinawa/hunter/1.png', group: 1, type: 'regular', name: `イリオモテヤマネコ` , },
            {imgSrc: './card-pics/okinawa/food/1.png?v=2', group: 1, type: 'regular', foodType: "mamal", name: `ネズミ<br>（イリオモテヤマネコ）`,},

            {imgSrc: './card-pics/okinawa/hunter/2.png', group: 2, type: 'regular', name: `オオゴマダラ` ,},
            {imgSrc: './card-pics/okinawa/food/2.png', group: 2, type: 'regular', foodType: "plant", name: `ホウライカガミ<br>（オオゴマダラ）`,},

            {imgSrc: './card-pics/okinawa/hunter/3.png', group: 3, type: 'regular', name: `オキナワカブト` ,},
            {imgSrc: './card-pics/okinawa/food/3.png?v=2', group: 3, type: 'regular', foodType: "sap", name: `じゅえき<br>（オキナワカブト）`,},

            {imgSrc: './card-pics/okinawa/hunter/4.png', group: 4, type: 'regular', name: `カンムリワシ` ,},
            {imgSrc: './card-pics/okinawa/food/4.png', group: 4, type: 'regular', foodType: "vertebrate", name: `かえる<br>（カンムリワシ）`,},

            {imgSrc: './card-pics/okinawa/hunter/5.png', group: 5, type: 'regular', name: `ジュゴン` ,},
            {imgSrc: './card-pics/okinawa/food/5.png?v=2', group: 5, type: 'regular', foodType: "algae", name: `かいそう<br>（ジュゴン）`,},

            {imgSrc: './card-pics/okinawa/hunter/6.png', group: 6, type: 'regular', name: `マンタ` ,},
            {imgSrc: './card-pics/okinawa/food/6.png', group: 6, type: 'regular', foodType: "fish", name: `オキアミ<br>（マンタ）`,},

            {imgSrc: './card-pics/okinawa/hunter/7.png', group: 7, type: 'regular', name: `ヤンバルクイナ` ,},
            {imgSrc: './card-pics/okinawa/food/7.png?v=2', group: 7, type: 'regular', foodType: "insect", name: `ミミズ<br>（ヤンバルクイナ）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/2.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
      {
        location: '神奈川',
        wholeCardSet: [
          {name: `クラゲ<br>(アカウミガメ)` , group: 1, type: 'regular', foodType: 'fish', imgSrc: './card-pics/hiratsuka/food/1.png'},
          {name: `カニ<br>(カモメ)` , group: 2, type: 'regular', foodType: 'fish', imgSrc: './card-pics/hiratsuka/food/2.png'},
          {name: `エビ<br>(ミナミハコフグ)` , group: 3, type: 'regular', foodType: 'fish', imgSrc: './card-pics/hiratsuka/food/3.png'},
          {name: `ヤマメ<br>(カワセミ)` , group: 4, type: 'regular', foodType: 'fish', imgSrc: './card-pics/hiratsuka/food/4.png'},
          {name: `ツツジ<br>(アゲハチョウ)` , group: 5, type: 'regular', foodType: 'plant', imgSrc: './card-pics/hiratsuka/food/5.png'},
          {name: `どんぐり<br>(ニホンリス)` , group: 6, type: 'regular', foodType: 'fruit', imgSrc: './card-pics/hiratsuka/food/6.png'},
          {name: `カタツムリ<br>(アカキツネ)` , group: 7, type: 'regular', foodType: 'insect', imgSrc: './card-pics/hiratsuka/food/7.png'},
          {name: `シロツメグサ<br>(ニホンカモシカ)` , group: 8, type: 'regular', foodType: 'plant', imgSrc: './card-pics/hiratsuka/food/8.png'},

          {name: `アカウミガメ` , group: 1, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/1.png'},
          {name: `カモメ` , group: 2, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/2.png'},
          {name: `ミナミハコフグ` , group: 3, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/3.png'},
          {name: `カワセミ` , group: 4, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/4.png'},
          {name: `アゲハチョウ` , group: 5, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/5.png'},
          {name: `ニホンリス` , group: 6, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/6.png'},
          {name: `アカキツネ` , group: 7, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/7.png'},
          {name: `ニホンカモシカ` , group: 8, type: 'regular', imgSrc: './card-pics/hiratsuka/hunter/8.png'},

          {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: './card-pics//bad/3.jpg'},
          {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: './card-pics//bad/1.jpg'},
      
          {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: './card-pics/good/1.jpg'},

          {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: './card-pics/gameover/1.png'},
        ]
      },
      {
        location: '北海道',
        wholeCardSet: [
            {imgSrc: './card-pics/hokkaido/hunter/1.jpg', group: 1, type: 'regular', name: `オオワシ` , },
            {imgSrc: './card-pics/hokkaido/food/1.png', group: 1, type: 'regular', foodType: "fish", name: `死んだ魚<br>（オオワシ）`,},

            {imgSrc: './card-pics/hokkaido/hunter/2.jpg', group: 2, type: 'regular', name: `タンチョウヅル` ,},
            {imgSrc: './card-pics/hokkaido/food/2.png', group: 2, type: 'regular', foodType: "insect", name: `ミミズ<br>（タンチョウヅル）`,},

            {imgSrc: './card-pics/hokkaido/hunter/3.jpg', group: 3, type: 'regular', name: `ヒグマ` ,},
            {imgSrc: './card-pics/hokkaido/food/3.png', group: 3, type: 'regular', foodType: "fruit", name: `どんぐり<br>（ヒグマ）`,},

            {imgSrc: './card-pics/hokkaido/hunter/4.jpg', group: 4, type: 'regular', name: `オオクワガタ` ,},
            {imgSrc: './card-pics/hokkaido/food/4.png', group: 4, type: 'regular', foodType: "sap", name: `じゅえき<br>（オオクワガタ）`,},

            {imgSrc: './card-pics/hokkaido/hunter/5.jpg', group: 5, type: 'regular', name: `イトウ` ,},
            {imgSrc: './card-pics/hokkaido/food/5.png', group: 5, type: 'regular', foodType: "fish", name: `どじょう<br>（イトウ）`,},

            {imgSrc: './card-pics/hokkaido/hunter/6.jpg', group: 6, type: 'regular', name: `エゾモモンガ` ,},
            {imgSrc: './card-pics/hokkaido/food/6.png', group: 6, type: 'regular', foodType: "plant", name: `花やはっぱ<br>（エゾモモンガ）`,},

            {imgSrc: './card-pics/hokkaido/hunter/7.jpg', group: 7, type: 'regular', name: `シマエナガ` ,},
            {imgSrc: './card-pics/hokkaido/food/7.png', group: 7, type: 'regular', foodType: "insect", name: `アブラムシ<br>（シマエナガ）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/2.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
      {
        location: '京都',
        isDemo: false,
        wholeCardSet: [
            {imgSrc: './card-pics/kyoto/hunter/1.png', group: 1, type: 'regular', name: `アサギマダラ` , },
            {imgSrc: './card-pics/kyoto/food/1.png', group: 1, type: 'regular', foodType: "plant", name: `フジバカマ<br>（アサギマダラ）`,},

            {imgSrc: './card-pics/kyoto/hunter/2.png', group: 2, type: 'regular', name: `アカショウビン` ,},
            {imgSrc: './card-pics/kyoto/food/2.png', group: 2, type: 'regular', foodType: "fish", name: `川魚<br>（アカショウビン）`,},

            {imgSrc: './card-pics/kyoto/hunter/3.png', group: 3, type: 'regular', name: `ニホンザル` ,},
            {imgSrc: './card-pics/kyoto/food/3.png', group: 3, type: 'regular', foodType: "fruit", name: `どんぐり<br>（ニホンザル）`,},

            {imgSrc: './card-pics/kyoto/hunter/4.png', group: 4, type: 'regular', name: `オオムラサキ` ,},
            {imgSrc: './card-pics/kyoto/food/4.png', group: 4, type: 'regular', foodType: "sap", name: `樹液<br>（オオムラサキ）`,},

            {imgSrc: './card-pics/kyoto/hunter/5.png', group: 5, type: 'regular', name: `オオサンショウウオ` ,},
            {imgSrc: './card-pics/kyoto/food/5.png', group: 5, type: 'regular', foodType: "other", name: `サワガニ<br>（オオサンショウウオ）`,},

            {imgSrc: './card-pics/kyoto/hunter/6.png', group: 6, type: 'regular', name: `アオハズク` ,},
            {imgSrc: './card-pics/kyoto/food/6.png', group: 6, type: 'regular', foodType: "insect", name: `セミ<br>（アオハズク）`,},

            {imgSrc: './card-pics/kyoto/hunter/7.png', group: 7, type: 'regular', name: `モリアオガエル` ,},
            {imgSrc: './card-pics/kyoto/food/7.png', group: 7, type: 'regular', foodType: "insect", name: `クモ<br>（モリアオガエル）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },

      {
        location: 'アフリカ',
        isDemo: false,
        isInternational: true,
        countryCode: 'af',
        wholeCardSet: [
            {imgSrc: './card-pics/africa/hunter/1.jpg', group: 1, type: 'regular', name: `ガゼル` , },
            {imgSrc: './card-pics/africa/food/1.png', group: 1, type: 'regular', foodType: "plant", name: `アカシアの葉<br>（ガゼル）`,},

            {imgSrc: './card-pics/africa/hunter/2.jpg', group: 2, type: 'regular', name: `アフリカぞう` ,},
            {imgSrc: './card-pics/africa/food/2.png', group: 2, type: 'regular', foodType: "fruit", name: `バナナ<br>（アフリカぞう）`,},

            {imgSrc: './card-pics/africa/hunter/3.jpg', group: 3, type: 'regular', name: `キリン` ,},
            {imgSrc: './card-pics/africa/food/3.png', group: 3, type: 'regular', foodType: "plant", name: `アカシアの花<br>（キリン）`,},

            {imgSrc: './card-pics/africa/hunter/4.jpg', group: 4, type: 'regular', name: `シマウマ` ,},
            {imgSrc: './card-pics/africa/food/4.png', group: 4, type: 'regular', foodType: "plant", name: `ガルガヤ<br>（シマウマ）`,},

            {imgSrc: './card-pics/africa/hunter/5.jpg', group: 5, type: 'regular', name: `チーター` ,},
            {imgSrc: './card-pics/africa/food/5.png', group: 5, type: 'regular', foodType: "mammal", name: `インパラ<br>（チーター）`,},

            {imgSrc: './card-pics/africa/hunter/6.jpg', group: 6, type: 'regular', name: `フラミンゴ` ,},
            {imgSrc: './card-pics/africa/food/6.png', group: 6, type: 'regular', foodType: "fish", name: `えび<br>（フラミンゴ）`,},

            {imgSrc: './card-pics/africa/hunter/7.jpg', group: 7, type: 'regular', name: `ライオン` ,},
            {imgSrc: './card-pics/africa/food/7.png', group: 7, type: 'regular', foodType: "mammal", name: `ヌー<br>（ライオン）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/2.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
      {
        location: 'オーストラリア',
        countryCode: 'au',
        isDemo: false,
        isInternational: true,
        wholeCardSet: [
            {imgSrc: './card-pics/australia/hunter/1.png', group: 1, type: 'regular', name: `コアラ` , },
            {imgSrc: './card-pics/australia/food/1.png', group: 1, type: 'regular', foodType: "plant", name: `ユーカリ<br>（コアラ）`,},

            {imgSrc: './card-pics/australia/hunter/2.png', group: 2, type: 'regular', name: `カンガルー` ,},
            {imgSrc: './card-pics/australia/food/2.png', group: 2, type: 'regular', foodType: "fruit", name: `イネ科植物<br>（カンガルー）`,},

            {imgSrc: './card-pics/australia/hunter/3.png', group: 3, type: 'regular', name: `カモノハシ` ,},
            {imgSrc: './card-pics/australia/food/3.png', group: 3, type: 'regular', foodType: "vertebrate", name: `かえる<br>（カモノハシ）`,},

            {imgSrc: './card-pics/australia/hunter/4.png', group: 4, type: 'regular', name: `ウォンバット` ,},
            {imgSrc: './card-pics/australia/food/4.png', group: 4, type: 'regular', foodType: "decay", name: `きのこ<br>（ウォンバット）`,},

            {imgSrc: './card-pics/australia/hunter/5.png', group: 5, type: 'regular', name: `リトルペンギン` ,},
            {imgSrc: './card-pics/australia/food/5.png', group: 5, type: 'regular', foodType: "fish", name: `こざかな<br>（リトルペンギン）`,},

            {imgSrc: './card-pics/australia/hunter/6.png', group: 6, type: 'regular', name: `イリエワニ` ,},
            {imgSrc: './card-pics/australia/food/6.png', group: 6, type: 'regular', foodType: "mammal", name: `水牛<br>（イリエワニ）`,},

            {imgSrc: './card-pics/australia/hunter/7.png', group: 7, type: 'regular', name: `ディンゴ` ,},
            {imgSrc: './card-pics/australia/food/7.png', group: 7, type: 'regular', foodType: "mammal", name: `うさぎ<br>（ディンゴ）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
      {
        location: 'ロシア',
        countryCode: 'ru',
        isDemo: false,
        isInternational: true,
        wholeCardSet: [
            {imgSrc: './card-pics/russia/hunter/1.png', group: 1, type: 'regular', name: `アムールトラ` , },
            {imgSrc: './card-pics/russia/food/1.png', group: 1, type: 'regular', foodType: "mammal", name: `イノシシ<br>（アムールトラ）`,},

            {imgSrc: './card-pics/russia/hunter/2.png', group: 2, type: 'regular', name: `アムールヒョウ` ,},
            {imgSrc: './card-pics/russia/food/2.png', group: 2, type: 'regular', foodType: "mammal", name: `うさぎ<br>（アムールヒョウ）`,},

            {imgSrc: './card-pics/russia/hunter/3.png', group: 3, type: 'regular', name: `コウノトリ` ,},
            {imgSrc: './card-pics/russia/food/3.png', group: 3, type: 'regular', foodType: "fish", name: `さかな<br>（コウノトリ）`,},

            {imgSrc: './card-pics/russia/hunter/4.png', group: 4, type: 'regular', name: `シベリアオオカミ` ,},
            {imgSrc: './card-pics/russia/food/4.png', group: 4, type: 'regular', foodType: "mammal", name: `オオツノシカ<br>（シベリアオオカミ）`,},

            {imgSrc: './card-pics/russia/hunter/5.png', group: 5, type: 'regular', name: `シベリアオオヤマネコ` ,},
            {imgSrc: './card-pics/russia/food/5.png', group: 5, type: 'regular', foodType: "mammal", name: `ねずみ<br>（シベリアオオヤマネコ）`,},

            {imgSrc: './card-pics/russia/hunter/6.png', group: 6, type: 'regular', name: `トナカイ` ,},
            {imgSrc: './card-pics/russia/food/6.png', group: 6, type: 'regular', foodType: "decay", name: `コケ<br>（トナカイ）`,},

            {imgSrc: './card-pics/russia/hunter/7.png', group: 7, type: 'regular', name: `ホッキョクグマ` ,},
            {imgSrc: './card-pics/russia/food/7.png', group: 7, type: 'regular', foodType: "mammal", name: `アザラシ<br>（ホッキョクグマ）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
      {
        location: 'ブラジル',
        isDemo: false,
        isInternational: true,
        countryCode: 'br',
        wholeCardSet: [
            {imgSrc: './card-pics/brazil/hunter/1.png', group: 1, type: 'regular', name: `ナマケモノ` , },
            {imgSrc: './card-pics/brazil/food/1.png', group: 1, type: 'regular', foodType: "plant", name: `やさい<br>（ナマケモノ）`,},

            {imgSrc: './card-pics/brazil/hunter/2.png', group: 2, type: 'regular', name: `カピバラ` ,},
            {imgSrc: './card-pics/brazil/food/2.png', group: 2, type: 'regular', foodType: "plant", name: `イネ<br>（カピバラ）`,},

            {imgSrc: './card-pics/brazil/hunter/3.png', group: 3, type: 'regular', name: `ライオンタマリン` ,},
            {imgSrc: './card-pics/brazil/food/3.png', group: 3, type: 'regular', foodType: "fruit", name: `くだもの<br>（ライオンタマリン）`,},

            {imgSrc: './card-pics/brazil/hunter/4.png', group: 4, type: 'regular', name: `オニオオハシ` ,},
            {imgSrc: './card-pics/brazil/food/4.png', group: 4, type: 'regular', foodType: "fruit", name: `パパイヤ<br>（オニオオハシ）`,},

            {imgSrc: './card-pics/brazil/hunter/5.png', group: 5, type: 'regular', name: `アリクイ` ,},
            {imgSrc: './card-pics/brazil/food/5.png', group: 5, type: 'regular', foodType: "insect", name: `アリ<br>（アリクイ）`,},

            {imgSrc: './card-pics/brazil/hunter/6.png', group: 6, type: 'regular', name: `アルマジロ` ,},
            {imgSrc: './card-pics/brazil/food/6.png', group: 6, type: 'regular', foodType: "insect", name: `ミミズ・アリ<br>（アルマジロ）`,},

            {imgSrc: './card-pics/brazil/hunter/7.png', group: 7, type: 'regular', name: `ピラニア` ,},
            {imgSrc: './card-pics/brazil/food/7.png', group: 7, type: 'regular', foodType: "mammal", name: `ネズミ<br>（ピラニア）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
      {
        location: 'ドイツ',
        isDemo: true,
        isInternational: true,
        countryCode: 'de',
        wholeCardSet: [
            {imgSrc: './card-pics/germany/hunter/1.png', group: 1, type: 'regular', name: `アカキツネ` , },
            {imgSrc: './card-pics/germany/food/1.png', group: 1, type: 'regular', foodType: "mammal", name: `うさぎ<br>（アカキツネ）`,},

            {imgSrc: './card-pics/germany/hunter/2.png', group: 2, type: 'regular', name: `アカシカ` ,},
            {imgSrc: './card-pics/germany/food/2.png', group: 2, type: 'regular', foodType: "plant", name: `草<br>（アカシカ）`,},

            {imgSrc: './card-pics/germany/hunter/3.png', group: 3, type: 'regular', name: `イノシシ` ,},
            {imgSrc: './card-pics/germany/food/3.png', group: 3, type: 'regular', foodType: "insect", name: `ミミズ<br>（イノシシ）`,},

            {imgSrc: './card-pics/germany/hunter/4.png', group: 4, type: 'regular', name: `オコジョ` ,},
            {imgSrc: './card-pics/germany/food/4.png', group: 4, type: 'regular', foodType: "mammal", name: `ネズミ<br>（オコジョ）`,},

            {imgSrc: './card-pics/germany/hunter/5.png', group: 5, type: 'regular', name: `キタリス` ,},
            {imgSrc: './card-pics/germany/food/5.png', group: 5, type: 'regular', foodType: "fruit", name: `クルミ<br>（キタリス）`,},

            {imgSrc: './card-pics/germany/hunter/6.png', group: 6, type: 'regular', name: `シュバシコウ` ,},
            {imgSrc: './card-pics/germany/food/6.png', group: 6, type: 'regular', foodType: "vertebrate", name: `カエル<br>（シュバシコウ）`,},

            {imgSrc: './card-pics/germany/hunter/7.png', group: 7, type: 'regular', name: `ヨーロッパヤマネ` ,},
            {imgSrc: './card-pics/germany/food/7.png', group: 7, type: 'regular', foodType: "insect", name: `アブラムシ<br>（ヨーロッパヤマネ）`,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},

            {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
        ]
      },
    ],
  );

  const tempLocation = ref('');

  const getHunterCards = (locationName) => {
      const loc = manualInfo.value.find(obj => obj.location === locationName)
      return loc ? loc.wholeCardSet.filter(card => card.imgSrc.includes("/hunter/")) : []
  };
  const getFoodCards = (locationName) => {
      const loc = manualInfo.value.find(obj => obj.location === locationName)
      return loc ? loc.wholeCardSet.filter(card => card.imgSrc.includes("/food/")) : []
  };

  const getFoodCircle = (foodType) => {
      if (foodType == null) return "bg-[#ff0000]" // unknown -> Other (赤)

      // normalize: trim, toLowerCase, 全角スペースを半角に
      const normalized = String(foodType).replace(/\u3000/g, " ").trim().toLowerCase()

      const map = {
          algae:    "bg-[#2f4f4f]",
          plant:    "bg-[#008000]",
          fruit:    "bg-[#ff4500]",
          decay:    "bg-[#A0522d]",
          sap:      "bg-[#ffd700]",
          insect:   "bg-[#ff69b4]",
          mammal:   "bg-[#ffff00]",
          fish:     "bg-[#0000ff]",
          vertebrate: "bg-[#808000]",
          other:    "bg-[#ff0000]"
      }

      return map[normalized] || "bg-[#ff0000]"
  };

  
  const sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  const playSound = (path) => {
      const audio = new Audio(path);
      audio.play();
  };
  
  const playShinkei = () => {
      // playArea.value = area
      const foundItem = manualInfo.value.find(obj => obj.location === playArea.value)
      items.value = foundItem ? foundItem.wholeCardSet : []
      
      resetGame()
  };
                   
  const getCardStyle = (card) => {
      if (!card.matched && card.data.type === 'regular') {
          return {};
      }
  
      const styles = {
          regular: { backgroundColor: 'gold' },
          destructive: { backgroundColor: 'crimson', color: 'white' },
          bomb: { backgroundColor: 'black', color: 'white' },
          beneficial: { backgroundColor: '#004526', color: 'white' },
      };
  
      return styles[card.data?.type] || {};
  };
  
  const shuffle =(array) => {
          for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
  };
  
  const flipCard = async (index) => {
          if(isGameOver.value) return
          if (cards.value[index].flipped || cards.value[index].matched) {
              return;
          }
  
          playSound('https://static.wixstatic.com/mp3/db1732_ffc2595b2a0d4d4494528b3d895d5d0c.wav');
  
          if(cards.value[index].data.type !== 'regular'){
              cards.value[index].matched = true
              if(cards.value[index].data.type == 'destructive'){
                  currentPoint.value--
              }else if(cards.value[index].data.type == 'beneficial'){
                  currentPoint.value++
              }else if(cards.value[index].data.type == 'bomb'){
                  currentPoint.value = currentPoint.value -3
                  gameOver()
              }
              return
          }
  
          cards.value[index].flipped = true;
          flippedCards.value.push(index);
  
          if (flippedCards.value.length === 2) {
              canFlip.value = false
              checkMatch();
              
          }
  };
  const gameOver = async () =>{
      isGameOver.value = true

      await store.updatePoints(currentPoint.value,store.uniqueId);

      // await updatePoints(currentPoint.value)
  };
  const checkMatch = async () => {
      await sleep(1000);
      const [firstIndex, secondIndex] = flippedCards.value;
      const firstCard = cards.value[firstIndex];
      const secondCard = cards.value[secondIndex];
  
      if (firstCard.data.group === secondCard.data.group) {
          firstCard.matched = true;
          secondCard.matched = true;
          canFlip.value = true
          currentPoint.value+= 1
  
          checkGameStatus()
      } else {
          firstCard.flipped = false;
          secondCard.flipped = false;
          canFlip.value = true
          playSound('https://static.wixstatic.com/mp3/db1732_b789dfd0cb414130bfe9fa02df24fddd.wav');
      }
      flippedCards.value = [];
  };
  const checkGameStatus = () => {
      let allRegularMatched = cards.value
          .filter(card => card.data.type === 'regular')
          .every(card => card.matched);
  
      if(allRegularMatched) gameOver()
  };
  const resetGame = () => {
      showingManual.value = true
      isGameOver.value = false
      canFlip.value = false
  
      flippedCards.value = [];
  
      cards.value = shuffle(items.value.map(name => ({
          data: name,
          flipped: false,
          matched: false
      })));
  
      currentPoint.value = 0
  };
  const startGame = async (location) => {
      playArea.value = location
      playShinkei()
      showingManual.value = false
      tempLocation.value = ''
      await sleep(500);
      playSound('https://static.wixstatic.com/mp3/db1732_ffc2595b2a0d4d4494528b3d895d5d0c.wav');
  
      for (let i in cards.value) {
          let card = cards.value[i]
          if (card.data.type === 'destructive' || card.data.type === 'bomb') {
              card.flipped = true;
              card.matched = true;
          }
      }
      await sleep(1000);
      playSound('https://static.wixstatic.com/mp3/db1732_b789dfd0cb414130bfe9fa02df24fddd.wav');
  
      for (let i in cards.value) {
          let card = cards.value[i];
          card.flipped = false;
          card.matched = false;
          canFlip.value = true
      }
  };

  const selectLocation = (location) => {
      tempLocation.value = location
  };

  watch(showingManual, (newValue) => {
    document.body.classList.toggle("overflow-auto", newValue);
    document.body.classList.toggle("overflow-hidden", !newValue);
  });

  onMounted(() => {
      console.clear();
  
      chosenGame.value = 'shinkei';
      showingManual.value = true;

      const urlParams = new URLSearchParams(window.location.search);
      const isTestingParam = urlParams.get("isTesting");

        if (isTestingParam == 1) isTesting.value = true;
  });

  
  
</script>

<style>

    html{
        
        
        scroll-behavior: smooth;
    }
  
    #app{
        font-family: 'Noto Sans JP', sans-serif;
  
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
  
        font-size: 16px;
  
        padding-bottom: 50px;
  
        
        touch-action: manipulation;
        -webkit-user-select: none;
    }
  
    #app .game-title-container{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
  
    #app .game-title-container h1{
        text-align: center;
        margin: 0;
        /* margin-bottom: 10px; */
        margin-right: 5px;
  
        display: inline;
  
        font-size: 20px;
    }
    #app .back-to-menu{
        color: white;
        padding: 10px;
  
        /* font-size: 13px; */
        font-size: 75%;
  
        
        display: inline;
        outline: 0;
        cursor: pointer;
        border: none;
        padding: 2.5px 12.5px;
        /* height: 45px; */
        /* line-height: 2.5; */
        border-radius: 8px;
        font-weight: 400;
        background: #FD9B63;
        color: white;
        box-shadow: 0 4px 14px 0 rgb(0 0 0 / 10%);
        transition: background 0.2s ease,color 0.2s ease,box-shadow 0.2s ease;
        /* :hover{
            background: rgba(255,255,255,0.9);
            box-shadow: 0 6px 20px rgb(93 93 93 / 23%);
        } */
        
    }
  
    #app .game-menu button{
        display: block;
        margin: 20px auto;
        padding: 20px;
        min-width: 250px;
    }
    #app .inner{
        width: 500px;
        margin: auto;
        max-width: 95vw;
    }
  
  
    #app .manual h4{
        text-align: center;
    }
  
    #app .manual p{
        font-weight: bold;
        font-size: .95em;
  
        margin-top: 20px !important;
        margin-bottom: 5px;
  
        line-height: 1;
    }
  
    #app .manual span{
        /* display: block; */
  
        font-size: .9em;
    }
  
    #app .manual button{

        outline: 0;
        cursor: pointer;
        border: none;
        /* height: 45px; */
        border-radius: 7px;
        font-weight: 400;
        /* font-size: 16px; */
        /* color: white; */
        box-shadow: 0 4px 14px 0 rgb(0 0 0 / 10%);
        
    }
  
    /* ------------------------------------------ */
    .top-menu-for-shinkei{
        display: block;
        margin: 0 auto 12.5px;
        text-align: center;
        font-size: .9em;
    }

    /* Styles for iPads (768px and larger) */
    @media screen and (min-width: 1000px) {
        .top-menu-for-shinkei{
            position: absolute;
            left: 50%;
            transform: translateX(-50%);

            width: 900px;
        }
    }

    
  
  
  
    #app #shinkei .grid {
        width: 98.5%;
        max-width: 650px;
        margin: auto;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 5px;
        justify-content: center;
    }
  
    #app #shinkei .card {
        position: relative;
        width: 100%;
        aspect-ratio: 5/6;
        /* aspect-ratio: 7/8; */
        /* aspect-ratio: 4/5; */
        display: block;
        text-align: center;
        
        cursor: pointer;
  
        font-size: 15px;
    }
  
    #app #shinkei .card img {
        max-width: 100%;
        display: block;
        width: 87.5%;
        margin: 5px auto;
  
        width: auto;
        max-height: 62.5%;
    }
  
    #app #shinkei .card .card-front img{
      /* width: 87.5% !important; */
      max-height: unset !important;
      height: auto;
    }
  
    #app #shinkei .card  span{
        position: absolute;
        width: 100%;
        left: 50%;
        bottom: 11.5%;
        transform: translateX(-50%) translateY(50%);
  
        display: block;
        /* white-space: nowrap; */
        font-size: .575em;
        font-weight: bold;
        line-height: 1.2;
    }
    #app #shinkei .flipped {
        background-color: white;
    }
  
    #app #shinkei p{
        margin-top: 17.5px !important;   
    }
  
    #app .card-inner {
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.5s;
    }
  
    #app .card.flipped .card-inner {
        transform: rotateY(-180deg);
    }
  
  
    #app .card-front,
    #app .card-back {
        width: 100%;
        height: 100%;
        position: absolute;
        backface-visibility: hidden;
        border: 1px solid #ccc;
        box-sizing: border-box;
        
        /* border: 1px solid #000; */
  
        box-shadow: 2px 2px 1px #888888;
        
    }
  
  
  
    #app #shinkei .front-pic{
        position: absolute;
        height: 100%;
    }
  
    #app .card-back{
        height: 100%;
    }
  
    #app .card-front img{
        margin: auto !important;
        width: 100% !important;
        filter: brightness(85%);
    }
  
    #app .card-front .number-container{
        display: flex;
        align-items: center;
        justify-content: center;
  
        width: 40%;
        aspect-ratio: 1;
        background-color: white;
        opacity: .8 !important;
        font-size: 1.5em;
        /* opacity: 0 !important; */

        position: absolute;
        top: 0;
  
    }
  
    #app .card-back {
        transform: rotateY(-180deg);
    }
  
  
    /* -------------------------------- */
            
    #app .back {
    position: relative;
    /* top: 20px;
    left: 50%; */
    width: 500px;
    aspect-ratio: 1;
    max-width: 95%;
    padding: 10px;
    border-radius: 260px;
    }
  
    #app .back > .pin {
    position: absolute;
    left: 50%;
    top: 10px;
    border-top: 50px solid #ab1234;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-radius: 20px;
    transform: translatex(-50%);
    z-index: 1;
    }
  
    #app .back > .wheel {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background-color: white;
    border-radius: 50%;
    overflow: hidden;
    transform-origin: center center;
  
    border: 2px solid black;
    }
  
    @media only screen and (max-width: 1280px) {
        #app{
            font-size: 15px;
        }
    }
  
    @media only screen and (min-width: 1000px){
        #app .inner{
            width: 800px;
        }
        
        #app #shinkei .grid{
            grid-template-columns: repeat(5, 1fr);
        }
  
        #app #shinkei .card  span{
            font-size: 1.2em;
        }
    }

    /* ==================================================== */

    .location-btn-北海道{
        top: 17%;
        left: 67%;
    }.location-btn-沖縄{
        top: 89%;
        left: 5%;
    }.location-btn-京都{
        top: 56%;
        left: 34%;
    }.location-btn-神奈川{
        top: 52%;
        left: 50%;
    }.location-btn-アフリカ{
        top: 65%;
        left: 67%;
    }.location-btn-オーストラリア{
        top: 75%;
        left: 62%;
    }.location-btn-ロシア{
        top: 85%;
        left: 68%;
    }.location-btn-ブラジル{
        top: 92.5%;
        left: 66.5%;
    }


  
  
  </style>