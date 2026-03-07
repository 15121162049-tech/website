function createApple() {
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFF2A6D,
        emissive: 0xFF2A6D,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
    });

    const apple = new THREE.Mesh(geometry, material);
    // 4条车道随机位置
    const lane = Math.floor(Math.random() * 4);
    // 车道位置（居中）
    apple.position.set(-5.25 + lane * 3.5, 0.8, GameConfig.SPAWN_Z);
    apple.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    apple.userData = { type: 'apple', rotationSpeed: 0.02 + Math.random() * 0.02 };

    // 发光效果
    const glowGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF2A6D,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    apple.add(glow);

    scene.add(apple);
    apples.push(apple);
}

function createMine() {
    const group = new THREE.Group();

    // 地雷主体 - 二十面体（球形）
    const geometry = new THREE.IcosahedronGeometry(0.5, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.3,
        emissive: 0xFF0000,
        emissiveIntensity: 0.3
    });
    const mineBody = new THREE.Mesh(geometry, material);
    mineBody.castShadow = false;
    group.add(mineBody);

    // 引线
    const fuseGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const fuseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
    fuse.position.set(0, 0.65, 0);
    fuse.rotation.z = 0.3;
    group.add(fuse);

    // 引线上的火花效果
    const sparkGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
    spark.position.set(0, 0.95, 0); // 位于引线顶部
    spark.userData = { isFuseSpark: true };
    group.add(spark);

    // 火花点光源
    const sparkLight = new THREE.PointLight(0xFF4500, 1, 2);
    sparkLight.position.copy(spark.position);
    sparkLight.userData = { isFuseSparkLight: true };
    group.add(sparkLight);

    // 4条车道随机位置
    const lane = Math.floor(Math.random() * 4);
    // 车道位置（居中）
    group.position.set(-5.25 + lane * 3.5, 0.5, GameConfig.SPAWN_Z);
    group.userData = {
        type: 'mine'
    };

    scene.add(group);
    mines.push(group);
}

// 检查位置是否已被占用
function isPositionOccupied(lane, z, threshold = 2) {
    // 检查苹果
    for (let apple of apples) {
        const appleLane = Math.round(apple.position.x / GameConfig.LANE_WIDTH);
        if (appleLane === lane && Math.abs(apple.position.z - z) < threshold) {
            return true;
        }
    }
    // 检查地雷
    for (let mine of mines) {
        const mineLane = Math.round(mine.position.x / GameConfig.LANE_WIDTH);
        if (mineLane === lane && Math.abs(mine.position.z - z) < threshold) {
            return true;
        }
    }
    return false;
}

function spawnObstacles(currentTime) {
    // 持续生成障碍物
    if (currentTime - lastSpawnTime > SPAWN_INTERVAL) {
        lastSpawnTime = currentTime;

        // 随机选择一个车道（4条车道：0,1,2,3）
        const lane = Math.floor(Math.random() * 4);
        const spawnZ = GameConfig.SPAWN_Z;

        // 检查该位置是否已被占用
        if (!isPositionOccupied(lane, spawnZ, 3)) {
            // 随机生成不同类型的物品
            const rand = Math.random();
            if (rand < 0.5) {
                createAppleWithLane(lane);
            } else {
                createMineWithLane(lane);
            }
        }
    }
}

// 支持指定车道的苹果生成
function createAppleWithLane(lane) {
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFF2A6D,
        emissive: 0xFF2A6D,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
    });

    const apple = new THREE.Mesh(geometry, material);
    // 车道位置（居中）
    apple.position.set(-5.25 + lane * 3.5, 0.8, GameConfig.SPAWN_Z);
    apple.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    apple.userData = { type: 'apple', rotationSpeed: 0.02 + Math.random() * 0.02 };

    scene.add(apple);
    apples.push(apple);
}

// 支持指定车道的地雷生成
function createMineWithLane(lane) {
    const group = new THREE.Group();

    // 地雷主体 - 二十面体（球形）
    const geometry = new THREE.IcosahedronGeometry(0.5, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.3,
        emissive: 0xFF0000,
        emissiveIntensity: 0.3
    });
    const mineBody = new THREE.Mesh(geometry, material);
    mineBody.castShadow = false;
    group.add(mineBody);

    // 引线
    const fuseGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const fuseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
    fuse.position.set(0, 0.8, 0);
    fuse.rotation.z = 0.3;
    group.add(fuse);

    // 引线上的火花效果
    const sparkGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
    spark.position.set(0, 1.1, 0); // 位于引线顶部
    spark.userData = { isFuseSpark: true };
    group.add(spark);

    // 火花点光源
    const sparkLight = new THREE.PointLight(0xFF4500, 1, 2);
    sparkLight.position.copy(spark.position);
    sparkLight.userData = { isFuseSparkLight: true };
    group.add(sparkLight);

    // 车道位置（居中）
    group.position.set(-5.25 + lane * 3.5, 0.5, GameConfig.SPAWN_Z);
    group.userData = {
        type: 'mine'
    };

    scene.add(group);
    mines.push(group);
}

function updateTrackAndObstacles(delta) {
    const moveDistance = GameState.speed * delta;

    // 更新距离
    GameState.distance += moveDistance;
    GameState.speed += GameConfig.SPEED_INCREMENT * delta;

    // 更新赛道（两组交替，无缝循环）
    const segmentDepth = GameConfig.TRACK_LENGTH / 2;
    for (let i = 0; i < trackParts.length; i++) {
        const part = trackParts[i];
        part.position.z += moveDistance; // 向后移动，z值增加

        // 如果跑到了后面，重置到前面，确保在相机视野外重置
        if (part.position.z > segmentDepth) { // 当赛道段移动完一段长度后
            // 重置到赛道的最前面，与另一段赛道首尾相接
            part.position.z -= segmentDepth * 2;
        }
    }

    // 更新树木（向后移动并循环）
    for (let t = 0; t < trees.length; t++) {
        trees[t].position.z += moveDistance; // 向后移动，z值增加
        if (trees[t].position.z > segmentDepth + 100) { // 当树木移动完一段长度后
            trees[t].position.z -= segmentDepth * 2 + 100;
            // 重新随机位置，保持紧贴车道边缘
            trees[t].position.x = (Math.random() > 0.5 ? 1 : -1) * (9.8 + Math.random() * 0.2);
            trees[t].rotation.y = Math.random() * Math.PI * 2;
        }
    }

    // 更新小草（向后移动并循环）
    for (let g = 0; g < grass.length; g++) {
        const grassGroup = grass[g];
        grassGroup.position.z += moveDistance; // 向后移动，z值增加
        if (grassGroup.position.z > segmentDepth) { // 当小草移动完一段长度后
            grassGroup.position.z -= segmentDepth * 2;
        }
    }

    // 更新苹果（向后移动）
    for (let i = apples.length - 1; i >= 0; i--) {
        const apple = apples[i];
        const oldPosition = apple.position.clone();
        apple.position.z += moveDistance; // 向后移动，z值增加
        apple.rotation.y += apple.userData.rotationSpeed;
        apple.rotation.x += apple.userData.rotationSpeed * 0.5;

        // 检测碰撞 - 多维度碰撞检测，确保高速时也能检测到
        const distance = snakeHead.position.distanceTo(apple.position);
        const oldDistance = snakeHead.position.distanceTo(oldPosition);
        
        // 1. 检查当前距离
        // 2. 检查距离变化（穿过）
        // 3. 检查x轴和z轴的单独距离
        const xDistance = Math.abs(snakeHead.position.x - apple.position.x);
        const zDistance = Math.abs(snakeHead.position.z - apple.position.z);
        const oldZDistance = Math.abs(snakeHead.position.z - oldPosition.z);
        
        // 更宽松的碰撞检测条件
        if (distance < 2.0 || // 增大碰撞半径
            (oldDistance >= 2.0 && distance < 2.0) || // 检测穿过
            (xDistance < 1.5 && zDistance < 1.5) || // 单独检查x和z
            (xDistance < 1.5 && oldZDistance >= 1.5 && zDistance < 1.5)) { // 检测z轴穿过
            // 吃掉苹果
            collectApple(apple);
            apples.splice(i, 1);
            continue;
        }

        // 移除过远的苹果
        if (apple.position.z > 150) {
            scene.remove(apple);
            apples.splice(i, 1);
        }
    }

    // 更新地雷（向后移动）
    for (let i = mines.length - 1; i >= 0; i--) {
        const mine = mines[i];
        const oldPosition = mine.position.clone();
        mine.position.z += moveDistance; // 向后移动，z值增加

        // 引线火花效果（持续存在，不会引爆）
        // 增强的火花效果
        mine.children.forEach(child => {
            if (child.userData.isFuseSpark) {
                // 保持火花在引线顶部位置
                child.position.y = 1.1;
                // 增强的火花闪烁效果
                const time = Date.now() * 0.02;
                const intensity = Math.sin(time) * 0.5 + 0.5;
                // 更亮的火花颜色
                const color = new THREE.Color();
                color.setHSL(0.1, 1, 0.7 + intensity * 0.3); // 更亮的橙色
                child.material.color.copy(color);
                // 火花大小变化更明显
                const scale = 0.8 + Math.sin(Date.now() * 0.03) * 0.4;
                child.scale.set(scale, scale, scale);
                // 火花位置轻微抖动
                child.position.x = Math.sin(Date.now() * 0.1) * 0.02;
                child.position.z = Math.cos(Date.now() * 0.1) * 0.02;
            }
            if (child.userData.isFuseSparkLight) {
                // 保持光源在火花位置
                child.position.y = 1.1;
                // 增强的光源强度变化
                const intensity = 1.5 + Math.sin(Date.now() * 0.02) * 1;
                child.intensity = intensity;
                // 光源颜色与火花同步
                const color = new THREE.Color();
                color.setHSL(0.1, 1, 0.8); // 亮橙色
                child.color.copy(color);
            }
        });

        // 检测碰撞 - 多维度碰撞检测，确保高速时也能检测到
        const distance = snakeHead.position.distanceTo(mine.position);
        const oldDistance = snakeHead.position.distanceTo(oldPosition);
        
        // 1. 检查当前距离
        // 2. 检查距离变化（穿过）
        // 3. 检查x轴和z轴的单独距离
        const xDistance = Math.abs(snakeHead.position.x - mine.position.x);
        const zDistance = Math.abs(snakeHead.position.z - mine.position.z);
        const oldZDistance = Math.abs(snakeHead.position.z - oldPosition.z);
        
        // 更宽松的碰撞检测条件
        if (!GameState.isInvulnerable && (distance < 2.0 || // 增大碰撞半径
            (oldDistance >= 2.0 && distance < 2.0) || // 检测穿过
            (xDistance < 1.5 && zDistance < 1.5) || // 单独检查x和z
            (xDistance < 1.5 && oldZDistance >= 1.5 && zDistance < 1.5))) { // 检测z轴穿过
            // 撞到地雷
            hitMine(mine);
            mines.splice(i, 1);
            continue;
        }

        // 移除过远的地雷
        if (mine.position.z > 150) {
            scene.remove(mine);
            mines.splice(i, 1);
        }
    }
}

function collectApple(apple) {
    GameState.score += GameConfig.APPLE_SCORE;
    updateHUD();

    // 增加苹果计数器
    GameState.appleCount++;

    // 每吃3个苹果，身体增加一节，生命增加1
    if (GameState.appleCount % 3 === 0) {
        GameState.snakeLength++;
        createBodySegment(snakeBody.length);
        showCombo('+1 生命');
    }

    // 播放得分音效
    AudioManager.playScoreSound();

    // 显示得分特效
    showCombo(`+${GameConfig.APPLE_SCORE}`);

    // 移除苹果
    scene.remove(apple);

    // 粒子效果（简化版）
    createParticles(apple.position, 0xFF2A6D);
}

function hitMine(mine) {
    GameState.snakeLength--;

    // 播放碰撞音效
    AudioManager.playHitSound();

    // 屏幕震动 - 只让游戏画布晃动，不影响HUD
    document.getElementById('gameCanvas').classList.add('shake');
    setTimeout(() => {
        document.getElementById('gameCanvas').classList.remove('shake');
    }, 500);

    // 移除地雷
    scene.remove(mine);

    // 减弱的爆炸效果，只有棕色碎片
    const particleCount = 20;
    const particles = [];
    const brownColor = 0x8B4513; // 棕色

    for (let i = 0; i < particleCount; i++) {
        const particle = getParticle();
        particle.position.copy(mine.position);
        particle.material.color.setHex(brownColor);
        particle.material.opacity = 1;
        particle.rotation.set(0, 0, 0);
        
        // 随机大小
        const size = 0.1 + Math.random() * 0.15;
        particle.scale.set(size, size, size);
        
        // 减弱的爆炸速度，确保粒子远离镜头
        const speed = 0.4 + Math.random() * 0.2;
        particle.userData.velocity.set(
            (Math.random() - 0.5) * speed,
            Math.random() * 0.2 + 0.1,
            Math.random() * 0.5 * speed + 0.1
        );
        particle.userData.life = 1;
        scene.add(particle);
        particles.push(particle);
    }

    // 动画粒子
    function animateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.015; // 重力
            p.userData.life -= 0.025;
            p.material.opacity = p.userData.life;
            p.rotation.x += 0.1;
            p.rotation.y += 0.1;
            p.rotation.z += 0.05;
            
            // 大小变化
            const scale = p.userData.life * 0.8 + 0.2;
            p.scale.set(scale, scale, scale);

            if (p.userData.life <= 0) {
                returnParticle(p);
                particles.splice(i, 1);
            }
        }

        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    }
    animateParticles();

    // 减少蛇身 - 添加破碎动效
    if (snakeBody.length > 0) {
        const removedSegment = snakeBody.pop();
        // 创建破碎粒子效果
        createBlockDestruction(removedSegment.position);
        scene.remove(removedSegment);
    }

    // 无敌时间
    GameState.isInvulnerable = true;
    setTimeout(() => {
        GameState.isInvulnerable = false;
    }, GameConfig.INVULNERABILITY_TIME);

    // 闪烁效果
    flashSnake();

    // 更新底部的像素心显示
    updateLivesDisplay();
    updateHUD();

    // 检查游戏结束
    if (GameState.snakeLength <= 0) {
        gameOver();
    }
}

function flashSnake() {
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        // 闪烁蛇头的所有子对象
        snakeHead.children.forEach(child => {
            if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = flashCount % 2 === 0 ? 0.5 : 1;
            }
        });
        // 闪烁蛇身
        snakeBody.forEach(segment => {
            if (segment.material && segment.material.opacity !== undefined) {
                segment.material.opacity = flashCount % 2 === 0 ? 0.5 : 1;
            }
        });
        flashCount++;
        if (flashCount >= 6) {
            clearInterval(flashInterval);
            // 恢复蛇头的所有子对象的透明度
            snakeHead.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = 1;
                }
            });
            // 恢复蛇身的透明度
            snakeBody.forEach(segment => {
                if (segment.material && segment.material.opacity !== undefined) {
                    segment.material.opacity = 1;
                }
            });
        }
    }, 80);
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