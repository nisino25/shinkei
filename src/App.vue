<template>
  <div class="inner">
      <div v-if="!loading" style="display: block; margin: 12.5px auto; text-align: center; font-size: .9em;" >

          <div style="display: flex; justify-content: space-between; width: 100%;font-weight: bold; margin-bottom: 5px; align-items: center;">
            <a :href="currentUsername ? `https://www.ce-n.org/hui-yuan-purohuiru/${uniqueId}` : 'https://www.ce-n.org/'">戻る</a>
            <p style="font-size: .75em;" v-if="uniqueId">
              ようこそ!&nbsp;<strong>{{ currentUsername }}</strong>さん<br>
            </p>
            <span style="pointer-events: none;" v-if="uniqueId">
              合計得点: <strong style="color: goldenrod;">{{ currentTotalPoints ? currentTotalPoints : 0 }}</strong>
            </span>
          </div>
          <span style="font-weight: bold; color: DarkOrange; font-size: 1.3em;" v-if="uniqueId">合計100点で景品をゲット!(先着３名)</span>
          <hr>

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

      <div v-if="!chosenGame" class="game-menu">
          <h1>どのゲームで遊びますか</h1><br>
          <!-- <span>最終更新: 2024/5/31/20:00</span> -->
           <!-- <span>最終更新: 2024/6/11/19:45</span> -->
           <!-- <span>最終更新: 2024/6/12/19:00</span> -->
           <!-- <span>最終更新: 2024/6/13/11:30</span> -->
            <span>最終更新: 2024/6/13/12:00</span>
          <a href='/games/shinkei' @click="playGame('shinkei','北海道')">神経衰弱（北海道版）</a>
          <button @click="chosenGame = 'sorting'">ゴミ振り分けゲーム(北海道版)</button>
          <button @click="chosenGame = 'roulete'">毎日ルーレット</button>
          <button @click="playGame('bingo')">ビンゴ</button>
          <button @click="playGame('shinkei','京都')" disabled>神経衰弱（京都版）工事中</button>
          <button @click="chosenGame = 'sorting'" disabled>ゴミ振り分けゲーム(京都版)</button>
      </div>

      <div id="shinkei" v-if="chosenGame == 'shinkei'">

          <template v-if="showingManual">
              <div class="manual">
                <div class="flex-container" style="display:flex; justify-content: space-between;">
                  <button @click="startGame('北海道')">北海道版</button>
                  <button @click="startGame('京都')">京都版</button>
                </div>
                
                  <h4>神経衰弱 (しんけん すいじゃく) の遊び方</h4>

                  
                  <p>カードをタップして開こう</p>
                  <span>
                      まず、画面に表示されているカードの中から1枚をタップして開きます。                        
                  </span>

                  <p>王とえさの組み合わせを当てよう</p>
                  <span>目的は、王とそのえさの組み合わせを見つけること。正しいペアを見つけると、1ポイントがもらえます。</span>

                  <p>スペシャルカード</p>
                  <span>破壊カード (赤いカード) を開けてしまうと、1ポイント失います。</span>
                  <span>回復カードを見つけると、1ポイントがもらえます。</span>

                  <p>爆弾カードに気をつけて</p>
                  <span>爆弾カードを開けてしまうと、ゲームは即終了し、ポイントは-3になります。</span>

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

<script>

export default {
  name: 'App',
  data() {
            return {
                chosenGame: null,
                currentPoint: 0,
                items: [],
                cards: [],
                flippedCards: [],
                
                currentIndex: 0,
                canFlip: true,
                playArea: '北海道',
  
                isGameOver: false,
                showingManual: false,
  
                fetchedData: null, 
                loading: null,
  
                uniqueId: null,
                currentUserRow: null,
                currentUsername: null,
  
                currentTotalPoints: null,

                computedHref: null,
                
                hasPointsReached: null,
            };
        },
  
        methods: {
            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            playSound(path) {
            const audio = new Audio(path);
            audio.play();
            },

            playShinkei(){
                // this.playArea = area
                    if(this.playArea == '京都'){
                        this.items = [
                        {name: `フジバカマ` , group: 1, type: 'regular', imgSrc: './card-pics/kyoto-food-1.jpg'},
                        {name: `川魚` , group: 2, type: 'regular', imgSrc: './card-pics/kyoto-food-2.jpg'},
                        {name: `どんぐり` , group: 3, type: 'regular', imgSrc: './card-pics/kyoto-food-3.jpg'},
                        {name: `樹液` , group: 4, type: 'regular', imgSrc: './card-pics/kyoto-food-4.jpg'},
                        {name: `サワガニ` , group: 5, type: 'regular', imgSrc: './card-pics/kyoto-food-5.jpg'},
                        {name: `セミ` , group: 6, type: 'regular', imgSrc: './card-pics/kyoto-food-6.jpg'},
                        {name: `クモ` , group: 7, type: 'regular', imgSrc: './card-pics/kyoto-food-7.jpg'},

                        {name: `アサギマダラ` , group: 1, type: 'regular', imgSrc: './card-pics/kyoto-hunter-1.jpg'},
                        {name: `アカショウビン` , group: 2, type: 'regular', imgSrc: './card-pics/kyoto-hunter-2.jpg'},
                        {name: `ニホンザル` , group: 3, type: 'regular', imgSrc: './card-pics/kyoto-hunter-3.jpg'},
                        {name: `オオムラサキ` , group: 4, type: 'regular', imgSrc: './card-pics/kyoto-hunter-4.jpg'},
                        {name: `オオサンショウウオ` , group: 5, type: 'regular', imgSrc: './card-pics/kyoto-hunter-5.jpg'},
                        {name: `アオバズク` , group: 6, type: 'regular', imgSrc: './card-pics/kyoto-hunter-6.jpg'},
                        {name: `モリアオガエル` , group: 7, type: 'regular', imgSrc: './card-pics/kyoto-hunter-7.jpg'},

                        {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-1.jpg'},
                        {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-2.jpg'},
                        {name: `海水汚染` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-3.jpg'},

                        {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: './card-pics/kyoto-gameover.jpg'},

                        {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-1.jpg'},
                        {name: `省エネ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-2.jpg'},


                        ]
                    }
                    if(this.playArea == '北海道'){
                        this.items = [
                            {name: `オオワシ` , group: 1, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_6f16ae32a2734926bb164d4dfe2b6e3e~mv2.jpg'},
                            {name: `ねずみ<br>（オオワシ）`,group: 1, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_a7498435df98422b859d403a85cef13f~mv2.jpg'},

                            {name: `ツル` ,group: 2, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_7510c7c944184a2696cc59e3406cd56f~mv2.jpg'},
                            {name: `みみず<br>（ツル）`,group: 2, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_0c71945a9fbf43568d9378ced8fcc6de~mv2.jpg'},

                            {name: `クマ` ,group: 3, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_5a66047942a54ed1838fbf4b607dd01e~mv2.jpg'},
                            {name: `どんぐり<br>（クマ）`,group: 3, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_793ca946081e483cb8a6d5d77506e827~mv2.jpg'},

                            {name: `クワガタ` ,group: 4, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_e52afa786a794460bac9d8b2b307355a~mv2.jpg'},
                            {name: `じゅえき<br>（クワガタ）`,group: 4, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_74d4da3493234020b90401259139016f~mv2.jpg'},

                            {name: `イトウ` ,group: 5, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_2ba3a8e0cdc849a98b0c6f3b0ae049dd~mv2.jpg'},
                            {name: `どじょう<br>（イトウ）`,group: 5, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_16b8345030ff419caaea4b95e64b3b26~mv2.jpg'},

                            {name: `エゾモモンガ` ,group: 6, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_87a731881a8849f1aab4651b9c059d70~mv2.jpg'},
                            {name: `くさやはっぱ<br>（エゾモモンガ）`,group: 6, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_ca38ab9fee984b34b748f9ea0447d5de~mv2.jpg'},

                            {name: `シマエナガ` ,group: 7, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_91fefcee2f6b4829aa0bc70a7a52985b~mv2.jpg'},
                            {name: `くだもの<br>(シマエナガ)`,group: 7, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_ef7d0288db604e83a0ec5e6db766003b~mv2.jpg'},

                            {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: 'https://static.wixstatic.com/media/db1732_ef0fd76958f844db82fd0c86cc270a8b~mv2.jpg'},
                            {name: `海水汚染` ,group: null, type: 'destructive', imgSrc: 'https://static.wixstatic.com/media/db1732_402067a9860f45bba3e2e079406216f2~mv2.jpg'},
                            {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: 'https://static.wixstatic.com/media/db1732_c1a9f328c0f74ad2b9014961d8855f28~mv2.jpg'},
                            {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: 'https://static.wixstatic.com/media/db1732_810a547dd6634ec3bf7b44c41d1edcce~mv2.jpg'},

                            {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: 'https://static.wixstatic.com/media/db1732_9dd0c7e378f54013ac0166d5eb605b60~mv2.jpg'},
                            {name: `省エネ` ,group: null, type: 'beneficial', imgSrc: 'https://static.wixstatic.com/media/db1732_19231290e2fb4f898a955326faa3643a~mv2.jpg'},
                        ]
                    }
                    
                    this.resetGame()
            },
            
            playGame(game,area){
                // this.chosenGame = game
                console.log(area)

                if(this.chosenGame == 'shinkei'){
                    if(!area) return

                    this.playArea = area
                    if(this.playArea == '京都'){
                        this.items = [
                        {name: `フジバカマ` , group: 1, type: 'regular', imgSrc: './card-pics/kyoto-food-1.jpg'},
                        {name: `川魚` , group: 2, type: 'regular', imgSrc: './card-pics/kyoto-food-2.jpg'},
                        {name: `どんぐり` , group: 3, type: 'regular', imgSrc: './card-pics/kyoto-food-3.jpg'},
                        {name: `樹液` , group: 4, type: 'regular', imgSrc: './card-pics/kyoto-food-4.jpg'},
                        {name: `サワガニ` , group: 5, type: 'regular', imgSrc: './card-pics/kyoto-food-5.jpg'},
                        {name: `セミ` , group: 6, type: 'regular', imgSrc: './card-pics/kyoto-food-6.jpg'},
                        {name: `クモ` , group: 7, type: 'regular', imgSrc: './card-pics/kyoto-food-7.jpg'},

                        {name: `アサギマダラ` , group: 1, type: 'regular', imgSrc: './card-pics/kyoto-hunter-1.jpg'},
                        {name: `アカショウビン` , group: 2, type: 'regular', imgSrc: './card-pics/kyoto-hunter-2.jpg'},
                        {name: `ニホンザル` , group: 3, type: 'regular', imgSrc: './card-pics/kyoto-hunter-3.jpg'},
                        {name: `オオムラサキ` , group: 4, type: 'regular', imgSrc: './card-pics/kyoto-hunter-4.jpg'},
                        {name: `オオサンショウウオ` , group: 5, type: 'regular', imgSrc: './card-pics/kyoto-hunter-5.jpg'},
                        {name: `アオバズク` , group: 6, type: 'regular', imgSrc: './card-pics/kyoto-hunter-6.jpg'},
                        {name: `モリアオガエル` , group: 7, type: 'regular', imgSrc: './card-pics/kyoto-hunter-7.jpg'},

                        {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-1.jpg'},
                        {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-2.jpg'},
                        {name: `海水汚染` ,group: null, type: 'destructive', imgSrc: './card-pics/kyoto-bad-3.jpg'},

                        {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: './card-pics/kyoto-gameover.jpg'},

                        {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-1.jpg'},
                        {name: `省エネ` ,group: null, type: 'beneficial', imgSrc: './card-pics/kyoto-bad-2.jpg'},


                        ]
                    }
                    if(this.playArea == '北海道'){
                        this.items = [
                            {name: `オオワシ` , group: 1, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_6f16ae32a2734926bb164d4dfe2b6e3e~mv2.jpg'},
                            {name: `ねずみ<br>（オオワシ）`,group: 1, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_a7498435df98422b859d403a85cef13f~mv2.jpg'},

                            {name: `ツル` ,group: 2, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_7510c7c944184a2696cc59e3406cd56f~mv2.jpg'},
                            {name: `みみず<br>（ツル）`,group: 2, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_0c71945a9fbf43568d9378ced8fcc6de~mv2.jpg'},

                            {name: `クマ` ,group: 3, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_5a66047942a54ed1838fbf4b607dd01e~mv2.jpg'},
                            {name: `どんぐり<br>（クマ）`,group: 3, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_793ca946081e483cb8a6d5d77506e827~mv2.jpg'},

                            {name: `クワガタ` ,group: 4, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_e52afa786a794460bac9d8b2b307355a~mv2.jpg'},
                            {name: `じゅえき<br>（クワガタ）`,group: 4, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_74d4da3493234020b90401259139016f~mv2.jpg'},

                            {name: `イトウ` ,group: 5, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_2ba3a8e0cdc849a98b0c6f3b0ae049dd~mv2.jpg'},
                            {name: `どじょう<br>（イトウ）`,group: 5, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_16b8345030ff419caaea4b95e64b3b26~mv2.jpg'},

                            {name: `エゾモモンガ` ,group: 6, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_87a731881a8849f1aab4651b9c059d70~mv2.jpg'},
                            {name: `くさやはっぱ<br>（エゾモモンガ）`,group: 6, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_ca38ab9fee984b34b748f9ea0447d5de~mv2.jpg'},

                            {name: `シマエナガ` ,group: 7, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_91fefcee2f6b4829aa0bc70a7a52985b~mv2.jpg'},
                            {name: `くだもの<br>(シマエナガ)`,group: 7, type: 'regular', imgSrc: 'https://static.wixstatic.com/media/db1732_ef7d0288db604e83a0ec5e6db766003b~mv2.jpg'},

                            {name: `森林伐採` ,group: null, type: 'destructive', imgSrc: 'https://static.wixstatic.com/media/db1732_ef0fd76958f844db82fd0c86cc270a8b~mv2.jpg'},
                            {name: `海水汚染` ,group: null, type: 'destructive', imgSrc: 'https://static.wixstatic.com/media/db1732_402067a9860f45bba3e2e079406216f2~mv2.jpg'},
                            {name: `動物との<br>交通事故` ,group: null, type: 'destructive', imgSrc: 'https://static.wixstatic.com/media/db1732_c1a9f328c0f74ad2b9014961d8855f28~mv2.jpg'},
                            {name: `隕石到来` ,group: null, type: 'bomb', imgSrc: 'https://static.wixstatic.com/media/db1732_810a547dd6634ec3bf7b44c41d1edcce~mv2.jpg'},

                            {name: `エコバッグ` ,group: null, type: 'beneficial', imgSrc: 'https://static.wixstatic.com/media/db1732_9dd0c7e378f54013ac0166d5eb605b60~mv2.jpg'},
                            {name: `省エネ` ,group: null, type: 'beneficial', imgSrc: 'https://static.wixstatic.com/media/db1732_19231290e2fb4f898a955326faa3643a~mv2.jpg'},
                        ]
                    }
                    
                    this.resetGame()

                }else if(this.chosenGame == 'sorting'){
                    this.currentPoint = 0
                }else if(this.chosenGame == 'bingo'){
                    this.bingoList = this.bingoList.map(() => ({ task: '', isFinished: false, isColored: false }));
                    this.mixList();
                }

            },
            getCardStyle(card) {
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
            },

            shuffle(array) {
                  for (let i = array.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [array[i], array[j]] = [array[j], array[i]];
                  }
                  return array;
              },
            async flipCard(index) {
                  if(this.isGameOver) return
                  if (this.cards[index].flipped || this.cards[index].matched) {
                      return;
                  }
  
                  this.playSound('https://static.wixstatic.com/mp3/db1732_ffc2595b2a0d4d4494528b3d895d5d0c.wav');
  
                  if(this.cards[index].data.type !== 'regular'){
                      this.cards[index].matched = true
                      if(this.cards[index].data.type == 'destructive'){
                          this.currentPoint--
                      }else if(this.cards[index].data.type == 'beneficial'){
                          this.currentPoint++
                      }else if(this.cards[index].data.type == 'bomb'){
                          this.currentPoint = this.currentPoint -3
                          this.gameOver()
                      }
                      return
                  }
  
                  this.cards[index].flipped = true;
                  this.flippedCards.push(index);
  
                  if (this.flippedCards.length === 2) {
                      this.canFlip = false
                      this.checkMatch();
                      
                  }
              },
              async gameOver(){
                  this.isGameOver = true
                  await this.updatePoints(this.currentPoint)

                  if(!this.hasPointsReached && this.currentTotalPoints >= 50){
                    await this.updateTimestamp()
                    alert(`合計５０点到達おめでとうございます！\n\n先着３名に景品（〇〇カーをプレゼントいたしますので、住所を登録してください！）`)
                    window.location.href = 'https://www.ce-n.org/originalcard';
                  }
              },
              async checkMatch() {
                  await this.sleep(1000);
                  const [firstIndex, secondIndex] = this.flippedCards;
                  const firstCard = this.cards[firstIndex];
                  const secondCard = this.cards[secondIndex];
  
                  if (firstCard.data.group === secondCard.data.group) {
                      firstCard.matched = true;
                      secondCard.matched = true;
                      this.canFlip = true
                      this.currentPoint+= 1
  
                      this.checkGameStatus()
                  } else {
                      firstCard.flipped = false;
                      secondCard.flipped = false;
                      this.canFlip = true
                      this.playSound('https://static.wixstatic.com/mp3/db1732_b789dfd0cb414130bfe9fa02df24fddd.wav');
                  }
                  this.flippedCards = [];
              },
              checkGameStatus(){
                  let allRegularMatched = this.cards
                      .filter(card => card.data.type === 'regular')
                      .every(card => card.matched);
  
                  if(allRegularMatched) this.gameOver()
              },
              resetGame() {
                  this.showingManual = true
                  this.isGameOver = false
                  this.canFlip = false
  
                  this.flippedCards = [];
  
                  this.cards = this.shuffle(this.items.map(name => ({
                      data: name,
                      flipped: false,
                      matched: false
                  })));
  
                  this.currentPoint = 0
              },
              async startGame(location){
                // this.playGame()
                this.playArea = location
                this.playShinkei()
                  this.incrementShinkei()
                  this.showingManual = false
                  await this.sleep(500);
                  this.playSound('https://static.wixstatic.com/mp3/db1732_ffc2595b2a0d4d4494528b3d895d5d0c.wav');
  
                  for (let i in this.cards) {
                      let card = this.cards[i]
                      if (card.data.type === 'destructive' || card.data.type === 'bomb') {
                          card.flipped = true;
                          card.matched = true;
                      }
                  }
                  await this.sleep(1000);
                  this.playSound('https://static.wixstatic.com/mp3/db1732_b789dfd0cb414130bfe9fa02df24fddd.wav');
  
                  for (let i in this.cards) {
                      let card = this.cards[i];
                          card.flipped = false;
                          card.matched = false;
                      this.canFlip = true
                  }
              },
  
              getParams() {
                  const urlParams = new URLSearchParams(window.location.search);
  
                  this.uniqueId = urlParams.get('uniqueId');
  
                //   const tempGameMode = urlParams.get('gameMode')
                  this.chosenGame = 'shinkei'
                  this.showingManual = true
                //   if(!tempGameMode) return
  
                //   if(tempGameMode == 'shinkei') this.playGame('shinkei','京都')
              },
              async findMe(){
                  this.loading = true;
                  try {
                      const URL =`https://www.ce-n.org/_functions/findMe?id=${this.uniqueId}`
                      console.log(URL)
                      const response = await fetch(URL);
                      const result = await response.json();

                      if(result.message) {
                        console.log(`Ntot found`)
                        this.uniqueId = null
                      }
                      console.log(result)
                      this.currentUserRow = result;
                      this.currentUsername = this.currentUserRow?.text4
                      this.currentTotalPoints = this.currentUserRow.totalPoints
                      this.hasPointsReached = this.currentUserRow?.hasPointsReached
  
                      
                  } catch (error) {
                      console.error('Error fetching data:', error);
                  } finally {
                      this.computedHref = this.uniqueId ? `https://www.ce-n.org/hui-yuan-purohuiru/${this.uniqueId}` : 'https://www.ce-n.org/';
                      this.loading = false;
                  }
              },
              async fetchData(url) {
                try {
                    const response = await fetch(url, { method: 'GET' });

                    if (!response.ok) {
                    throw new Error('Network response was not ok');
                    }

                    return await response.json();
                } catch (error) {
                    console.error('Fetch error:', error);
                    throw error; 
                }
            },

            async incrementShinkei() {
                let finalId = this.uniqueId ? this.uniqueId : '8c3c2de0-70a9-48a1-9a17-ff0568ecd88d';
                try {
                    const data = await this.fetchData(`https://www.ce-n.org/_functions/shinkeiIncrement?id=${finalId}`);
                    console.log('Shinkei playtime incremented:', data);
                } catch (error) {
                    console.error('Error incrementing shinkei playtime:', error);
                }
            },

            async updatePoints(number) {
                if(!this.uniqueId) return
                console.log('updating');
                try {
                    const data = await this.fetchData(`https://www.ce-n.org/_functions/updatePoints?id=${this.uniqueId}&increment=${number}`);
                    console.log('Shinkei point updated:', data);
                    this.currentTotalPoints = data[0].totalPoints;
                } catch (error) {
                    console.error('Error updating shinkei points:', error);
                }
            },

            async updateTimestamp() {
                if(!this.uniqueId) return
                console.log('updating timestamp');
                const currentTimestamp = Date.now();
                try {
                    const data = await this.fetchData(`https://www.ce-n.org/_functions/updateHasPointsReached?id=${this.uniqueId}&updatetime=${currentTimestamp}`);
                    console.log('Timestamp set:', data);
                    this.hasPointsReached = data[0].hasPointsReached;
                } catch (error) {
                    console.error('Error setting timestamp:', error);
                }
            },
        },
        async mounted() {
          console.clear()
          // this.chsosenGame = 'shinkei'
          this.getParams();

          if(this.uniqueId) await this.findMe()
        },
}
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
      padding: 0 15px;
      height: 45px;
      line-height: 45px;
      border-radius: 7px;
      font-weight: 400;
      font-size: 16px;
      background: #365E32;
      color: white;
      box-shadow: 0 4px 14px 0 rgb(0 0 0 / 10%);
      
  }

  /* ------------------------------------------ */



  #app #shinkei .grid {
      max-width: 98.5%;
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


</style>
