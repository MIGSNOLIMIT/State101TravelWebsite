import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch ToS and accreditations
export async function GET() {
	try {
		const tos = await prisma.termsOfService.findFirst();
		const accreditations = await prisma.accreditation.findMany();
		return NextResponse.json({
			heading: tos?.heading || '',
			content: tos?.content || '',
			accreditations: accreditations.map(a => ({ logoUrl: a.logoUrl, name: a.name })),
		});
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch Terms of Service.' }, { status: 500 });
	}
}

// POST: Update ToS and accreditations
export async function POST(req) {
	try {
		const body = await req.json();
		// Update ToS
		await prisma.termsOfService.upsert({
			where: { id: 1 },
			update: {
				heading: body.heading || '',
				content: body.content || '',
			},
			create: {
				id: 1,
				heading: body.heading || '',
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
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to update Terms of Service.' }, { status: 500 });
	}
}
