// Three.js 变量
let scene, camera, renderer;
let trackParts = [];  // 多段赛道
let railings = [];
let clock = new THREE.Clock();



// 辅助函数
function getLaneX(lane) {
    // 4条车道均匀分布在总宽度20的赛道上
    // 车道中心位置：-5.25, -1.75, 1.75, 5.25
    // 初始位置在x=0
    if (!GameState.isPlaying) {
        return 0;
    }
    return -5.25 + lane * GameConfig.LANE_WIDTH;
}

function createTrack() {
    // 创建无缝循环赛道 - 使用两组赛道交替
    const trackWidth = 20;
    const trackDepth = GameConfig.TRACK_LENGTH;
    const segmentDepth = trackDepth / 2; // 分成两段交替
    const laneWidth = 3.5; // 车道宽度设置为3.5

    // 4条车道的不同颜色（更浅）
    const laneColors = [
        0xB8D4E8,  // 车道1 - 浅蓝色
        0xC2E4C8,  // 车道2 - 浅绿色
        0xE8D8C8,  // 车道3 - 浅橙色
        0xD8C8E0   // 车道4 - 浅紫色
    ];

    // 草地颜色
    const grassColor = GRASS_COLORS.spring;

    // 创建两段赛道实现无缝循环
    for (let seg = 0; seg < 2; seg++) {
        // 创建4条不同颜色的车道，稍微重叠以消除缝隙
        for (let lane = 0; lane < 4; lane++) {
            const laneX = -5.25 + lane * laneWidth; // 车道中心位置：-5.25, -1.75, 1.75, 5.25
            // 增加车道宽度一点，确保车道之间没有缝隙
            const roadGeometry = new THREE.PlaneGeometry(laneWidth + 0.01, segmentDepth);
            const roadMaterial = new THREE.MeshStandardMaterial({
                color: laneColors[lane],
                roughness: 0.85,
                metalness: 0.1
            });
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.position.y = -1.5;
            road.position.set(laneX, -1.5, -seg * segmentDepth);
            road.receiveShadow = false;
            road.renderOrder = 1; // 确保车道在草地之上渲染
            scene.add(road);
            trackParts.push(road);
        }

        // 添加车道到草地的过渡效果
        // 左侧过渡 - 增加宽度并向中间靠近
        const leftTransitionGeometry = new THREE.PlaneGeometry(3.5, segmentDepth);
        const leftTransitionMaterial = new THREE.MeshStandardMaterial({
            color: grassColor,
            roughness: 0.8,
            metalness: 0.1,
            emissive: grassColor,
            emissiveIntensity: 0.2
        });
        const leftTransition = new THREE.Mesh(leftTransitionGeometry, leftTransitionMaterial);
        leftTransition.rotation.x = -Math.PI / 2;
        leftTransition.position.set(-9.2, -1.35, -seg * segmentDepth); // 调整位置到-9.2，与草地基础对齐
        scene.add(leftTransition);
        trackParts.push(leftTransition);

        // 右侧过渡 - 增加宽度并向中间靠近
        const rightTransitionGeometry = new THREE.PlaneGeometry(3.5, segmentDepth);
        const rightTransitionMaterial = new THREE.MeshStandardMaterial({
            color: grassColor,
            roughness: 0.8,
            metalness: 0.1,
            emissive: grassColor,
            emissiveIntensity: 0.2
        });
        const rightTransition = new THREE.Mesh(rightTransitionGeometry, rightTransitionMaterial);
        rightTransition.rotation.x = -Math.PI / 2;
        rightTransition.position.set(9.2, -1.35, -seg * segmentDepth); // 调整位置到9.2，与草地基础对齐
        scene.add(rightTransition);
        trackParts.push(rightTransition);

        // 车道线 - 3条线隔开4个车道
        const lineGeometry = new THREE.PlaneGeometry(0.15, segmentDepth);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });

        // 车道线位置（3条线划分4条车道，位置：-3.5, 0, 3.5）
        const lanePositions = [-3.5, 0, 3.5];
        lanePositions.forEach(xPos => {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(xPos, -1.49, -seg * segmentDepth); // 稍微高于车道
            line.visible = true; // 显示车道线
            line.renderOrder = 2; // 确保车道线在车道之上渲染
            scene.add(line);
            trackParts.push(line);
        });
        
        // 添加0车道左边和3车道右边的车道线（与中间车道线宽度一致）
        const wideLineGeometry = new THREE.PlaneGeometry(0.15, segmentDepth); // 与中间车道线宽度一致
        const wideLanePositions = [-8.95, 8.95]; // 0车道左边和3车道右边的位置，与新的草地过渡区域对齐
        wideLanePositions.forEach(xPos => {
            const line = new THREE.Mesh(wideLineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(xPos, -1.49, -seg * segmentDepth); // 与中间车道线高度一致
            line.visible = true; // 显示车道线
            line.renderOrder = 2; // 与中间车道线渲染顺序一致
            scene.add(line);
            trackParts.push(line);
        });
    }

    // 移除边界线条，改为使用更自然的过渡效果
    // 这样可以避免边界线与车道之间的隔断感
    // 已经通过过渡区域实现了自然过渡

    // 创建小草
    createGrass();
}

function createGrass() {
    const grassColors = [0x6BC17A, 0x7ACA8A, 0x8AD09A];
    const rockColors = [0x8B7355, 0x705D45, 0x5D4B3C];

    // 与赛道分段方式一致，创建两段草地基础
    const trackDepth = GameConfig.TRACK_LENGTH;
    const segmentDepth = trackDepth / 2;

    for (let seg = 0; seg < 2; seg++) {
        // 创建左侧草地基础
        const leftGrassBaseGeometry = new THREE.BoxGeometry(3, 0.3, segmentDepth);
        const leftGrassBaseMaterial = new THREE.MeshStandardMaterial({
            color: grassColors[0],
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });
        const leftGrassBase = new THREE.Mesh(leftGrassBaseGeometry, leftGrassBaseMaterial);
        leftGrassBase.position.set(-9.2, -1.35, -seg * segmentDepth);
        leftGrassBase.castShadow = false;
        scene.add(leftGrassBase);
        trackParts.push(leftGrassBase);

        // 创建右侧草地基础
        const rightGrassBaseGeometry = new THREE.BoxGeometry(3, 0.3, segmentDepth);
        const rightGrassBaseMaterial = new THREE.MeshStandardMaterial({
            color: grassColors[0],
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });
        const rightGrassBase = new THREE.Mesh(rightGrassBaseGeometry, rightGrassBaseMaterial);
        rightGrassBase.position.set(9.2, -1.35, -seg * segmentDepth);
        rightGrassBase.castShadow = false;
        scene.add(rightGrassBase);
        trackParts.push(rightGrassBase);
    }

    // 随机添加小草和石头
    const segmentLength = GameConfig.TRACK_LENGTH / GameConfig.TRACK_SEGMENTS;
    for (let j = 0; j < GameConfig.TRACK_SEGMENTS; j++) {
        // 随机决定每段赛道两侧草的数量，使分布更自然
        const leftGrassCount = Math.floor(Math.random() * 10) + 10; // 10-19个
        const rightGrassCount = Math.floor(Math.random() * 10) + 10; // 10-19个

        // 左侧草
        const leftGrassGroup = new THREE.Group();
        const leftXPos = -9.2 + (Math.random() - 0.5) * 1; // 调整到9.2的位置
        for (let i = 0; i < leftGrassCount; i++) {
            // 随机创建小草或石头
            if (Math.random() > 0.5) { // 50% 概率创建小草，50% 创建石头
                // 创建小草
                const grassGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
                const grassMaterial = new THREE.MeshStandardMaterial({
                    color: grassColors[Math.floor(Math.random() * grassColors.length)],
                    flatShading: true
                });
                const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
                grassMesh.rotation.y = Math.random() * Math.PI * 2;
                // 更随机的位置分布
                const zOffset = -j * segmentLength - Math.random() * segmentLength;
                const xOffset = leftXPos + (Math.random() - 0.5) * 2.5;
                grassMesh.position.set(xOffset, -1.2, zOffset);
                grassMesh.castShadow = false;
                leftGrassGroup.add(grassMesh);
            } else { // 50% 概率创建石头
                // 创建石头，大小不一
                const rockSize = 0.15 + Math.random() * 0.25; // 大小变化
                const rockGeometry = new THREE.BoxGeometry(rockSize, rockSize * 0.75, rockSize);
                const rockMaterial = new THREE.MeshStandardMaterial({
                    color: rockColors[Math.floor(Math.random() * rockColors.length)],
                    flatShading: true
                });
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                // 更随机的位置分布
                const zOffset = -j * segmentLength - Math.random() * segmentLength;
                const xOffset = leftXPos + (Math.random() - 0.5) * 2.5;
                rock.position.set(xOffset, -1.35 + rockSize * 0.375, zOffset);
                rock.castShadow = false;
                leftGrassGroup.add(rock);
            }
        }
        // 设置草组的初始位置
        leftGrassGroup.position.z = -j * segmentLength;
        scene.add(leftGrassGroup);
        grass.push(leftGrassGroup);

        // 右侧草
        const rightGrassGroup = new THREE.Group();
        const rightXPos = 9.2 + (Math.random() - 0.5) * 1; // 调整到9.2的位置
        for (let i = 0; i < rightGrassCount; i++) {
            // 随机创建小草或石头
            if (Math.random() > 0.5) { // 50% 概率创建小草，50% 创建石头
                // 创建小草
                const grassGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
                const grassMaterial = new THREE.MeshStandardMaterial({
                    color: grassColors[Math.floor(Math.random() * grassColors.length)],
                    flatShading: true
                });
                const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
                grassMesh.rotation.y = Math.random() * Math.PI * 2;
                // 更随机的位置分布
                const zOffset = -j * segmentLength - Math.random() * segmentLength;
                const xOffset = rightXPos + (Math.random() - 0.5) * 2.5;
                grassMesh.position.set(xOffset, -1.2, zOffset);
                grassMesh.castShadow = false;
                rightGrassGroup.add(grassMesh);
            } else { // 50% 概率创建石头
                // 创建石头，大小不一
                const rockSize = 0.15 + Math.random() * 0.25; // 大小变化
                const rockGeometry = new THREE.BoxGeometry(rockSize, rockSize * 0.75, rockSize);
                const rockMaterial = new THREE.MeshStandardMaterial({
                    color: rockColors[Math.floor(Math.random() * rockColors.length)],
                    flatShading: true
                });
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                // 更随机的位置分布
                const zOffset = -j * segmentLength - Math.random() * segmentLength;
                const xOffset = rightXPos + (Math.random() - 0.5) * 2.5;
                rock.position.set(xOffset, -1.35 + rockSize * 0.375, zOffset);
                rock.castShadow = false;
                rightGrassGroup.add(rock);
            }
        }
        // 设置草组的初始位置
        rightGrassGroup.position.z = -j * segmentLength;
        scene.add(rightGrassGroup);
        grass.push(rightGrassGroup);
    }
}

// 创建low-poly树 - 使用多面体，3种样式
function createLowPolyTree(x, z, style, season) {
    const tree = new THREE.Group();
    style = style || Math.floor(Math.random() * 3);
    season = season || GameState.currentSeason;
    // 随机高度缩放（0.3 ~ 1.8倍）- 增大范围使树木大小更自然
    const heightScale = 0.3 + Math.random() * 1.5;

    // 根据季节获取树的颜色
    const seasonColors = GameConfig.SEASON_COLORS[season];
    const crownColors = seasonColors.tree;

    if (style === 0) {
        // 样式1: 多面体树
        const trunkGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0xA07850, roughness: 0.9, metalness: 0.1, flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.6 * heightScale;
        tree.add(trunk);

        const crownSizes = [1.5, 1.2, 0.9];
        const crownHeights = [1.8, 2.6, 3.3];
        for (let i = 0; i < 3; i++) {
            const crownGeometry = new THREE.IcosahedronGeometry(crownSizes[i] * heightScale, 0);
            const crownMaterial = new THREE.MeshStandardMaterial({
                color: crownColors[i % crownColors.length], roughness: 0.8, metalness: 0.1, flatShading: true
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = crownHeights[i] * heightScale;
            tree.add(crown);
        }
    } else if (style === 1) {
        // 样式2: 八面体树
        const trunkGeometry = new THREE.BoxGeometry(0.35, 1.0, 0.35);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355, roughness: 0.9, metalness: 0.1, flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.5 * heightScale;
        tree.add(trunk);

        const crownSizes = [1.3, 1.0, 0.7];
        const crownHeights = [1.6, 2.3, 2.9];
        for (let i = 0; i < 3; i++) {
            const crownGeometry = new THREE.OctahedronGeometry(crownSizes[i] * heightScale, 0);
            const crownMaterial = new THREE.MeshStandardMaterial({
                color: crownColors[i % crownColors.length], roughness: 0.8, metalness: 0.1, flatShading: true
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = crownHeights[i] * heightScale;
            tree.add(crown);
        }
    } else {
        // 样式3: 十二面体树
        const trunkGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7765, roughness: 0.9, metalness: 0.1, flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.4 * heightScale;
        tree.add(trunk);

        const crownSizes = [1.1, 0.8, 0.5];
        const crownHeights = [1.4, 2.0, 2.5];
        for (let i = 0; i < 3; i++) {
            const crownGeometry = new THREE.DodecahedronGeometry(crownSizes[i] * heightScale, 0);
            const crownMaterial = new THREE.MeshStandardMaterial({
                color: crownColors[i % crownColors.length], roughness: 0.8, metalness: 0.1, flatShading: true
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = crownHeights[i] * heightScale;
            tree.add(crown);
        }
    }

    tree.position.set(x, -1.35, z);
    return tree;
}

// 在赛道两侧创建树木
function createTrees() {
    const segmentLength = GameConfig.TRACK_LENGTH / GameConfig.TRACK_SEGMENTS;
    const treeSpacing = 30; // 增加间距，减少树的数量

    for (let side = -1; side <= 1; side += 2) {
        const baseXPos = side * 9.2; // 调整到9.2的位置

        for (let i = 0; i < GameConfig.TRACK_LENGTH / treeSpacing + 5; i++) { // 减少树的数量
            const zPos = -i * treeSpacing;
            const style = Math.floor(Math.random() * 3);
            // 减少左右偏移，使树木位置更一致
            const xOffset = (Math.random() - 0.5) * 1.5; // 减小偏移范围
            const tree = createLowPolyTree(baseXPos + xOffset, zPos, style, GameState.currentSeason); // 向中间靠近，传入当前季节
            // 随机旋转
            tree.rotation.y = Math.random() * Math.PI * 2;
            scene.add(tree);
            trees.push(tree);
        }
    }
}

// 季节转换函数
function updateSeason(delta) {
    if (!GameState.isPlaying) return;

    if (GameState.isTransitioning) {
        // 处理季节转换
        GameState.transitionProgress += delta;
        const transitionRatio = Math.min(GameState.transitionProgress / GameConfig.SEASON_TRANSITION_DURATION, 1);

        // 平滑更新树木颜色
        updateTreeColorsDuringTransition(transitionRatio);
        // 平滑更新雾浓度
        updateFogDuringTransition(transitionRatio);
        // 平滑更新草地和车道颜色
        updateEnvironmentColorsDuringTransition(transitionRatio);

        if (transitionRatio >= 1) {
            // 转换完成
            GameState.isTransitioning = false;
            GameState.transitionProgress = 0;
            GameState.currentSeason = GameState.nextSeason;
            updateSeasonalEffects();
        }
    } else {
        // 正常季节进程
        GameState.seasonTime += delta;
        GameState.seasonProgress = GameState.seasonTime / GameConfig.SEASON_DURATION;

        // 季节顺序：春 → 夏 → 秋 → 冬 → 春
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const currentSeasonIndex = seasons.indexOf(GameState.currentSeason);

        // 检查是否需要开始季节转换
        if (GameState.seasonTime >= GameConfig.SEASON_DURATION) {
            GameState.seasonTime = 0;
            GameState.nextSeason = seasons[(currentSeasonIndex + 1) % seasons.length];
            GameState.isTransitioning = true;
            // 存储当前树木的颜色，用于平滑过渡
            storeTreeColors();
            // 存储当前环境颜色和雾浓度，用于平滑过渡
            storeEnvironmentState();
        }
    }
}

// 存储当前环境状态，用于平滑过渡
function storeEnvironmentState() {
    // 存储当前雾浓度
    if (scene.fog) {
        GameState.currentFogDensity = scene.fog.density;
    }
    
    // 存储当前草地颜色
    GameState.currentGrassColor = GRASS_COLORS[GameState.currentSeason];
    
    // 存储当前车道颜色
    GameState.currentLaneColors = LANE_COLORS[GameState.currentSeason];
}

// 在季节转换期间平滑更新雾浓度
function updateFogDuringTransition(ratio) {
    const currentDensity = GameState.currentFogDensity || 0.01;
    const targetDensity = FOG_DENSITY[GameState.nextSeason];
    const newDensity = currentDensity + (targetDensity - currentDensity) * ratio;
    scene.fog = new THREE.FogExp2(0xB0C4DE, newDensity);
}

// 在季节转换期间平滑更新环境颜色
function updateEnvironmentColorsDuringTransition(ratio) {
    // 更新草地颜色
    const currentGrassColor = new THREE.Color(GameState.currentGrassColor || 0x7ACA8A);
    const targetGrassColor = new THREE.Color(GRASS_COLORS[GameState.nextSeason]);
    const newGrassColor = currentGrassColor.lerp(targetGrassColor, ratio);
    
    // 只更新草地颜色，不更新车道颜色
    for (let i = 0; i < trackParts.length; i++) {
        // 更新过渡区域（草地）和草地基础
        if ((i === 4 || i === 5) || (i === 15 || i === 16) || (i >= 22)) { // 22及以后是草地基础
            trackParts[i].material.color.set(newGrassColor);
        }
    }
    
    // 更新小草颜色
    for (let grassGroup of grass) {
        for (let child of grassGroup.children) {
            // 只更新小草的颜色，不更新石头
            if (child.geometry.type === 'ConeGeometry') {
                child.material.color.set(newGrassColor);
            }
        }
    }
}

// 存储树木当前颜色，用于平滑过渡
function storeTreeColors() {
    for (let tree of trees) {
        tree.userData.originalColors = [];
        for (let i = 1; i < tree.children.length; i++) { // 跳过树干，从树冠开始
            const crown = tree.children[i];
            tree.userData.originalColors.push(crown.material.color.clone());
        }
    }
}

// 在季节转换期间平滑更新树木颜色
function updateTreeColorsDuringTransition(ratio) {
    const currentColors = GameConfig.SEASON_COLORS[GameState.currentSeason].tree;
    const nextColors = GameConfig.SEASON_COLORS[GameState.nextSeason].tree;

    for (let tree of trees) {
        if (tree.userData.originalColors) {
            for (let i = 1; i < tree.children.length; i++) { // 跳过树干，从树冠开始
                const crown = tree.children[i];
                const originalColor = tree.userData.originalColors[i - 1];
                const targetColor = new THREE.Color(nextColors[(i - 1) % nextColors.length]);
                
                // 平滑插值颜色
                crown.material.color.lerpColors(originalColor, targetColor, ratio);
            }
        }
    }
}

// 更新季节性效果
function updateSeasonalEffects() {
    // 更新地面颜色
    const ground = scene.children.find(child => child.userData && child.userData.type === 'ground');
    if (ground) {
        ground.material.color.setHex(GameConfig.SEASON_COLORS[GameState.currentSeason].ground);
    }

    // 更新雾浓度
    scene.fog = new THREE.FogExp2(0xB0C4DE, FOG_DENSITY[GameState.currentSeason]);

    // 只更新草地颜色，不更新车道颜色
    const grassColor = new THREE.Color(GRASS_COLORS[GameState.currentSeason]);
    
    // 更新过渡区域（草地）和草地基础
    for (let i = 0; i < trackParts.length; i++) {
        if ((i === 4 || i === 5) || (i === 15 || i === 16) || (i >= 22)) { // 22及以后是草地基础
            trackParts[i].material.color.set(grassColor);
        }
    }
    
    // 更新小草颜色
    for (let grassGroup of grass) {
        for (let child of grassGroup.children) {
            // 只更新小草的颜色，不更新石头
            if (child.geometry.type === 'ConeGeometry') {
                child.material.color.set(grassColor);
            }
        }
    }

    // 重置粒子效果 - 先清除所有粒子
    resetParticleSystem();

    // 启动季节性粒子效果
    startSeasonalParticles();
}

// 启动季节性粒子效果
function startSeasonalParticles() {
    // 清除现有季节性粒子
    particles = particles.filter(p => !p.userData.isSeasonal);
    
    // 根据季节启动不同的粒子效果
    switch (GameState.currentSeason) {
        case 'autumn':
            startAutumnLeaves();
            break;
        case 'winter':
            startSnowfall();
            break;
        case 'spring':
        case 'summer':
            // 春夏季不启动粒子效果
            break;
    }
}

// 启动秋叶效果
function startAutumnLeaves() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createAutumnLeaf();
        }, i * 200);
    }
}

// 启动降雪效果
function startSnowfall() {
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            createSnowflake();
        }, i * 60);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}