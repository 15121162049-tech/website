// 游戏配置模块
const GameConfig = {
    INITIAL_SNAKE_LENGTH: 3,
    SNAKE_SPEED: 30,  // 道路移动速度（单位/秒）
    SPEED_INCREMENT: 0.5,  // 速度增量
    LANE_WIDTH: 3.5, // 车道宽度设置为3.5
    MAX_LANES: 4,  // 4条车道
    SPAWN_Z: -100,  // 生成位置（前方）
    DESPAWN_Z: 30,  // 消失位置（后方）
    APPLE_SCORE: 100,
    INVULNERABILITY_TIME: 500,
    GRID_SIZE: 200,
    SEGMENT_SPACING: 1.0, // 减小蛇块间的间隔
    TRACK_LENGTH: 2000,  // 更长的赛道
    TRACK_SEGMENTS: 40,  // 更多赛道段数
    LATERAL_SPEED: 15,  // 左右移动速度
    // 季节设置
    SEASON_DURATION: 30,  // 每个季节持续30秒，缩短周期
    SEASON_TRANSITION_DURATION: 5,  // 季节切换时间5秒
    SEASON_COLORS: {
        spring: { tree: [0x6BC17A, 0x7ACA8A, 0x8AD09A], ground: 0xffffff },
        summer: { tree: [0x4CAF50, 0x66BB6A, 0x81C784], ground: 0xffffff },
        autumn: { tree: [0xFFB050, 0xFFC070, 0xFFCF80], ground: 0xF5F5DC },
        winter: { tree: [0xF0F8FF, 0xE6F3FF, 0xD9ECFF], ground: 0xFFFFFF }
    }
};

// 雾浓度配置
const FOG_DENSITY = {
    spring: 0.01,
    summer: 0.015,
    autumn: 0.02,
    winter: 0.025
};

// 草地颜色配置
const GRASS_COLORS = {
    spring: 0x90EE90,  // 浅绿色
    summer: 0x66BB6A,  // 中绿色（更接近春季颜色）
    autumn: 0xFFF0C0,  // 浅黄色
    winter: 0x87CEEB   // 浅紫蓝
};

// 车道颜色配置
const LANE_COLORS = {
    spring: [
        0xB8D4E8,  // 浅蓝色
        0xC2E4C8,  // 浅绿色
        0xE8D8C8,  // 浅橙色
        0xD8C8E0   // 浅紫色
    ],
    summer: [
        0x87CEEB,  // 蓝色
        0x90EE90,  // 绿色
        0xFFA07A,  // 橙色
        0xDA70D6   // 紫色
    ],
    autumn: [
        0xFFB6C1,  // 浅粉红
        0xFFD700,  // 金色
        0xFFA500,  // 橙色
        0x9370DB   // 紫色
    ],
    winter: [
        0xE0FFFF,  // 浅蓝色
        0xF0F8FF,  // 浅蓝色
        0xE6E6FA,  // 浅紫色
        0xF8F8FF   // 白色
    ]
};