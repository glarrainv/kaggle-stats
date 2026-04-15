import { makeBadge, ValidationError } from 'badge-maker'
import { CARD_CONFIG, MEDAL_COLORS } from './types.js';

export function Badge(username, item, itemtype, theme = 'kaggle') {
    const itemName = CARD_CONFIG[itemtype].headerText || 'Unknown';
    const { medal = 'STARTING' } = item;
    const themeColor = theme === 'kaggle' ? '#fff' : theme; // default to kaggle blue if theme not provided
    const color = MEDAL_COLORS[medal] || MEDAL_COLORS['STARTING'];
    const badgeConfig = {
        label: medal,
        message: "Kaggle " + itemName,
        labelColor: color,
        color: themeColor,
        style: 'flat',
    };
    try {
        return makeBadge(badgeConfig);
    } catch (error) {
        return console.error('Error generating badge:', error);
    }
}