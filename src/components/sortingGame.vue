<template>

    <template v-if="!selectedCountry">
        <div class="cheatSheet">
            <h5>遊びたい国を選んでください</h5>
            <div class="selectingCountry">
                <ul>
                    <li v-for="(country, index) in countries" :key="country" 
                    :class="{ 'disabled': index >= 3 }" 
                    @click="selectedCountry = country">
                    {{ country }}
                </li>
                </ul>
            </div>
        </div>
    </template>
  
    <template v-else>
        <h5 :class="{ 'selectedCountry-info': currentPage !== 0 }">
            あなたは{{selectedCountry}}を選択しました。
        </h5>
        
    
        <template v-if="currentPage == 0">
            <div class="cheatSheet">
  
                <div class="flex-container">
                    <button style="margin-right: 10px; background-color: crimson;" @click="selectedCountry = null">戻る</button>
                    <button @click="startGame">ゲームスタート</button>
                </div>
  
                <template v-for="(items, category,index) in modifiedTrashItems" :key="category">
                    <div class="category-container" v-if="items.length > 0">
                        <h2 v-html="getTranslation(category)"></h2>
                        <div class="item-list">
                            <div v-for="item in items" :key="item.label" 
                            class="item" 
                                  :class="{ 'moved-item': item.hasMoved }"> <!-- Apply class if item has moved -->
                                <span v-if="item.symbolName" class="material-symbols-outlined">{{ item.symbolName }}</span>
                                <i v-else-if="item.iconName" :class="item.iconName"></i>
                                <span v-else class="material-symbols-outlined">help</span>
                                <p>{{ item.label }}</p>
                            </div>
                        </div>
                        <hr v-if="!isLastCategory(index)">
                    </div>
                </template>
                
                
            </div>
        </template>
  
        <template v-if="currentPage == 1">
            <div class="tile-container">
                <div class="detail">
                    <div>
                        ミス: {{currentPoints}}
                    </div>
                    <div class="timer" ><i class="fa-regular fa-clock" style="margin-right: 5px;"></i>{{ formattedTimer }}</div>
                    <div>
                        {{currentTileIndex}}/{{tiles?.length}}
                    </div>
                    
                </div>
                <template  v-if="currentPage == 1">
                  <div  v-for="(tile, index) in tiles" :key="tile.id" 
                      :class="['tile', 'white', { 'swiped': isSwiped }]"
                      :style="{ 
                          width: tile.id === flyAwayTile ? '0px' : '',
                          height: tile.id === flyAwayTile ? '0px' : '',
                          transform: getTransform(tile, index),
                          zIndex: tiles.length - index, 
                          transition: index === currentTileIndex && tile.id !== flyAwayTile && isSwiping ? 'unset' : '.4s ease-in-out',
                          display: index < currentTileIndex ? 'none' : ''
                      }"
                      @mousedown="startSwipe"
                      @mousemove="moveSwipe"
                      @mouseup="endSwipe"
                      @mouseleave="endSwipe"
                      @touchstart="startSwipe"
                      @touchmove="moveSwipe"
                      @touchend="endSwipe">
                      <span v-if="tile.symbolName" class="material-symbols-outlined">{{tile.symbolName}}</span>
                      <i v-else-if="tile.iconName" :class="tile.iconName"></i>
                      <span v-else class="material-symbols-outlined">help</span>
                      <p>{{ tile.label }}</p>
                  </div>
                </template>
                <div class="areas-container" v-if="currentTileIndex !== tiles?.length">
                    <template v-if="selectedCountry == '中国'">
                        <div class="trash-can-container">
                            <img src="https://static.wixstatic.com/media/db1732_b1cf89c71b854beeaf53416161b70d9a~mv2.png">
                            <br>
                            <span>危険物</span>
                        </div>
                        <div class="trash-can-container">
                            <img src="https://static.wixstatic.com/media/db1732_b1cf89c71b854beeaf53416161b70d9a~mv2.png">
                            <br>
                            <span>リサイクル</span>
                        </div>
                        <div class="trash-can-container">
                            <img src="https://static.wixstatic.com/media/db1732_b1cf89c71b854beeaf53416161b70d9a~mv2.png">
                            <br>
                            <span>湿ごみ</span>
                        </div>
                        <div class="trash-can-container">
                            <img src="https://static.wixstatic.com/media/db1732_b1cf89c71b854beeaf53416161b70d9a~mv2.png">
                            <br>
                            <span>干ごみ</span>
                        </div>
  
  
                    </template>
                    <template v-else-if="selectedCountry == 'アメリカ'">
                        <img style="display: none;">
                        <img src="https://static.wixstatic.com/media/db1732_2b32170ff6014ca896a57c4f0b23ba09~mv2.png">
                        <img style="display: none;">
                        <img style="display: none;">
                        <img src="https://static.wixstatic.com/media/db1732_9ac022debeb1483b92d118cf73fffc51~mv2.png">
                    </template>
                        
                    <template v-else>
                        <img src="https://static.wixstatic.com/media/db1732_166538de5cbd4c81b4078953645142a4~mv2.png">
                        <img src="https://static.wixstatic.com/media/db1732_2b32170ff6014ca896a57c4f0b23ba09~mv2.png">
                        <img src="https://static.wixstatic.com/media/db1732_8100bacaf7c0433e946099db26147af3~mv2.png">
                        <img src="https://static.wixstatic.com/media/db1732_9eec8c63a54c41a0b4666486d61d921b~mv2.png">
                    </template>
                </div>
            </div>
        </template>
  
        <template v-if="currentPage == 2">
            <div class="result">
                <div>
                    <h2>合計:<mark>{{currentPoints + bonusPoints + completeBonus}}</mark>点</h2>
                    <hr>
                    <small style="font-weight: unset; display: block; text-align: right;">
                        まちがい<mark>{{currentPoints}}</mark>点<br>
                        スピードボーナス<mark>+{{bonusPoints}}</mark>点<br>
                        かんりょうボーナス<mark>+{{completeBonus}}</mark>点
                    </small>
                    <hr>
                    
                    <button @click="startGame">リスタート</button>
                    <br>
                    <button style="background-color: #2ecc71;" @click="currentPage = 0; selectedCountry = null">他の国でチャレンジ！</button>
                </div>
            </div>
        </template>
    </template>
  
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  
  const selectedCountry = ref(null);
  const countries = ref(['日本', 'アメリカ', '中国','ドイツ','インドネシア','オーストラリア','ケニア','ブラジル']);
  const currentPage = ref(null);
  const tiles = ref(null);
  const startX = ref(0);
  const startY = ref(0);
  const moveX = ref(0);
  const moveY= ref(0);
  
  const isSwiping = ref(false);
  const isSwiped = ref(false);
  const flyAwayTile = ref(null);
  
  const currentPoints = ref(0);
  const bonusPoints = ref(0);
  const completeBonus = ref(5);
  const currentTileIndex = ref(0);
  const timer = ref(0);
  // const defaultTime = ref(4);
  const timerInterval = ref(null);
  
  const trashItems = ref({
                  burnable: [
                      {   label: '紙', symbolName: 'description', 
                          rules: [{ country: 'アメリカ', changeTo: 'recycle' },
                              { country: '中国', changeTo: 'recycle' }
                          ] },
                      {   label: '衣類', symbolName: 'apparel', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'recycle' }
                          ] },
                      {   label: '食べ残し', iconName: 'fa-solid fa-pizza-slice', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'wetTrash' }
                          ]},
                      {   label: '雑草', iconName: 'fa-brands fa-pagelines', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'wetTrash' }
                          ]},
                      {   label: '写真', symbolName: 'image', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                      {   label: '抜けた歯', symbolName: 'dentistry', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'wetTrash' }
                          ]},
                      {   label: 'マスク', symbolName: 'medical_mask', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                      {   label: '野球', iconName: 'fa-solid fa-baseball', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                      {   label: '絆創膏', iconName: 'fa-solid fa-bandage', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ] },
                      {   label: '手袋', iconName: 'fa-solid fa-mitten', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                      {   label: 'しんだ虫', iconName: 'fa-solid fa-mosquito', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'wetTrash' }
                          ]},
                      {   label: '鉛筆', iconName: 'fa-solid fa-pencil', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                  ],
                  
                  plastic: [
                      {   label: 'レジ袋', iconName: 'bag-shopping', symbolName: 'shopping_bag', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ] },
                      {   label: 'スポンジ', iconName: 'fa-solid fa-soap', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ] },
                      {   label: 'ハンガー', symbolName: 'checkroom', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ] },
                      {   label: 'ファイル', symbolName: 'folder_open', 
                          rules: [{ country: 'アメリカ', changeTo: 'recycle' },
                              { country: '中国', changeTo: 'recycle' }
                          ] },
                      {   label: 'バケツ', iconName: 'fa-solid fa-bucket', 
                          rules: [{ country: 'アメリカ', changeTo: 'recycle' },
                              { country: '中国', changeTo: 'recycle' }
                          ] },
                      {   label: '目薬', iconName: 'fa-solid fa-eye-dropper', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ] },
                  ],
                  // ],
                  bottle: [
                      {   label: 'びん', iconName: 'fa-solid fa-bottle-droplet', 
                          rules: [{ country: 'アメリカ', changeTo: 'recycle' },
                              { country: '中国', changeTo: 'recycle' }
                          ]},
                      {   label: 'ボトル', iconName: 'fa-solid fa-bottle-water', 
                          rules: [{ country: 'アメリカ', changeTo: 'recycle' },
                              { country: '中国', changeTo: 'recycle' }
                          ]},
                      {   label: '缶', 
                          rules: [{ country: 'アメリカ', changeTo: 'recycle' },
                              { country: '中国', changeTo: 'recycle' }
                          ]},
                  ],
                  recycle: [
                      {   label: '新聞', symbolName: 'newspaper'},
                      {   label: 'コップ', symbolName: 'glass_cup', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                      {   label: '紙パック', iconName: 'fa-solid fa-layer-group'},
                      {   label: '乾電池', symbolName: 'battery_change', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'danger' }
                          ]},
                      {   label: '刃物', symbolName: 'restaurant', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'danger' }
                          ]},
                      {   label: 'テレビ', symbolName: 'tv', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'danger' }
                          ]},
                      {   label: '時計', symbolName: 'watch', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'danger' }
                          ]},
                      {   label: '電球', iconName: 'fa-regular fa-lightbulb', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'danger' }
                          ]},
                      {   label: '鍵', iconName: 'fa-solid fa-key', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'danger' }
                          ]},
                      {   label: 'ダンボール', iconName: 'fa-solid fa-map'},
                      // {   label: 'コントローラー', symbolName: 'stadia_controller', 
                      //     rules: [{ country: 'アメリカ', changeTo: 'other' },
                      //         { country: '中国', changeTo: 'danger' }
                      //     ]},
                      {   label: 'じゅうたん', iconName: 'fa-solid fa-rug', 
                          rules: [{ country: 'アメリカ', changeTo: 'other' },
                              { country: '中国', changeTo: 'dryTrash' }
                          ]},
                  ],
  });
  
  onMounted(() => {
      currentPage.value = 0;
  });
  
  watch(currentPage, (newPage) => {
    const appElement = document.getElementById('app');
    if (newPage === 0) {
        // Apply styles if currentPage is 0
        appElement.style.display = 'block';
        appElement.style.marginTop = '20px';
    } else {
        // Remove styles if currentPage is not 0
        appElement.style.display = '';
        appElement.style.marginTop = '';
    }
  });
  
  const formattedTimer = computed(() => timer.value.toFixed(1));
  
  const modifiedTrashItems = computed(() => {
    if (!selectedCountry.value) {
      return trashItems.value; // Return original data if no country is selected
    }
  
    const updatedItems = JSON.parse(JSON.stringify(trashItems.value));
    const movedItems = new Set(); // Track moved items
  
    Object.keys(updatedItems).forEach(category => {
        updatedItems[category] = updatedItems[category].map(item => {
            if (movedItems.has(item.label)) {
                return item; // Skip already moved items
            }
  
            if (item.rules) {
                const countryRule = item.rules.find(rule => rule.country === selectedCountry.value);
                if (countryRule && countryRule.changeTo !== category) {
                    // console.log(`Changing ${item.label} from ${category} to ${countryRule.changeTo} for ${selectedCountry.value}`);
  
                    const newCategory = countryRule.changeTo;
  
                    if (!updatedItems[newCategory]) {
                        updatedItems[newCategory] = []; // Create new category if needed
                    }
  
                    // Add the item to the new category and mark it as moved
                    const movedItem = { ...item, hasMoved: true }; // Add `hasMoved` property
                    updatedItems[newCategory].push(movedItem);
                    movedItems.add(item.label); // Track the moved item
  
                    return null; // Remove from the original category
                }
            }
  
            return { ...item, hasMoved: false }; // Mark non-moved items
        });
  
        updatedItems[category] = updatedItems[category].filter(item => item !== null); // Remove moved items
    });
    return updatedItems;
  });
  
  const isLastCategory = computed(() => (index) => 
      index === Object.keys(modifiedTrashItems.value).length - 1
  );
  
  const startGame = () =>{
    currentPage.value = 1
    currentPoints.value = 0 
    tiles.value = generateRandomTiles(15)
    currentTileIndex.value = 0
    bonusPoints.value = 0
    startTimer();
    console.log(tiles.value)
    console.log(modifiedTrashItems.value)
  };
  
  const generateRandomTiles = (count) =>{
    const allItems = Object.keys(modifiedTrashItems.value).flatMap(category => 
        modifiedTrashItems.value[category].map(item => ({
            ...item,
            category // Include the category in each item
        }))
    );
  
    // Generate random tiles
    const tiles = [];
    for (let i = 0; i < count; i++) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        tiles.push({
            id: i + 1,
            ...randomItem
        });
    }
  
    return tiles;
  };
  
  const getFlyAwayDirection = (category) => {
    if(selectedCountry.value == 'アメリカ'){
    switch (category) {
        case 'recycle': return { x: 75, y: -100, rotate: 45, };
        case 'other': return { x: 75, y: 250, rotate: 45, };
    }
    }else if (selectedCountry.value == '中国'){
    console.log(`here-------`)
    switch (category) {
        case 'danger': return { x: 210, y: 75, rotate: 45, };
        case 'wetTrash': return { x: -60, y: 75, rotate: -45, };
        case 'dryTrash': return { x: 75, y: 250, rotate: 45, };
        case 'recycle': return { x: 75, y: -100, rotate: 45, };
    }
    }else {
    switch (category) {
        case 'burnable': return { x: 210, y: 75, rotate: 45, };
        case 'plastic': return { x: -60, y: 75, rotate: -45, };
        case 'bottle': return { x: 75, y: 250, rotate: 45, };
        case 'recycle': return { x: 75, y: -100, rotate: 45, };
    }
    }
  };
  
  const startSwipe = (event) => {
    if (event.type.startsWith('mouse') && event.button !== 0) return;
    isSwiping.value = true;
    const point = event.touches ? event.touches[0] : event;
    startX.value = point.clientX;
    startY.value = point.clientY;
  };
  
  const moveSwipe = (event) => {
    if (!isSwiping.value) return;
    event.preventDefault();
    const point = event.touches ? event.touches[0] : event;
    moveX.value = point.clientX - startX.value;
    moveY.value = point.clientY - startY.value;
  };
  
  const startTimer = () => {
    timer.value = tiles.value.length * 3;
    clearInterval(timerInterval.value);
    timerInterval.value = setInterval(() => {
        timer.value = Math.max(0, timer.value - 0.1);
        if (timer.value === 0) {
            clearInterval(timerInterval.value);
        }
    }, 100);
  };
  
  const endSwipe = () => {
    if (!isSwiping.value && timer.value > 0) return;
  
                  
    const threshold = 100;
    const minMove = 50;
    const currentCategory = tiles.value[currentTileIndex.value].category;
    let success = false;
  
    if (Math.abs(moveX.value) > minMove || Math.abs(moveY.value) > minMove) {
        if (Math.abs(moveX.value) > Math.abs(moveY.value)) {
            if (Math.abs(moveX.value) > threshold) {
                if (moveX.value > 0 && currentCategory === 'burnable') {
                    success = true;
                } else if (moveX.value < 0 && currentCategory === 'plastic') {
                    success = true;
                }
            }
        }else {
            if (Math.abs(moveY.value) > threshold) {
                if (moveY.value < 0 && currentCategory === 'recycle') {
                    success = true;
                }else if (moveY.value > 0 && currentCategory === 'other' && selectedCountry.value == 'アメリカ') {
                    success = true;
                }else if (moveY.value > 0 && currentCategory === 'bottle') {
                    success = true;
                }
            }
        }
  
        if(selectedCountry.value == '中国'){
            if (Math.abs(moveX.value) > Math.abs(moveY.value)) {
                if (Math.abs(moveX.value) > threshold) {
                    if (moveX.value > 0 && currentCategory === 'danger') {
                        success = true;
                    } else if (moveX.value < 0 && currentCategory === 'wetTrash') {
                        success = true;
                    }
                }
            }else {
                if (Math.abs(moveY.value) > threshold) {
                    if (moveY.value < 0 && currentCategory === 'recycle') {
                        success = true;
                    }else if (moveY.value > 0 && currentCategory === 'dryTrash') {
                        success = true;
                    }
                }
            }
        }
  
        if (success) {
            document.body.style.backgroundColor = 'forestGreen';
            flyAwayTile.value = tiles.value[currentTileIndex.value].id;
            isSwiped.value = true;
  
            setTimeout(() => {
                currentTileIndex.value++;
                flyAwayTile.value = null;
                isSwiped.value = false;
                
            }, 400);
        } else {
            document.body.style.backgroundColor = 'red';
            currentPoints.value = currentPoints.value - 1;
        }
  
        if (success && currentTileIndex.value == tiles.value.length-1) {
            document.body.style.backgroundColor = 'yellow';
            clearInterval(timerInterval.value);
            bonusPoints.value = Math.floor(timer.value);
            currentPage.value =2
        }
  
        setTimeout(() => {
            document.body.style.backgroundColor = '#f0f0f0';
        }, 300);
    }
  
    isSwiping.value = false;
    moveX.value = 0;
    moveY.value = 0;
  
  };
  
  const getTransform = (tile, index) => {
    const adjustedIndex = index - currentTileIndex.value;
    if (adjustedIndex === 0 && isSwiping.value) {
      return `translate(${moveX.value}px, ${moveY.value}px) rotate(${moveX.value * 0.1}deg)`;
    }
    if (tile.id === flyAwayTile.value) {
      const direction = getFlyAwayDirection(tile.category);
      return `translate(${direction.x}px, ${direction.y}px) rotate(${direction.rotate}deg)`;
    }
    const rotation = adjustedIndex * 5
    return `scale(${1 - adjustedIndex * 0.05}) translateY(${-adjustedIndex * 10}px) rotate(${rotation}deg)`;
  };
  
  const getTranslation = (name) => {
    switch (name) {
        case 'burnable':
            return 'もえるゴミ';
        case 'plastic':
            return 'プラスチック';
        case 'bottle':
            return 'しげんゴミ';
        case 'recycle':
            return 'リサイクル';
        case 'other':
            return 'その他';
        case 'wetTrash':
            return '湿ごみ';
        case 'dryTrash':
            return '干ごみ';
        case 'danger':
            return '危険物';
        default:
            return 'その他';
    }
  };
  </script>
  
  <style>
    body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        transition: all .25s ease-in-out;
  
        overflow: hidden;
    }
  
    #app {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100dvh;
        max-width: 100dvw;
        transition: background-color 0.3s ease;
    }
  
    .selectingCountry ul{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        justify-content: space-between;
        column-gap: 10px;
        row-gap: 20px;
  
        list-style: none;
        padding: 0;
    }
  
    .selectingCountry ul li{
        display: inline-block;
        padding: 1em 0em; /* Padding for the badge */
        font-size: 0.875em; /* Slightly smaller font */
        font-weight: 600; /* Bold text */
        color: white; /* Text color */
        background-color: #2ecc71;; /* Background color (blue) */
        border-radius: 12px; /* Rounded corners */
        text-align: center; /* Center text */
        vertical-align: middle; /* Align the badge in the middle */
        line-height: 1;
  
        cursor: pointer;
    }
  
    .disabled {
        pointer-events: none;
        user-select: none;
        opacity: 0.4;
    }
  
    button{
        background-color: #3498db; /* Primary color */
        color: white; /* Text color */
        border: none; /* Remove default border */
        border-radius: 4px; /* Rounded corners */
        padding: 8px 15px; /* Padding */
        font-size: 16px; /* Font size */
        cursor: pointer; /* Pointer cursor on hover */
        transition: background-color 0.3s, transform 0.2s; /* Smooth transitions */
    }
  
    h5{
        text-align: center;
        margin: 12.5px auto;
    }
  
    .selectedCountry-info{
        position: absolute;
        top: 0%;
        left: 50%;
        transform: translate(-50%, 0%);
  
        width: 100%;
    }
  
    .cheatSheet{
        width: 95%;
        max-width: 500px;
  
        margin: auto;
  
        text-align: center;
    }
  
    .cheatSheet .category-container h2{
        color: crimson;
        margin: 8px 0;
        text-align: left;
  
        display: flex;
        align-items: center;
        gap: 2.5px;
  
        font-size: 1.2em;
    }
  
    .cheatSheet .category-container h2 img{
        width: 40px;
    }
  
    .cheatSheet .category-container .item-list{
        display: grid;
        grid-template-columns: repeat(6,1fr);
        justify-content: space-between;
        row-gap: 5px;
    }
  
    .moved-item {
        animation: highlightMove 1.5s ease infinite;
        background-color: yellow; /* Example effect: background color change */
        border-radius: 50%;
        transition: all .1s ease-in-out;
    }
  
    @keyframes highlightMove {
        0% {
            transform: scale(1.1);
        }
        50% {
            transform: scale(1.05);
            background-color: #ffeb3b; /* Brighter yellow during transition */
        }
        100% {
            transform: scale(1);
            background-color: #fff; /* Back to white */
        }
    }
  
    .cheatSheet .category-container .item-list .item{
        width: 50px;
        text-align: center;
    }
  
    .cheatSheet .category-container .item-list .item span,
    .cheatSheet .category-container .item-list .item i{
        font-size: 30px;
        display: block;
        margin: auto;
    }
  
    .cheatSheet .category-container .item-list .item p{
        font-size: .7em;
        margin-top: 5px;
        margin-bottom: 0;
        line-height: 1.2;
        text-wrap: nowrap;
    }
  
    /* ------------------------------------------------------------------- */
  
    .tile-container {
        position: relative;
        width: 125px;
        height: 125px;
    }
    .tile {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 10px;
  
        display: grid;
        justify-content: center;
        align-content: center;
        align-items: center;
        gap: 10px;
  
        text-align: center;
  
        font-size: 18px;
        color: black;
        background-color: white;
        user-select: none;
        border: 2px solid black;
  
        transition: all .5s ease-in-out;
  
        overflow: hidden;
  
        container-type: inline-size;
    }
  
    .tile span,
    .tile i{
        font-size: 30cqw;
        display: block;
        margin: auto;
    }
  
    .tile p{
        font-size: 12.5cqw;
        display: block;
        margin: auto;
    }
    
    .swiped {
        transition: transform 0.3s ease;
    }
    
    .detail{
        user-select: none;
        pointer-events: none;
        
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translate(-50%, -225px);
  
        z-index: 100;
  
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        justify-content: space-between;
        align-items: center;
  
        text-align: center;
  
        width: 100%;
        min-width: 325px;
  
        font-weight: bold;
        font-size: 1.5em;
    }
  
    .result{
        font-weight: bold;
        text-align: center;
        font-size: 1.5em;
    }
  
    .result mark{
        background-color: unset;
        font-size: 1.5em;
        color: crimson;
        margin-left: 5px;
  
    }
  
    .result button{
        margin-top: 20px;
    }
  
    .timer {
        font-size: 24px;
        font-weight: bold;
        color: black;
    }
  
    .areas-container img{
        user-select: none;
        pointer-events: none;
        position: absolute;
  
        width: 90px;
        height: auto;
    }
    .areas-container img:nth-child(1),
    .areas-container img:nth-child(3){
        top: 50%;
    }
  
    .areas-container img:nth-child(2),
    .areas-container img:nth-child(4){
        left: 50%;
    }
    
    .areas-container img:nth-child(1){
        left: 50%;
        transform: translate(85px,-50%);
    }
  
    .areas-container img:nth-child(3){
        right: 50%;
        transform: translate(-85px,-50%);
    }
  
    .areas-container img:nth-child(2){
        top: 50%;
        transform: translate(-50%,-215px);
    }
  
    .areas-container img:nth-child(4){
        bottom: 50%;
  
        transform: translate(-50%,215px);
    }
  
    .areas-container img:nth-child(5){
        left: 50%;
        bottom: 50%;
  
        transform: translate(-50%,215px);
    }
  
    .areas-container .trash-can-container{
        position: absolute;
  
        text-align: center;
    }
  
    .areas-container .trash-can-container span{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
  
        padding: 5px;
  
        background-color: lightgrey;
        font-weight: bold;
        color: crimson;
        text-wrap: nowrap;
    }
  
    .areas-container .trash-can-container:nth-child(1){
        top: 50%;
        left: 50%;
        transform: translate(85px,-50%);
    }
  
    .areas-container .trash-can-container:nth-child(2){
        top: 50%;
        left: 50%;
        transform: translate(-50%,-215px);
    }
  
    .areas-container .trash-can-container:nth-child(3){
        top: 50%;
        right: 50%;
        transform: translate(-85px,-50%);
    }
  
    .areas-container .trash-can-container:nth-child(4){
        left: 50%;
        bottom: 50%;
  
        transform: translate(-50%,215px);
    }
  
    .areas-container .trash-can-container img{
        position: unset;
        transform: unset;
    }
  </style>
  