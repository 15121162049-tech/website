function getParticle() {
    if (particlePool.length > 0) {
        return particlePool.pop();
    }
    // 创建新粒子
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 1
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.userData = {
        velocity: new THREE.Vector3(),
        rotationSpeed: new THREE.Vector3(),
        life: 1
    };
    return particle;
}

function returnParticle(particle) {
    if (particlePool.length < MAX_POOL_SIZE) {
        scene.remove(particle);
        particlePool.push(particle);
    } else {
        scene.remove(particle);
    }
}

function createParticles(position, color) {
    // 创建增强的粒子效果
    const particleCount = 15;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
        const particle = getParticle();
        particle.position.copy(position);
        particle.material.color.setHex(color);
        particle.material.opacity = 1;
        particle.rotation.set(0, 0, 0);
        
        // 随机大小
        const size = 0.15 + Math.random() * 0.15;
        particle.scale.set(size, size, size);
        
        // 更丰富的速度变化，确保粒子远离镜头
        particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.4,
            Math.random() * 0.3 + 0.1,
            Math.random() * 0.6 + 0.2
        );
        particle.userData.life = 1;
        scene.add(particle);
        newParticles.push(particle);
    }

    // 动画粒子
    function animateParticles() {
        for (let i = newParticles.length - 1; i >= 0; i--) {
            const p = newParticles[i];
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.01;
            p.userData.life -= 0.02;
            p.material.opacity = p.userData.life;
            p.rotation.x += 0.15;
            p.rotation.y += 0.15;
            p.rotation.z += 0.1;
            
            // 大小变化
            const scale = p.userData.life * 0.8 + 0.2;
            p.scale.set(scale, scale, scale);

            if (p.userData.life <= 0) {
                returnParticle(p);
                newParticles.splice(i, 1);
            }
        }

        if (newParticles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    }
    animateParticles();
}

// 烟花效果函数
function createFireworksEffect(position) {
    // 烟花颜色数组
    const colors = [0xFF2A6D, 0x00FF9D, 0xFF9E00, 0x00FFFF, 0xFF69B4, 0xFFFF00];
    const particleCount = 50; // 更多粒子
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particle = getParticle();
        particle.position.copy(position);
        
        // 随机选择颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.material.color.setHex(color);
        particle.material.opacity = 1;
        particle.rotation.set(0, 0, 0);
        
        // 随机大小
        const size = 0.1 + Math.random() * 0.2;
        particle.scale.set(size, size, size);
        
        // 烟花爆炸效果 - 向各个方向散开
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.1 + Math.random() * 0.5;
        const speed = 0.3 + Math.random() * 0.3;
        
        particle.userData.velocity.set(
            Math.cos(angle) * radius * speed,
            Math.sin(angle) * radius * speed + 0.2, // 向上的初速度
            Math.random() * 0.5 * speed + 0.1 // 确保粒子远离镜头
        );
        particle.userData.life = 1;
        scene.add(particle);
        particles.push(particle);
    }

    // 动画粒子
    function animateFireworks() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.015; // 重力效果
            p.userData.life -= 0.015;
            p.material.opacity = p.userData.life;
            p.rotation.x += 0.2;
            p.rotation.y += 0.2;
            p.rotation.z += 0.1;
            
            // 大小变化 - 先膨胀后收缩
            let scale;
            if (p.userData.life > 0.7) {
                scale = (1 - p.userData.life) * 2 + 0.5; // 膨胀
            } else {
                scale = p.userData.life * 1.5 + 0.2; // 收缩
            }
            p.scale.set(scale, scale, scale);

            if (p.userData.life <= 0) {
                returnParticle(p);
                particles.splice(i, 1);
            }
        }

        if (particles.length > 0) {
            requestAnimationFrame(animateFireworks);
        }
    }
    animateFireworks();
}

// 季节性粒子效果（落叶、雪花）
function createSeasonalParticles() {
    if (!GameState.isPlaying) return;

    // 根据季节创建不同的粒子，作为视觉干扰
    if (GameState.currentSeason === 'autumn') {
        // 落叶效果 - 增加数量以增强视觉干扰
        if (Math.random() < 0.6) { // 60% 概率生成
            // 秋天只有黄色的叶子
            const color = 0xFFD700;
            
            // 增大叶子尺寸，使其更明显
            const geometry = new THREE.PlaneGeometry(1.0, 0.6);
            const material = new THREE.MeshStandardMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.8
            });
            const leaf = new THREE.Mesh(geometry, material);
            
            // 更分散的随机位置，远离镜头
            leaf.position.x = -20 + Math.random() * 40;
            leaf.position.y = 5 + Math.random() * 10;
            leaf.position.z = -Math.random() * 400 - 50;
            
            // 随机旋转
            leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            
            // 存储速度和生命周期，确保粒子远离镜头
            leaf.userData = {
                isSeasonal: true,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.6,
                    -0.3 - Math.random() * 0.3,
                    -0.1 - Math.random() * 0.3 // 负速度，远离相机
                ),
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.06,
                    (Math.random() - 0.5) * 0.06,
                    (Math.random() - 0.5) * 0.06
                ),
                life: 1,
                decay: 0.002
            };
            
            scene.add(leaf);
            particles.push(leaf);
        }
    } else if (GameState.currentSeason === 'winter') {
        // 雪花效果 - 增加数量以增强视觉干扰
        if (Math.random() < 0.7) { // 70% 概率生成
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            const snowflake = new THREE.Mesh(geometry, material);
            
            // 更分散的随机位置，远离镜头
            snowflake.position.x = -20 + Math.random() * 40;
            snowflake.position.y = 5 + Math.random() * 10;
            snowflake.position.z = -Math.random() * 400 - 50;
            
            // 存储速度和生命周期，确保粒子远离镜头
            snowflake.userData = {
                isSeasonal: true,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    -0.2 - Math.random() * 0.2,
                    -0.1 - Math.random() * 0.2 // 负速度，远离相机
                ),
                life: 1,
                decay: 0.0015
            };
            
            scene.add(snowflake);
            particles.push(snowflake);
        }
    }
}

// 更新粒子效果
function updateParticles(delta) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        if (p.userData.isSeasonal) {
            // 处理季节性粒子（树叶和雪花）
            p.position.add(p.userData.velocity);
            
            // 树叶特有旋转
            if (p.userData.rotationSpeed) {
                p.rotation.x += p.userData.rotationSpeed.x;
                p.rotation.y += p.userData.rotationSpeed.y;
                p.rotation.z += p.userData.rotationSpeed.z;
            }
            
            // 逐渐消失效果
            if (p.userData.decay) {
                p.userData.life -= p.userData.decay;
                p.material.opacity = p.userData.life;
            }
            
            // 检查是否需要重置（当粒子落地、超出范围或生命周期结束）
            if (p.position.y < -2 || p.position.z < -500 || p.userData.life <= 0) {
                // 为了保持效果持续，重新创建粒子
                if (GameState.currentSeason === 'autumn') {
                    createAutumnLeaf();
                } else if (GameState.currentSeason === 'winter') {
                    createSnowflake();
                } else {
                    // 春夏季不创建粒子，直接移除
                }
                scene.remove(p);
                particles.splice(i, 1);
            }
        } else {
            // 处理普通粒子
            p.position.add(p.userData.velocity);
            p.userData.life -= 0.005;
            p.material.opacity = p.userData.life;
            p.rotation.x += 0.05;
            p.rotation.y += 0.05;

            if (p.userData.life <= 0 || p.position.z > 50) {
                returnParticle(p);
                particles.splice(i, 1);
            }
        }
    }
}

// 重置粒子系统
function resetParticleSystem() {
    for (let p of particles) {
        if (p.userData.isSeasonal) {
            scene.remove(p);
        } else {
            returnParticle(p);
        }
    }
    particles = [];
}

// 创建秋叶
function createAutumnLeaf() {
    const geometry = new THREE.PlaneGeometry(1.8, 1.2);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        transparent: true,
        opacity: 1.0
    });
    const leaf = new THREE.Mesh(geometry, material);
    
    // 更分散的随机位置，远离镜头
    leaf.position.x = -20 + Math.random() * 40;
    leaf.position.y = 5 + Math.random() * 10;
    leaf.position.z = -Math.random() * 400 - 50;
    
    // 随机旋转
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    // 存储速度和生命周期，确保粒子远离镜头
    leaf.userData = {
        isSeasonal: true,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.6,
            -0.3 - Math.random() * 0.3,
            -0.1 - Math.random() * 0.3 // 负速度，远离相机
        ),
        rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.06,
            (Math.random() - 0.5) * 0.06,
            (Math.random() - 0.5) * 0.06
        ),
        life: 1,
        decay: 0.002
    };
    
    scene.add(leaf);
    particles.push(leaf);
}

// 创建雪花
function createSnowflake() {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 1.0
    });
    const snowflake = new THREE.Mesh(geometry, material);
    
    // 更分散的随机位置，远离镜头
    snowflake.position.x = -20 + Math.random() * 40;
    snowflake.position.y = 5 + Math.random() * 10;
    snowflake.position.z = -Math.random() * 400 - 50;
    
    // 存储速度和生命周期，确保粒子远离镜头
    snowflake.userData = {
        isSeasonal: true,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            -0.2 - Math.random() * 0.2,
            -0.1 - Math.random() * 0.2 // 负速度，远离相机
        ),
        life: 1,
        decay: 0.0015
    };
    
    scene.add(snowflake);
    particles.push(snowflake);
}

// 蛇块破碎动效
function createBlockDestruction(position) {
    const particleCount = 15;
    const particles = [];
    const blockColor = 0x00CC7A; // 蛇身颜色

    for (let i = 0; i < particleCount; i++) {
        // 创建不规则碎片
        const particle = getParticle();
        particle.position.copy(position);
        particle.position.x += (Math.random() - 0.5) * 0.5;
        particle.position.y += (Math.random() - 0.5) * 0.5;
        particle.position.z += (Math.random() - 0.5) * 0.5;
        particle.material.color.setHex(blockColor);
        particle.material.opacity = 1;
        particle.rotation.set(0, 0, 0);
        
        const size = 0.15 + Math.random() * 0.15;
        particle.scale.set(size, size, size);

        particle.userData.velocity.set(
            (Math.random() - 0.5) * 0.4,
            Math.random() * 0.3 + 0.1,
            (Math.random() - 0.5) * 0.4
        );
        particle.userData.rotationSpeed.set(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        particle.userData.life = 1;
        scene.add(particle);
        particles.push(particle);
    }

    // 动画碎片
    function animateFragments() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.015; // 重力
            p.rotation.x += p.userData.rotationSpeed.x;
            p.rotation.y += p.userData.rotationSpeed.y;
            p.rotation.z += p.userData.rotationSpeed.z;
            p.userData.life -= 0.025;
            p.material.opacity = p.userData.life;
            p.material.color.setHex(p.userData.life > 0.5 ? blockColor : 0xFF0000); // 渐变红色

            if (p.userData.life <= 0) {
                returnParticle(p);
                particles.splice(i, 1);
            }
        }

        if (particles.length > 0) {
            requestAnimationFrame(animateFragments);
        }
    }
    animateFragments();
}