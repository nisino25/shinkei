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
                    <template v-if="isTesting">
                        <div class="map-container relative">
                            <img src="../../public/shinkei-map.png">
                            <template v-for="(info,index) in manualInfo" :key="index" >
                                <button class="btn absolute text-sm bg-[#234C6A] py-2 px-2 none text-white" :class="'location-btn-' + info.location" v-if="(isTesting) || (!isTesting && !info.isDemo)" @click="startGame(info.location)">
                                    {{ info.location }}
                                </button>
                            </template>
                        </div>
                    </template>
                    <template v-else>
                        <template v-for="(info,index) in manualInfo" :key="index" >
                            <button class="bg-[#365E32] py-2 px-3 leading-tight text-white" v-if="(isTesting) || (!isTesting && !info.isDemo)" @click="startGame(info.location)">
                                {{ info.location }}
                            </button>
                        </template>
                    </template>
                  </div>

                    <div>
                      <h4 class="font-bold">ペアの紹介</h4>

                      <div v-for="(info,index) in manualInfo" :key="index">
                        <!-- Exclude 'location' key -->
                        <div class="mb-4" v-if="(isTesting) || (!isTesting && !info.isDemo)">
                          <h3 class="text-lg font-medium">{{ info.location }}</h3>

                          <!-- Image Pairing (Food on Top, Hunter on Bottom) -->
                          <div class="flex space-x-2 overflow-x-auto pb-5">
                            <div v-for="(img, index) in info.hunterCards" :key="'food-' + index" class="flex flex-col items-center">
                              <!-- Image Container -->
                              <div class="w-[100px] h-[100px] border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                                <img :src="img" alt="Food Card" class="h-[85%] w-auto">
                              </div>

                              <i class="my-4 fas fa-star text-yellow-400 text-2xl"></i>

                              <div v-if="info.foodCards[index]" class="w-[100px] h-[100px] border-2 border-gray-300 flex items-center justify-center mt-2">
                                <img :src="info.foodCards[index]" alt="Hunter Card" class="h-auto w-auto max-w-[95%] max-h-[95%]">
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
                            <div class="card-back" :style="getCardStyle(card)">
                                <!-- Back of the card -->
                                <img :src="card.data.imgSrc" alt="">
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
        hunterCards: [
          './card-pics/okinawa/hunter/1.png',
          './card-pics/okinawa/hunter/2.png',
          './card-pics/okinawa/hunter/3.png',
          './card-pics/okinawa/hunter/4.png',
          './card-pics/okinawa/hunter/5.png',
          './card-pics/okinawa/hunter/6.png',
          './card-pics/okinawa/hunter/7.png',
        ],

        foodCards: [
          './card-pics/okinawa/food/1.png',
          './card-pics/okinawa/food/2.png',
          './card-pics/okinawa/food/3.png',
          './card-pics/okinawa/food/4.png',
          './card-pics/okinawa/food/5.png',
          './card-pics/okinawa/food/6.png',
          './card-pics/okinawa/food/7.png',
        ],
      },
      {
        location: '京都',
        
        hunterCards: [
          './card-pics/kyoto-hunter-1-v2.png',
          './card-pics/kyoto-hunter-2-v2.png',
          './card-pics/kyoto-hunter-3-v2.png',
          './card-pics/kyoto-hunter-4-v2.png',
          './card-pics/kyoto-hunter-5-v2.png',
          './card-pics/kyoto-hunter-6-v2.png',
          './card-pics/kyoto-hunter-7-v2.png',
        ],

        foodCards: [
          './card-pics/kyoto-food-1-v2.png',
          './card-pics/kyoto-food-2-v2.jpg',
          './card-pics/kyoto-food-3-v2.jpg',
          './card-pics/kyoto-food-4-v2.jpg',
          './card-pics/kyoto-food-5-v2.png',
          './card-pics/kyoto-food-6-v2.png',
          './card-pics/kyoto-food-7-v2.png',
        ],
      },
      {
        location: '神奈川',
        
        hunterCards: [
          './card-pics/hiratsuka-hunter-1.png',
          './card-pics/hiratsuka-hunter-2.png',
          './card-pics/hiratsuka-hunter-3.png',
          './card-pics/hiratsuka-hunter-4.png',
          './card-pics/hiratsuka-hunter-5.png',
          './card-pics/hiratsuka-hunter-6.png',
          './card-pics/hiratsuka-hunter-7.png',
          './card-pics/hiratsuka-hunter-8.png',
        ],

        foodCards: [
          './card-pics/hiratsuka-food-1.png',
          './card-pics/hiratsuka-food-2.png',
          './card-pics/hiratsuka-food-3.png',
          './card-pics/hiratsuka-food-4.png',
          './card-pics/hiratsuka-food-5.png',
          './card-pics/hiratsuka-food-6.png',
          './card-pics/hiratsuka-food-7.png',
          './card-pics/hiratsuka-food-8.png',
        ],
      },
      {
        location: '北海道',
        hunterCards: [
          './card-pics/hokkaido/hunter/1.jpg',
          './card-pics/hokkaido/hunter/2.jpg',
          './card-pics/hokkaido/hunter/3.jpg',
          './card-pics/hokkaido/hunter/4.jpg',
          './card-pics/hokkaido/hunter/5.jpg',
          './card-pics/hokkaido/hunter/6.jpg',
          './card-pics/hokkaido/hunter/7.jpg',
        ],
        foodCards: [
          './card-pics/hokkaido/food/1.png',
          './card-pics/hokkaido/food/2.jpg',
          './card-pics/hokkaido/food/3.jpg',
          './card-pics/hokkaido/food/4.jpg',
          './card-pics/hokkaido/food/5.jpg',
          './card-pics/hokkaido/food/6.jpg',
          './card-pics/hokkaido/food/7.png',
        ],
      },
      {
        location: 'アフリカ',
        isDemo: true,
        hunterCards: [
          './card-pics/africa/hunter/1.jpg',
          './card-pics/africa/hunter/2.jpg',
          './card-pics/africa/hunter/3.jpg',
          './card-pics/africa/hunter/4.jpg',
          './card-pics/africa/hunter/5.jpg',
          './card-pics/africa/hunter/6.jpg',
          './card-pics/africa/hunter/7.jpg',
        ],
        foodCards: [
          './card-pics/africa/food/1.jpg',
          './card-pics/africa/food/2.jpg',
          './card-pics/africa/food/3.jpg',
          './card-pics/africa/food/4.jpg',
          './card-pics/africa/food/5.jpg',
          './card-pics/africa/food/6.jpg',
          './card-pics/africa/food/7.jpg',
        ],
      },
    ],
  )
  
  const sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  const playSound = (path) => {
      const audio = new Audio(path);
      audio.play();
  };
  
  const playShinkei = () => {
      // playArea.value = area
      
      if(playArea.value == '沖縄'){
        items.value = [
            {imgSrc: './card-pics/okinawa/food/1.png', group: 1, type: 'regular', name: `ネコ<br>(イリオモテヤマネコ)` , },
            {imgSrc: './card-pics/okinawa/food/2.png', group: 2, type: 'regular', name: `ジャスミン<br>(オオゴマダラ)` , },
            {imgSrc: './card-pics/okinawa/food/3.png', group: 3, type: 'regular', name: `じゅえき<br>(オキナワカブト)` , },
            {imgSrc: './card-pics/okinawa/food/4.png', group: 4, type: 'regular', name: `カエル<br>(カンムリワシ)` },
            {imgSrc: './card-pics/okinawa/food/5.png', group: 5, type: 'regular', name: `かいそう<br>(ジュゴン)` , },
            {imgSrc: './card-pics/okinawa/food/6.png', group: 6, type: 'regular', name: `オキアミ<br>(マンタ)` , },
            {imgSrc: './card-pics/okinawa/food/7.png', group: 7, type: 'regular', name: `みみず<br>(ヤンバルクイナ)` , },

            {imgSrc: './card-pics/okinawa/hunter/1.png', group: 1, type: 'regular', name: `イリオモテヤマネコ` , },
            {imgSrc: './card-pics/okinawa/hunter/2.png', group: 2, type: 'regular', name: `オオゴマダラ` , },
            {imgSrc: './card-pics/okinawa/hunter/3.png', group: 3, type: 'regular', name: `オキナワカブト` , },
            {imgSrc: './card-pics/okinawa/hunter/4.png', group: 4, type: 'regular', name: `カンムリワシ` , },
            {imgSrc: './card-pics/okinawa/hunter/5.png', group: 5, type: 'regular', name: `ジュゴン` , },
            {imgSrc: './card-pics/okinawa/hunter/6.png', group: 6, type: 'regular', name: `マンタ` , },
            {imgSrc: './card-pics/okinawa/hunter/7.png', group: 7, type: 'regular', name: `ヤンバルクイナ` , },
  
            {imgSrc: './card-pics/bad/1.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},
            {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
            {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `海水汚染` ,},

            {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
            {imgSrc: './card-pics/good/2.jpg', group: null, type: 'beneficial', name: `省エネ` ,},
            
            {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
          ]
      }
      if(playArea.value == '京都'){
          items.value = [
              {name: `フジバカマ<br>（アサギマダラ）` , group: 1, type: 'regular', imgSrc: './card-pics/kyoto-food-1-v2.png'},
              {name: `川魚<br>（アカショウビン）` , group: 2, type: 'regular', imgSrc: './card-pics/kyoto-food-2-v2.jpg'},
              {name: `どんぐり<br>（ニホンザル）` , group: 3, type: 'regular', imgSrc: './card-pics/kyoto-food-3-v2.jpg'},
              {name: `樹液<br>（オオムラサキ）` , group: 4, type: 'regular', imgSrc: './card-pics/kyoto-food-4-v2.jpg'},
              {name: `サワガニ<br>（オオサンショウウオ）` , group: 5, type: 'regular', imgSrc: './card-pics/kyoto-food-5-v2.png'},
              {name: `セミ<br>（アオバズク）` , group: 6, type: 'regular', imgSrc: './card-pics/kyoto-food-6-v2.png'},
              {name: `クモ<br>（モリアオガエル）` , group: 7, type: 'regular', imgSrc: './card-pics/kyoto-food-7-v2.png'},
  
              {name: `アサギマダラ` , group: 1, type: 'regular', imgSrc: './card-pics/kyoto-hunter-1-v2.png'},
              {name: `アカショウビン` , group: 2, type: 'regular', imgSrc: './card-pics/kyoto-hunter-2-v2.png'},
              {name: `ニホンザル` , group: 3, type: 'regular', imgSrc: './card-pics/kyoto-hunter-3-v2.png'},
              {name: `オオムラサキ` , group: 4, type: 'regular', imgSrc: './card-pics/kyoto-hunter-4-v2.png'},
              {name: `オオサンショウウオ` , group: 5, type: 'regular', imgSrc: './card-pics/kyoto-hunter-5-v2.png'},
              {name: `アオバズク` , group: 6, type: 'regular', imgSrc: './card-pics/kyoto-hunter-6-v2.png'},
              {name: `モリアオガエル` , group: 7, type: 'regular', imgSrc: './card-pics/kyoto-hunter-7-v2.png'},
  
              {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-1-v2.jpg'},
              {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-2-v2.jpg'},
              {name: `海水汚染` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-3-v2.jpg'},
  
              {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: './card-pics/kyoto-gameover-v2.jpg'},
  
              {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-1-v2.jpg'},
              {name: `省エネ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-2-v2.jpg'},
          ]
      }
      if(playArea.value == '北海道'){
          items.value = [
              {imgSrc: './card-pics/hokkaido/hunter/1.jpg', group: 1, type: 'regular', name: `オオワシ` , },
              {imgSrc: './card-pics/hokkaido/food/1.png', group: 1, type: 'regular', name: `死んだサケ<br>（オオワシ）`,},
  
              {imgSrc: './card-pics/hokkaido/hunter/2.jpg', group: 2, type: 'regular', name: `ツル` ,},
              {imgSrc: './card-pics/hokkaido/food/2.jpg', group: 2, type: 'regular', name: `みみず<br>（ツル）`,},
  
              {imgSrc: './card-pics/hokkaido/hunter/3.jpg', group: 3, type: 'regular', name: `クマ` ,},
              {imgSrc: './card-pics/hokkaido/food/3.jpg', group: 3, type: 'regular', name: `どんぐり<br>（クマ）`,},
  
              {imgSrc: './card-pics/hokkaido/hunter/4.jpg', group: 4, type: 'regular', name: `クワガタ` ,},
              {imgSrc: './card-pics/hokkaido/food/3.jpg', group: 4, type: 'regular', name: `じゅえき<br>（クワガタ）`,},
  
              {imgSrc: './card-pics/hokkaido/hunter/5.jpg', group: 5, type: 'regular', name: `イトウ` ,},
              {imgSrc: './card-pics/hokkaido/food/5.jpg', group: 5, type: 'regular', name: `どじょう<br>（イトウ）`,},
  
              {imgSrc: './card-pics/hokkaido/hunter/6.jpg', group: 6, type: 'regular', name: `エゾモモンガ` ,},
              {imgSrc: './card-pics/hokkaido/food/6.jpg', group: 6, type: 'regular', name: `くさやはっぱ<br>（エゾモモンガ）`,},
  
              {imgSrc: './card-pics/hokkaido/hunter/7.jpg', group: 7, type: 'regular', name: `シマエナガ` ,},
              {imgSrc: './card-pics/hokkaido/food/7.png', group: 7, type: 'regular', name: `アブラムシ<br>(シマエナガ)`,},
  
              {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
              {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},
  
              {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
              {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
              {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

              {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
          ]
      }
      if(playArea.value == '神奈川'){
        items.value = [
            {name: `クラゲ<br>(アカウミガメ)` , group: 1, type: 'regular', imgSrc: './card-pics/hiratsuka-food-1.png'},
            {name: `カニ<br>(カモ)` , group: 2, type: 'regular', imgSrc: './card-pics/hiratsuka-food-2.png'},
            {name: `エビ<br>(ミナミハコフグ)` , group: 3, type: 'regular', imgSrc: './card-pics/hiratsuka-food-3.png'},
            {name: `ヤマメ<br>(カワセミ)` , group: 4, type: 'regular', imgSrc: './card-pics/hiratsuka-food-4.png'},
            {name: `ツツジ<br>(アゲハチョウ)` , group: 5, type: 'regular', imgSrc: './card-pics/hiratsuka-food-5.png'},
            {name: `どんぐり<br>(ニホンリス)` , group: 6, type: 'regular', imgSrc: './card-pics/hiratsuka-food-6.png'},
            {name: `カタツムリ<br>(アカキツネ)` , group: 7, type: 'regular', imgSrc: './card-pics/hiratsuka-food-7.png'},
            {name: `シロツメグサ<br>(ニホンカモシカ)` , group: 8, type: 'regular', imgSrc: './card-pics/hiratsuka-food-8.png'},

            {name: `アカウミガメ` , group: 1, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-1.png'},
            {name: `カモ` , group: 2, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-2.png'},
            {name: `ミナミハコフグ` , group: 3, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-3.png'},
            {name: `カワセミ` , group: 4, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-4.png'},
            {name: `アゲハチョウ` , group: 5, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-5.png'},
            {name: `ニホンリス` , group: 6, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-6.png'},
            {name: `アカキツネ` , group: 7, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-7.png'},
            {name: `ニホンカモシカ` , group: 8, type: 'regular', imgSrc: './card-pics/hiratsuka-hunter-8.png'},
  
            {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-1-v2.jpg'},
            {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-2-v2.jpg'},

            {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: './card-pics/kyoto-gameover-v2.jpg'},

            {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-1-v2.jpg'},
          ]
      }
      if(playArea.value == 'アフリカ'){
          items.value = [
              {imgSrc: './card-pics/africa/hunter/1.jpg', group: 1, type: 'regular', name: `ガゼル` , },
              {imgSrc: './card-pics/africa/food/1.jpg', group: 1, type: 'regular', name: `アカシア<br>（ガゼル）`,},
  
              {imgSrc: './card-pics/africa/hunter/2.jpg', group: 2, type: 'regular', name: `アフリカぞう` ,},
              {imgSrc: './card-pics/africa/food/2.jpg', group: 2, type: 'regular', name: `バナナ<br>（アフリカぞう）`,},
  
              {imgSrc: './card-pics/africa/hunter/3.jpg', group: 3, type: 'regular', name: `キリン` ,},
              {imgSrc: './card-pics/africa/food/3.jpg', group: 3, type: 'regular', name: `アカシア<br>（キリン）`,},
  
              {imgSrc: './card-pics/africa/hunter/4.jpg', group: 4, type: 'regular', name: `シマウマ` ,},
              {imgSrc: './card-pics/africa/food/3.jpg', group: 4, type: 'regular', name: `ガルガヤ<br>（シマウマ）`,},
  
              {imgSrc: './card-pics/africa/hunter/5.jpg', group: 5, type: 'regular', name: `チーター` ,},
              {imgSrc: './card-pics/africa/food/5.jpg', group: 5, type: 'regular', name: `インパラ<br>（チーター）`,},
  
              {imgSrc: './card-pics/africa/hunter/6.jpg', group: 6, type: 'regular', name: `フラミンゴ` ,},
              {imgSrc: './card-pics/africa/food/6.jpg', group: 6, type: 'regular', name: `えび<br>（フラミンゴ）`,},
  
              {imgSrc: './card-pics/africa/hunter/7.jpg', group: 7, type: 'regular', name: `ライオン` ,},
              {imgSrc: './card-pics/africa/food/7.jpg', group: 7, type: 'regular', name: `ヌー<br>（ライオン）`,},
  
              {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `エコバッグ` ,},
              {imgSrc: './card-pics/good/1.jpg', group: null, type: 'beneficial', name: `省エネ` ,},
  
              {imgSrc: './card-pics//bad/1.jpg', group: null, type: 'destructive', name: `森林伐採` ,},
              {imgSrc: './card-pics/bad/2.jpg', group: null, type: 'destructive', name: `海水汚染` ,},
              {imgSrc: './card-pics/bad/3.jpg', group: null, type: 'destructive', name: `動物との<br>交通事故` ,},

              {imgSrc: './card-pics/gameover/1.png', group: null, type: 'bomb', name: `隕石到来` ,},
          ]
      }
      
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
        display: block;
  
        font-size: .9em;
    }
  
    #app .manual button{
        
        display: block;
  
        margin: 30px auto;
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
        top: 13%;
        left: 67%;
    }
    .location-btn-沖縄{
        top: 85%;
        left: 5%;
    }.location-btn-京都{
        top: 52%;
        left: 34%;
    }.location-btn-神奈川{
        top: 48%;
        left: 50%;
    }.location-btn-アフリカ{
        top: 71%;
        left: 67%;
    }


  
  
  </style>