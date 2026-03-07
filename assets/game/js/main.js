// 游戏主逻辑

// 初始化函数
function init() {
    // 初始化音频上下文（需要用户交互后才能播放）
    AudioManager.init();

    // 场景
    scene = new THREE.Scene();
    // 移除背景颜色，让天空能够显示出来
    // scene.background = new THREE.Color(0x000000);
    // 移除雾效，确保远处的天空能够被看到
    // scene.fog = new THREE.Fog(0x000000, 30, 100);

    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 12, 18);
    camera.lookAt(0, 0, -15);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false; // 关闭阴影映射

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = false; // 关闭阴影投射
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00FF9D, 1, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // 创建白色地面（雪地效果）
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.0; // 放置在赛道下方
    ground.userData = { type: 'ground' };
    scene.add(ground);

    // 创建天空背景（带有雪山效果）
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    // 使用蓝白灰色作为天空
    const skyMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xB0C4DE, // 蓝白灰色
        side: THREE.BackSide 
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    // 球体不需要特别设置位置，因为它会包围整个场景
    scene.add(sky);

    // 添加雾效果，增强近实远虚的效果
    scene.fog = new THREE.FogExp2(0xB0C4DE, 0.005);

    // 创建远处的小山背景（符合游戏风格）
    const mountainGroup = new THREE.Group();
    
    // 创建几个小山，在雾中若隐若现
    const mountainColors = [0xffffff, 0xf0f0f0, 0xe0e0e0];
    
    for (let i = 0; i < 8; i++) { // 增加小山数量，创建8个
        const height = 30 + Math.random() * 50; // 减小高度范围，变成小山
        const width = 80 + Math.random() * 50; // 减小宽度范围，变成小山
        const geometry = new THREE.ConeGeometry(width, height, 3); // 三角形小山
        const material = new THREE.MeshBasicMaterial({ 
            color: mountainColors[Math.floor(Math.random() * mountainColors.length)] 
        });
        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.x = -800 + i * 200; // 调整间距
        mountain.position.y = height / 2 + 10; // 调整高度
        mountain.position.z = -800 + Math.random() * 200; // 增加深度，使小山在远处
        mountain.rotation.y = Math.random() * 0.5;
        mountainGroup.add(mountain);
    }
    
    scene.add(mountainGroup);

    // 创建赛道
    createTrack();

    // 创建路边的树
    createTrees();

    // 创建蛇
    createSnake();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 触摸事件 - 点击屏幕左侧/右侧移动
    window.addEventListener('touchstart', (e) => {
        if (!GameState.isPlaying || GameState.isPaused) return;
        const touchX = e.touches[0].clientX;
        const screenWidth = window.innerWidth;

        // 点击左侧1/3区域向左，点击右侧1/3区域向右
        if (touchX < screenWidth / 3) {
            moveLeft();
        } else if (touchX > screenWidth * 2 / 3) {
            moveRight();
        }
    });

    // 手机端控制按钮事件
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    // 触摸事件
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLeftBtn();
    }, { passive: false });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleRightBtn();
    }, { passive: false });

    // 鼠标点击事件
    leftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLeftBtn();
    });

    rightBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleRightBtn();
    });

    // 开始动画循环
    animate();

    // 场景渲染完成后隐藏加载动画，显示开始游戏页面
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    }, 2000);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (GameState.isPlaying && !GameState.isPaused) {
        updateSnake(delta);
        updateTrackAndObstacles(delta);
        spawnObstacles(clock.elapsedTime);
        // 只在游戏进行时更新HUD
        updateHUD();
        // 更新季节状态
        updateSeason(delta);
        // 创建季节性粒子效果
        createSeasonalParticles();
        // 更新粒子状态
        updateParticles(delta);
    }

    // 始终渲染场景，确保能看到赛道和蛇的初始状态
    renderer.render(scene, camera);
}

// 游戏控制函数
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('gameover-screen').style.display = 'none';
    document.getElementById('pause-screen').style.display = 'none';
    document.getElementById('pause-btn').textContent = '暂停';
    document.getElementById('pause-btn').style.display = 'block';
    document.getElementById('mobile-controls').style.display = 'flex';

    GameState.isPlaying = true;
    GameState.isPaused = false;
    GameState.score = 0;
    GameState.distance = 0;
    GameState.speed = GameConfig.SNAKE_SPEED;
    GameState.snakeLength = GameConfig.INITIAL_SNAKE_LENGTH;
    GameState.appleCount = 0;
    GameState.targetLane = 1;
    GameState.isInvulnerable = false;
    // 重置季节状态，确保每次重新游戏都从春天开始
    GameState.currentSeason = 'spring';
    GameState.nextSeason = 'summer';
    GameState.seasonProgress = 0;
    GameState.seasonTime = 0;
    GameState.isTransitioning = false;
    GameState.transitionProgress = 0;
    // 初始化草地颜色
    GameState.currentGrassColor = GRASS_COLORS[GameState.currentSeason];

    // 播放背景音乐
    if (AudioManager.bgMusic && GameState.soundEnabled) AudioManager.bgMusic.play();

    // 重置蛇位置 - 保持当前X位置，让updateSnake函数平滑过渡到目标车道
    snakeHead.position.set(snakeHead.position.x, 0.5, 0);
    pathHistory = [];
    
    // 初始化路径历史，确保蛇身跟随正常
    for (let i = 0; i < 50; i++) {
        pathHistory.unshift({
            x: snakeHead.position.x,
            y: snakeHead.position.y,
            z: 0
        });
    }

    // 重置赛道位置
    const segmentDepth = GameConfig.TRACK_LENGTH / 2;
    for (let seg = 0; seg < 2; seg++) {
        let baseIndex = seg * 11; // 每个赛道段有11个元素：4车道 + 2草地过渡 + 3中间车道线 + 2宽车道线
        // 4条车道
        for (let lane = 0; lane < 4; lane++) {
            trackParts[baseIndex + lane].position.z = -seg * segmentDepth;
        }
        // 2个草地过渡区域
        for (let i = 0; i < 2; i++) {
            trackParts[baseIndex + 4 + i].position.z = -seg * segmentDepth;
        }
        // 3条中间车道线
        for (let i = 0; i < 3; i++) {
            trackParts[baseIndex + 6 + i].position.z = -seg * segmentDepth;
        }
        // 2条宽车道线
        for (let i = 0; i < 2; i++) {
            trackParts[baseIndex + 9 + i].position.z = -seg * segmentDepth;
        }
    }

    // 清空并重新创建障碍物
    apples = [];
    mines = [];

    // 清空粒子
    resetParticleSystem();

    // 重置树木和小草位置
    const treeSpacing = 30;
    for (let i = 0; i < trees.length; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const baseXPos = side * 9.2;
        const zPos = -Math.floor(i / 2) * treeSpacing;
        trees[i].position.set(baseXPos + (Math.random() - 0.5) * 1.5, -1.35, zPos);
        trees[i].rotation.y = Math.random() * Math.PI * 2;
    }

    // 重置小草位置
    const segmentLength = GameConfig.TRACK_LENGTH / GameConfig.TRACK_SEGMENTS;
    for (let j = 0; j < grass.length; j++) {
        grass[j].position.z = -j * segmentLength;
    }

    // 重置HUD显示
    updateHUD();
}

function restartGame() {
    // 清空蛇身
    for (let segment of snakeBody) {
        scene.remove(segment);
    }
    snakeBody = [];

    // 重新创建蛇
    createSnake();

    // 开始游戏
    startGame();
}

function gameOver() {
    GameState.isPlaying = false;

    // 隐藏手机控制按钮
    document.getElementById('mobile-controls').style.display = 'none';
    // 隐藏暂停按钮
    document.getElementById('pause-btn').style.display = 'none';

    // 停止音乐
    if (AudioManager.bgMusic) AudioManager.bgMusic.stop();

    // 更新最高分
    if (GameState.score > GameState.highScore) {
        GameState.highScore = GameState.score;
        localStorage.setItem('snakeRushHighScore', GameState.highScore);
    }

    document.getElementById('gameover-screen').style.display = 'flex';
    document.querySelector('.final-score').textContent = GameState.score;
    document.querySelector('.high-score').textContent = '最高分: ' + GameState.highScore;
}

function togglePause() {
    if (!GameState.isPlaying) return;

    GameState.isPaused = !GameState.isPaused;

    if (GameState.isPaused) {
        document.getElementById('pause-screen').style.display = 'flex';
        // 隐藏左上角暂停按钮
        document.getElementById('pause-btn').style.display = 'none';
        document.getElementById('settings-btn').style.display = 'none';
        // 隐藏手机控制按钮
        document.getElementById('mobile-controls').style.display = 'none';
        // 暂停音乐
        if (AudioManager.bgMusic) AudioManager.bgMusic.stop();
    } else {
        document.getElementById('pause-screen').style.display = 'none';
        // 显示左上角暂停按钮
        document.getElementById('pause-btn').style.display = 'block';
        document.getElementById('settings-btn').style.display = 'block';
        document.getElementById('pause-btn').textContent = '暂停';
        // 继续显示手机控制按钮
        document.getElementById('mobile-controls').style.display = 'flex';
        // 继续播放音乐
        if (AudioManager.bgMusic && GameState.soundEnabled) AudioManager.bgMusic.play();
    }
}

function toggleSettings() {
    const settingsScreen = document.getElementById('settings-screen');
    settingsScreen.style.display = 'flex';
    // 暂停游戏
    GameState.isPaused = true;
    // 暂停音乐
    if (AudioManager.bgMusic) AudioManager.bgMusic.stop();
}

function closeSettings() {
    const settingsScreen = document.getElementById('settings-screen');
    settingsScreen.style.display = 'none';
    
    // 应用设置
    GameState.soundEnabled = document.getElementById('sound-toggle').checked;
    
    // 恢复游戏
    GameState.isPaused = false;
    // 继续播放音乐
    if (AudioManager.bgMusic && GameState.soundEnabled) AudioManager.bgMusic.play();
}

function endGame() {
    // 停止游戏
    GameState.isPlaying = false;
    
    // 停止音乐
    if (AudioManager.bgMusic) AudioManager.bgMusic.stop();
    
    // 隐藏设置弹窗
    const settingsScreen = document.getElementById('settings-screen');
    settingsScreen.style.display = 'none';
    
    // 显示初始页面
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    
    // 重置游戏状态
    GameState.score = 0;
    GameState.distance = 0;
    GameState.speed = GameConfig.SNAKE_SPEED;
    GameState.snakeLength = GameConfig.INITIAL_SNAKE_LENGTH;
    GameState.appleCount = 0;
    GameState.targetLane = 1;
    GameState.isInvulnerable = false;
    GameState.currentSeason = 'spring';
    GameState.nextSeason = 'summer';
    GameState.seasonProgress = 0;
    GameState.seasonTime = 0;
    GameState.isTransitioning = false;
    GameState.transitionProgress = 0;
    GameState.currentGrassColor = GRASS_COLORS[GameState.currentSeason];
}

// 事件监听器
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (!GameState.isPlaying) {
        if (event.code === 'Space') {
            if (document.getElementById('gameover-screen').style.display === 'flex') {
                restartGame();
            } else if (document.getElementById('start-screen').style.display !== 'none') {
                startGame();
            }
        }
        return;
    }

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        if (!keys.left) {
            keys.left = true;
            moveLeft();
        }
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        if (!keys.right) {
            keys.right = true;
            moveRight();
        }
    }
    if (event.code === 'Escape' || event.code === 'KeyP' || event.code === 'Space') {
        if (GameState.isPlaying) {
            togglePause();
        }
    }
}

function onKeyUp(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        keys.left = false;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        keys.right = false;
    }
}

// 移动控制
function moveLeft() {
    if (GameState.targetLane > 0) {
        GameState.targetLane--;
    }
}

function moveRight() {
    if (GameState.targetLane < GameConfig.MAX_LANES - 1) {
        GameState.targetLane++;
    }
}

// 手机端按钮处理函数 - 暴露到全局
window.handleLeftBtn = function() {
    if (GameState.isPlaying && !GameState.isPaused) {
        moveLeft();
    } else {
        // 即使游戏未开始也允许测试
        moveLeft();
    }
};

window.handleRightBtn = function() {
    if (GameState.isPlaying && !GameState.isPaused) {
        moveRight();
    } else {
        // 即使游戏未开始也允许测试
        moveRight();
    }
};

// 辅助函数
function showCombo(text) {
    const comboDisplay = document.getElementById('combo-display');
    comboDisplay.textContent = text;
    comboDisplay.style.opacity = 1;
    comboDisplay.style.transform = 'translate(-50%, -50%) scale(1.2)';

    setTimeout(() => {
        comboDisplay.style.opacity = 0;
        comboDisplay.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 500);
}

// 上次HUD更新的值
let lastHUDValues = {
    score: -1,
    snakeLength: -1,
    distance: -1
};

// 更新像素方块显示
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives-display');
    if (!livesDisplay) return;
    
    // 清空现有的内容
    livesDisplay.innerHTML = '';
    
    // 创建方块容器
    const squaresContainer = document.createElement('div');
    squaresContainer.style.display = 'flex';
    squaresContainer.style.alignItems = 'center';
    
    // 显示固定数量的像素方块（基于初始蛇长度）
    for (let i = 0; i < GameConfig.INITIAL_SNAKE_LENGTH; i++) {
        const square = document.createElement('div');
        // 根据当前生命值决定是否显示为空心
        if (i < GameState.snakeLength) {
            square.className = 'pixel-square';
        } else {
            square.className = 'pixel-square square-empty';
        }
        squaresContainer.appendChild(square);
    }
    
    // 将容器添加到显示区域
    livesDisplay.appendChild(squaresContainer);
    
    // 添加生命值数值（显示在方块上方）
    const livesValue = document.createElement('div');
    livesValue.className = 'lives-value';
    livesValue.textContent = GameState.snakeLength;
    livesValue.style.position = 'absolute';
    livesValue.style.top = '-30px';
    livesValue.style.left = '50%';
    livesValue.style.transform = 'translateX(-50%)';
    livesDisplay.appendChild(livesValue);
    
    // 确保显示区域可见
    livesDisplay.style.zIndex = '1000';
    livesDisplay.style.opacity = '1';
}

function updateHUD() {
    // 只在值变化时更新，减少DOM操作
    if (GameState.score !== lastHUDValues.score) {
        document.getElementById('score-value').textContent = GameState.score;
        lastHUDValues.score = GameState.score;
    }
    if (GameState.snakeLength !== lastHUDValues.snakeLength) {
        updateLivesDisplay();
        lastHUDValues.snakeLength = GameState.snakeLength;
    }
    const currentDistance = Math.floor(GameState.distance);
    if (currentDistance !== lastHUDValues.distance) {
        document.getElementById('distance-value').textContent = currentDistance;
        lastHUDValues.distance = currentDistance;
    }
}

// 初始化游戏
window.onload = init;