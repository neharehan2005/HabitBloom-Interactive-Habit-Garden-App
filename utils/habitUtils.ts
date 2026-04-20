export const getGrowthStage = (streak: number, duration: number): number => {
    const p = (streak / Math.max(duration, 1)) * 100;
    if (p >= 100) return 4;
    if (p >= 75) return 3;
    if (p >= 50) return 2;
    if (p >= 0) return 1;
    return 0;
};

export const STAGE_EMOJIS = ['🌱', '🌿', '🌳', '🌸'];