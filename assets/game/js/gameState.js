// 游戏状态模块
const GameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    distance: 0,
    speed: GameConfig.SNAKE_SPEED,
    snakeLength: GameConfig.INITIAL_SNAKE_LENGTH,
    currentLane: 1,
    targetLane: 1,
    isInvulnerable: false,
    highScore: parseInt(localStorage.getItem('snakeRushHighScore')) || 0,
    soundEnabled: true,
    // 苹果计数器
    appleCount: 0,
    // 季节状态
    currentSeason: 'spring',
    nextSeason: 'summer',
    seasonProgress: 0,
    seasonTime: 0,
    isTransitioning: false,
    transitionProgress: 0,
    // 环境状态
    currentFogDensity: 0.01,
    currentGrassColor: GRASS_COLORS.spring,
    currentLaneColors: LANE_COLORS.spring
};

// 输入状态
let keys = { left: false, right: false };

// 上次生成障碍物的时间
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 0.3;  // 生成间隔（秒）

// 路径历史（用于蛇身跟随）
let pathHistory = [];
const MAX_PATH_HISTORY = 200;

// 存储树和小草的数组
let trees = [];
let grass = [];

// 蛇相关变量
let snakeHead;
let snakeBody = [];

// 障碍物数组
let apples = [];
let mines = [];

// 粒子数组
let particles = [];

// 粒子对象池
let particlePool = [];
const MAX_POOL_SIZE = 200;