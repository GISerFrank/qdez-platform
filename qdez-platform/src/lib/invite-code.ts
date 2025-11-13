import { customAlphabet } from 'nanoid';

// 邀请码字符集（排除易混淆字符：0,O,1,I,l）
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(ALPHABET, 6);

export interface InviteCodeOptions {
    type?: 'random' | 'meaningful' | 'custom';
    prefix?: string;
    customCode?: string;
    expiresInDays?: number;
}

/**
 * 生成邀请码
 */
export function generateInviteCode(options: InviteCodeOptions = {}): string {
    const {
        type = 'random',
        prefix,
        customCode,
    } = options;

    const year = new Date().getFullYear();
    const basePrefix = prefix || `QDEZ-${year}`;

    switch (type) {
        case 'custom':
            if (!customCode) throw new Error('Custom code is required');
            return `${basePrefix}-${customCode.toUpperCase()}`;

        case 'meaningful':
            // 生成有意义的代码（基于时间）
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const random = nanoid().substring(0, 4);
            return `${basePrefix}-${month}${random}`;

        case 'random':
        default:
            return `${basePrefix}-${nanoid()}`;
    }
}

/**
 * 生成有意义的邀请码词组
 */
export function generateMeaningfulCode(theme?: string): string {
    const themes = {
        cities: ['BOSTON', 'NEWYORK', 'LONDON', 'TOKYO', 'SYDNEY'],
        schools: ['MIT', 'HARVARD', 'STANFORD', 'OXFORD', 'CALTECH'],
        majors: ['CS', 'ECON', 'MATH', 'PHYSICS', 'BIO'],
        seasons: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'],
    };

    const allThemes = Object.values(themes).flat();
    const randomTheme = theme || allThemes[Math.floor(Math.random() * allThemes.length)];
    const random = nanoid().substring(0, 3);

    return `${randomTheme}${random}`;
}

/**
 * 验证邀请码格式
 */
export function validateInviteCodeFormat(code: string): boolean {
    // 格式: QDEZ-YYYY-XXXXXX
    const pattern = /^QDEZ-\d{4}-[A-Z0-9]{3,10}$/;
    return pattern.test(code);
}

/**
 * 计算过期时间
 */
export function calculateExpiryDate(days: number = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}