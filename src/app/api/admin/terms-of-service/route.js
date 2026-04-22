import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

function looksLikeHtml(value) {
	return /<[^>]+>/.test(String(value || ''));
}

function textToHtml(text) {
	const lines = String(text || '').split(/\r?\n/);
	const blocks = [];
	let listType = null;
	let listItems = [];

	const flushList = () => {
		if (!listType || !listItems.length) return;
		const tag = listType === 'ol' ? 'ol' : 'ul';
		blocks.push(`<${tag}>${listItems.map((item) => `<li>${item}</li>`).join('')}</${tag}>`);
		listType = null;
		listItems = [];
	};

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) {
			flushList();
			continue;
		}

		const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
		const bulletMatch = line.match(/^(?:•|-)\s+(.+)$/);

		if (orderedMatch) {
			if (listType && listType !== 'ol') flushList();
			listType = 'ol';
			listItems.push(orderedMatch[2]);
			continue;
		}

		if (bulletMatch) {
			if (listType && listType !== 'ul') flushList();
			listType = 'ul';
			listItems.push(bulletMatch[1]);
			continue;
		}

		flushList();
		if (/^\d+\.\s+/.test(line)) {
			blocks.push(`<h2>${line}</h2>`);
			continue;
		}

		blocks.push(`<p>${line}</p>`);
	}

	flushList();
	return blocks.join('');
}

function htmlToEditorText(html) {
	let value = String(html || '');
	value = value.replace(/<h2>(.*?)<\/h2>/gis, '$1\n');
	value = value.replace(/<li>(.*?)<\/li>/gis, '• $1\n');
	value = value.replace(/<br\s*\/?>/gi, '\n');
	value = value.replace(/<\/p>\s*<p>/gi, '\n\n');
	value = value.replace(/<[^>]+>/g, '');
	return value.trim();
}

// GET: Fetch ToS and accreditations
export async function GET() {
	try {
		const tos = await prisma.termsOfService.findFirst();
		const accreditations = await prisma.accreditation.findMany();
		const editorContent = looksLikeHtml(tos?.editorContent || '')
			? tos.editorContent
			: looksLikeHtml(tos?.content || '')
				? tos.content
				: textToHtml(tos?.editorContent || '');
		return NextResponse.json({
			heading: tos?.heading || '',
			content: tos?.content || '',
			editorContent: editorContent || htmlToEditorText(tos?.content || ''),
			accreditations: accreditations.map(a => ({ logoUrl: a.logoUrl, name: a.name })),
		});
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch Terms of Service.' }, { status: 500 });
	}
}

// POST: Update ToS and accreditations
export async function POST(req) {
	try {
		const gate = await requireAdminRoles(['admin', 'editor']);
		if (gate.error) return gate.error;
		const { user } = gate;
		const body = await req.json();
		// Update ToS
		await prisma.termsOfService.upsert({
			where: { id: 1 },
			update: {
				heading: body.heading || '',
				editorContent: body.editorContent || '',
				content: body.content || '',
			},
			create: {
				id: 1,
				heading: body.heading || '',
				editorContent: body.editorContent || '',
				content: body.content || '',
			},
		});
		// Update accreditations
		if (Array.isArray(body.accreditations)) {
			// Remove all and re-add
			await prisma.accreditation.deleteMany();
			for (const acc of body.accreditations) {
				await prisma.accreditation.create({
					data: {
						logoUrl: acc.logoUrl || '',
						name: acc.name || '',
					},
				});
			}
		}
		await safeWriteAuditLog(req, {
			category: 'content',
			action: 'content.terms.update',
			status: 'SUCCESS',
			summary: `${user.name || user.email} updated the Terms of Service page.`,
			actorSnapshot: buildActorSnapshot(user),
			targetType: 'terms-of-service',
			targetId: 1,
			targetLabel: 'Terms Of Service',
			details: {
				heading: body.heading || '',
				editorContentLength: String(body.editorContent || '').length,
				accreditationsCount: Array.isArray(body.accreditations) ? body.accreditations.length : 0,
			},
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to update Terms of Service.' }, { status: 500 });
	}
}
