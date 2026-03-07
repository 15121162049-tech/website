function createSnake() {
    // 创建卡车头部形状的蛇头
    snakeHead = new THREE.Group();

    // 车身材质
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x00CC7A,
        emissive: 0x00FF9D,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7
    });

    // 驾驶室（卡车头部）
    const cabinGeometry = new THREE.BoxGeometry(1.1, 0.9, 1.3);
    const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
    cabin.position.set(0, 0.6, 0.2);
    cabin.castShadow = false;
    snakeHead.add(cabin);

    // 挡风玻璃
    const windshieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488AA,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7
    });
    const windshieldGeometry = new THREE.BoxGeometry(0.95, 0.45, 0.1);
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 0.85, 0.85);
    windshield.rotation.x = -0.3;
    snakeHead.add(windshield);

    // 车轮
    const wheelGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.1
    });

    const wheelPositions = [
        [-0.55, 0.12, 0.55],
        [0.55, 0.12, 0.55],
        [-0.55, 0.12, -0.25],
        [0.55, 0.12, -0.25]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = false;
        snakeHead.add(wheel);
    });

    // 车灯（大灯）
    const lightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });

    const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
    leftLight.position.set(-0.35, 0.3, 0.95);
    snakeHead.add(leftLight);

    const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
    rightLight.position.set(0.35, 0.3, 0.95);
    snakeHead.add(rightLight);

    // 前格栅
    const grillGeometry = new THREE.BoxGeometry(0.9, 0.3, 0.1);
    const grillMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
        metalness: 0.5
    });
    const grill = new THREE.Mesh(grillGeometry, grillMaterial);
    grill.position.set(0, 0.2, 0.95);
    snakeHead.add(grill);

    // 排气管
    const exhaustGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8);
    const exhaustMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.6,
        metalness: 0.4
    });
    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(-0.5, 0.15, 0.85);
    leftExhaust.rotation.x = Math.PI / 2;
    snakeHead.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    rightExhaust.position.set(0.5, 0.15, 0.85);
    rightExhaust.rotation.x = Math.PI / 2;
    snakeHead.add(rightExhaust);

    snakeHead.position.set(getLaneX(GameState.targetLane), 0.5, 0);
    snakeHead.castShadow = false; // 关闭蛇头投射阴影
    scene.add(snakeHead);

    // 蛇身方块
    for (let i = 0; i < GameConfig.INITIAL_SNAKE_LENGTH - 1; i++) {
        createBodySegment(i);
    }
}

function createBodySegment(index) {
    const size = 1 - (index * 0.03);
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00FF9D,
        emissive: 0x00FF9D,
        emissiveIntensity: 0.3 - (index * 0.02),
        roughness: 0.4,
        metalness: 0.6
    });

    const segment = new THREE.Mesh(geometry, material);
    segment.position.set(0, 0.5, (index + 1) * GameConfig.SEGMENT_SPACING);
    segment.castShadow = false; // 关闭蛇身投射阴影

    scene.add(segment);
    snakeBody.push(segment);
}

function updateSnake(delta) {
    if (!GameState.isPlaying) return;

    // 计算目标位置
    const targetX = getLaneX(GameState.targetLane);

    // 平滑移动到目标车道
    const diff = targetX - snakeHead.position.x;
    if (Math.abs(diff) > 0.05) {
        snakeHead.position.x += diff * GameConfig.LATERAL_SPEED * delta * 0.3;
        // 移动时的倾斜效果
        snakeHead.rotation.z = -Math.sign(diff) * 0.1 * (Math.abs(diff) / GameConfig.LANE_WIDTH);
    } else {
        snakeHead.position.x = targetX;
        // 回到正常位置
        snakeHead.rotation.z = Math.sin(Date.now() * 0.005) * 0.05;
    }

    // 限制在赛道范围内
    const maxX = getLaneX(GameConfig.MAX_LANES - 1);
    snakeHead.position.x = Math.max(getLaneX(0), Math.min(maxX, snakeHead.position.x));

    // 蛇头上下浮动效果
    snakeHead.position.y = 0.5 + Math.sin(Date.now() * 0.01) * 0.05;

    // 记录路径（蛇头只在X轴移动，Z轴不变）
    pathHistory.unshift({
        x: snakeHead.position.x,
        y: snakeHead.position.y,
        z: 0  // 固定Z位置
    });

    if (pathHistory.length > MAX_PATH_HISTORY) {
        pathHistory.pop();
    }

    // 更新蛇身跟随
    for (let i = 0; i < snakeBody.length; i++) {
        const pathIndex = Math.floor((i + 1) * 3); // 减小路径点间隔，使跟随更紧凑
        if (pathIndex < pathHistory.length) {
            const pos = pathHistory[pathIndex];
            const segment = snakeBody[i];
            segment.position.x += (pos.x - segment.position.x) * 0.8; // 增大平滑因子，使跟随更直接
            segment.position.y += (pos.y - segment.position.y) * 0.8; // 增大平滑因子，使跟随更直接
            // 蛇身Z轴保持相对位置
            segment.position.z = (i + 1) * GameConfig.SEGMENT_SPACING;
            
            // 蛇身跟随的摆动效果
            segment.rotation.z = Math.sin(Date.now() * 0.003 + i * 0.1) * 0.02; // 减小摆动幅度，使动作更平缓
        }
    }
}

function moveLeft() {
    console.log('moveLeft called, current lane:', GameState.targetLane);
    if (GameState.targetLane > 0) {
        GameState.targetLane--;
    }
}

function moveRight() {
    console.log('moveRight called, current lane:', GameState.targetLane);
    if (GameState.targetLane < GameConfig.MAX_LANES - 1) {
        GameState.targetLane++;
    }
}

// 手机端按钮直接调用的全局函数
function btnMoveLeft() {
    console.log('btnMoveLeft called');
    if (GameState.isPlaying && !GameState.isPaused) {
        moveLeft();
    }
}

function btnMoveRight() {
    console.log('btnMoveRight called');
    if (GameState.isPlaying && !GameState.isPaused) {
        moveRight();
    }
}

// 手机端按钮处理函数 - 暴露到全局
window.handleLeftBtn = function() {
    console.log('handleLeftBtn called, isPlaying:', GameState.isPlaying, 'isPaused:', GameState.isPaused, 'targetLane:', GameState.targetLane);
    if (GameState.isPlaying && !GameState.isPaused) {
        moveLeft();
    } else {
        // 即使游戏未开始也允许测试
        moveLeft();
    }
};

window.handleRightBtn = function() {
    console.log('handleRightBtn called, isPlaying:', GameState.isPlaying, 'isPaused:', GameState.isPaused, 'targetLane:', GameState.targetLane);
    if (GameState.isPlaying && !GameState.isPaused) {
        moveRight();
    } else {
        // 即使游戏未开始也允许测试
        moveRight();
    }
};