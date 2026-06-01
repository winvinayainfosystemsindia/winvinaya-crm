import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import { Box, styled, alpha } from '@mui/material';

// Styled container wrapping Quill, implementing premium modern UI/UX
const EditorWrapper = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'themeColor' && prop !== 'focused' && prop !== 'disabled'
})<{ themeColor?: string; focused?: boolean; disabled?: boolean }>(({ theme, themeColor, focused, disabled }) => {
	const activeColor = themeColor || theme.palette.primary.main;
	return {
		position: 'relative',
		borderRadius: '12px',
		border: '1px solid',
		borderColor: disabled 
			? '#e2e8f0' 
			: focused 
				? activeColor 
				: '#cbd5e1',
		backgroundColor: disabled ? '#f8fafc' : '#ffffff',
		boxShadow: focused ? `0 0 0 3px ${alpha(activeColor, 0.12)}` : 'none',
		transition: 'all 0.2s ease-in-out',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		'&:hover': {
			borderColor: disabled ? '#e2e8f0' : focused ? activeColor : alpha(activeColor, 0.5),
		},
		// Custom styles for Quill toolbar and container
		'& .ql-toolbar.ql-snow': {
			backgroundColor: disabled ? '#f1f5f9' : '#f8fafc',
			border: 'none',
			borderBottom: '1px solid #e2e8f0',
			padding: '8px 12px',
			display: disabled ? 'none' : 'block', // Hide toolbar in view mode
			transition: 'background-color 0.2s ease',
			fontFamily: theme.typography.fontFamily,
			'& .ql-formats': {
				marginRight: '12px',
			},
			'& button': {
				width: '28px',
				height: '28px',
				borderRadius: '6px',
				padding: '4px',
				transition: 'all 0.2s ease',
				color: '#475569',
				'&:hover': {
					backgroundColor: alpha(activeColor, 0.08),
					color: activeColor,
					'& .ql-stroke': { stroke: `${activeColor} !important` },
					'& .ql-fill': { fill: `${activeColor} !important` },
				},
				'&.ql-active': {
					backgroundColor: alpha(activeColor, 0.12),
					color: activeColor,
					'& .ql-stroke': { stroke: `${activeColor} !important` },
					'& .ql-fill': { fill: `${activeColor} !important` },
				}
			}
		},
		'& .ql-container.ql-snow': {
			border: 'none',
			fontFamily: theme.typography.fontFamily,
			fontSize: '0.875rem',
			color: theme.palette.text.primary,
			minHeight: '150px',
			backgroundColor: 'transparent',
		},
		'& .ql-editor': {
			padding: '14px 16px',
			lineHeight: 1.6,
			minHeight: '150px',
			fontFamily: theme.typography.fontFamily,
			color: theme.palette.text.primary,
			'&.ql-blank::before': {
				color: '#94a3b8',
				fontStyle: 'normal',
				left: '16px',
			},
			'&:focus': {
				outline: 'none',
			}
		}
	};
});

export interface RichTextEditorProps {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	disabled?: boolean;
	themeColor?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
	value,
	onChange,
	placeholder = 'Enter text...',
	disabled = false,
	themeColor
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const quillRef = useRef<any>(null);
	const isUpdatingRef = useRef<boolean>(false);
	const [focused, setFocused] = useState<boolean>(false);

	useEffect(() => {
		if (!containerRef.current) return;

		// Clean up any pre-existing toolbars in our dedicated parent container first
		const parent = containerRef.current.parentElement;
		if (parent) {
			const existingToolbars = parent.querySelectorAll('.ql-toolbar');
			existingToolbars.forEach(tb => tb.remove());
			
			// Also make sure the editor container is empty!
			containerRef.current.innerHTML = '';
		}

		// Initialize Quill editor instance dynamically
		const quill = new (Quill as any)(containerRef.current, {
			theme: 'snow',
			placeholder,
			readOnly: disabled,
			modules: {
				toolbar: [
					['bold', 'italic'],
					[{ list: 'ordered' }, { list: 'bullet' }],
					['clean']
				]
			}
		});

		// Enable native spell check (for browser and Grammarly support)
		quill.root.setAttribute('spellcheck', 'true');

		quillRef.current = quill;

		// Paste initial value safely
		if (value) {
			quill.clipboard.dangerouslyPasteHTML(value);
		}

		// Sync local changes to parent handler
		quill.on('text-change', () => {
			if (isUpdatingRef.current) return;
			const html = containerRef.current?.querySelector('.ql-editor')?.innerHTML || '';
			if (html === '<p><br></p>') {
				onChange('');
			} else {
				onChange(html);
			}
		});

		// Listen to selection/focus changes to toggle state
		quill.on('selection-change', (range: any) => {
			setFocused(!!range);
		});

		return () => {
			// Cleanup DOM on component unmount (handles StrictMode double-rendering safely)
			if (containerRef.current) {
				const editorEl = containerRef.current;
				const previous = editorEl.previousSibling;
				if (previous && (previous as HTMLElement).classList?.contains('ql-toolbar')) {
					previous.remove();
				}
				editorEl.innerHTML = '';
			}
			quillRef.current = null;
		};
	}, []);

	// Keep editor enabled/disabled state synced
	useEffect(() => {
		if (quillRef.current) {
			quillRef.current.enable(!disabled);
		}
	}, [disabled]);

	// Keep editor content synchronized with external value changes
	useEffect(() => {
		if (!quillRef.current) return;
		const currentHtml = containerRef.current?.querySelector('.ql-editor')?.innerHTML || '';
		if (value !== currentHtml && value !== '<p><br></p>') {
			isUpdatingRef.current = true;
			const selection = quillRef.current.getSelection();
			quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
			if (selection) {
				quillRef.current.setSelection(selection);
			}
			isUpdatingRef.current = false;
		}
	}, [value]);

	return (
		<EditorWrapper themeColor={themeColor} focused={focused} disabled={disabled}>
			<div ref={containerRef} />
		</EditorWrapper>
	);
};

export default RichTextEditor;
