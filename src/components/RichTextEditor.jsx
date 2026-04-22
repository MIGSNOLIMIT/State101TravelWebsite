"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";

const TOOLBAR_BUTTON_CLASS = "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-[#c6d6ee] bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-[#8eaddd] hover:bg-[#f4f8ff] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900";
const ACTIVE_TOOLBAR_BUTTON_CLASS = "border-[#1f57a4] bg-[#e8f0ff] text-[#1f57a4] dark:border-[#8fb4ea] dark:bg-[#16325c] dark:text-[#8fb4ea]";

function ToolbarButton({ active = false, disabled = false, onClick, title, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			aria-label={title}
			className={[TOOLBAR_BUTTON_CLASS, active ? ACTIVE_TOOLBAR_BUTTON_CLASS : ""].join(" ").trim()}
		>
			{children}
		</button>
	);
}

export default function RichTextEditor({ value = "", onChange, placeholder = "Start typing here..." }) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
		],
		content: value || "",
		editorProps: {
			attributes: {
				class: "min-h-[260px] rounded-b-lg border-2 border-t-0 border-[#adc3ea] bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#1f57a4] focus:ring-4 focus:ring-[#d8e5fb] dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-100",
			},
		},
		onUpdate: ({ editor: currentEditor }) => {
			onChange?.(currentEditor.getHTML());
		},
		immediatelyRender: false,
	});

	useEffect(() => {
		if (!editor) return;
		const nextValue = value || "";
		if (nextValue !== editor.getHTML()) {
			editor.commands.setContent(nextValue, { emitUpdate: false });
		}
	}, [editor, value]);

	if (!editor) {
		return (
			<div className="mt-2 rounded-lg border-2 border-[#adc3ea] bg-white px-4 py-3 text-sm text-slate-500 dark:border-[#4d6f9f] dark:bg-slate-950 dark:text-slate-400">
				Loading editor...
			</div>
		);
	}

	return (
		<div className="mt-2">
			<div className="flex flex-wrap gap-2 rounded-t-lg border-2 border-b-0 border-[#adc3ea] bg-[#f8fbff] px-3 py-3 dark:border-[#4d6f9f] dark:bg-slate-900">
				<ToolbarButton
					title="Bold"
					active={editor.isActive("bold")}
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<Bold size={16} />
				</ToolbarButton>
				<ToolbarButton
					title="Italic"
					active={editor.isActive("italic")}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<Italic size={16} />
				</ToolbarButton>
				<ToolbarButton
					title="Underline"
					active={editor.isActive("underline")}
					onClick={() => editor.chain().focus().toggleUnderline().run()}
				>
					<UnderlineIcon size={16} />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
			{!value ? <p className="mt-2 text-sm text-slate-500">{placeholder}</p> : null}
		</div>
	);
}