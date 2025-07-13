export const PLAYER_COLORS = ['#e63946', '#457b9d', '#f1faee', '#a8dadc', '#ffbe0b', '#8338ec', '#3a86ff'];
export const PLAYER_RADIUS = 20;
export const PLAYER_SPEED = 200;
export const BULLET_SPEED = 400;
export const BULLET_RADIUS = 5;
export const RESPAWN_TIME = 3000;
export const NUM_FAKE_PLAYERS = 5;

// Wave System Constants
export const INITIAL_BOT_COUNT = 2; // Bots at wave 1
export const BOT_INCREASE_PER_WAVE = 1; // Additional bots per wave
export const MAX_BOTS_ON_SCREEN = 15; // Maximum bots allowed
export const WAVE_BREAK_TIME = 3 * 1000; // 3 seconds break between waves

// Difficulty Scaling
export const BOT_SPEED_INCREASE_PER_WAVE = 0.1; // 10% speed increase per wave
export const BOT_SHOOT_RATE_INCREASE_PER_WAVE = 0.07; // 7% faster shooting per wave
export const BASE_BOT_SPEED = 0.6; // Base bot speed multiplier
export const BASE_BOT_SHOOT_INTERVAL = 1500; // Base shoot interval in ms
