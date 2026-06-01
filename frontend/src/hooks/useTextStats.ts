import { useMemo } from 'react';

/**
 * Strips HTML tags to get the exact raw word count.
 */
export const getWordCount = (html: string): number => {
	if (typeof window === 'undefined') return 0;
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	const text = (tempDiv.textContent || tempDiv.innerText || '').trim();
	if (!text) return 0;
	return text.split(/\s+/).filter(Boolean).length;
};

/**
 * Strips HTML tags to get the exact raw character count.
 */
export const getCharacterCount = (html: string): number => {
	if (typeof window === 'undefined') return 0;
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	return (tempDiv.textContent || tempDiv.innerText || '').length;
};

/**
 * Custom hook to dynamically calculate and return word/character counts for HTML text.
 */
export const useTextStats = (html: string) => {
	const wordCount = useMemo(() => getWordCount(html), [html]);
	const characterCount = useMemo(() => getCharacterCount(html), [html]);

	return {
		wordCount,
		characterCount,
		getWordCount,
		getCharacterCount
	};
};

export default useTextStats;
