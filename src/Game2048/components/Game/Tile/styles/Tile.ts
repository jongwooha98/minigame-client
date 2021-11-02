// import { pixelSize } from '../../../styles';
const pixelSize = 6;

const tileMargin = 2 * pixelSize;

const tileWidthMultiplier = 12.5;

const tileWidth = tileWidthMultiplier * pixelSize;

export const tileTotalWidth = tileWidth + tileMargin;

/**
 * The duration of every animation in ms.
 * IMPORTANT! Check styles before modyfing this value!
 *
 * @constant {number} ms
 */
export const animationDuration = 250;
