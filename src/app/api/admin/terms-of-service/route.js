import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

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
		return NextResponse.json({
			heading: tos?.heading || '',
			content: tos?.content || '',
			editorContent: tos?.editorContent || htmlToEditorText(tos?.content || ''),
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
