import { desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

// GET /api/contactrequests -> return all requests ordered by submittedAt desc
export const GET = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  try {
    const requests = await db
      .select()
      .from(schema.contactrequests)
      .orderBy(desc(schema.contactrequests.submittedAt));
    return NextResponse.json(requests);
  } catch (e) {
    console.error('Error fetching contact requests:', e);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await client.end();
  }
};

// POST /api/contactrequests -> create a new contact request
export const POST = async (req: NextRequest) => {
  const dataUnknown = (await req.json()) as unknown;
  type ContactInsert = typeof schema.contactrequests.$inferInsert;
  const data = dataUnknown as Partial<ContactInsert> & {
    scheduledDate?: string | Date | null;
    respondedAt?: string | Date | null;
  };
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  try {
    const validType =
      typeof data.type === 'string' && schema.contactType.enumValues.includes(data.type)
        ? data.type
        : undefined;
    if (!validType) {
      await client.end();
      return NextResponse.json(
        { error: `type must be one of ${schema.contactType.enumValues.join(', ')}` },
        { status: 400 },
      );
    }

    const priority =
      typeof data.priority === 'string' && schema.priorityLevel.enumValues.includes(data.priority)
        ? data.priority
        : null;
    const status =
      typeof data.status === 'string' && schema.contactStatus.enumValues.includes(data.status)
        ? data.status
        : 'unread';

    const scheduledDate =
      typeof data.scheduledDate === 'string' || data.scheduledDate instanceof Date
        ? new Date(String(data.scheduledDate))
        : null;
    const respondedAt =
      typeof data.respondedAt === 'string' || data.respondedAt instanceof Date
        ? new Date(String(data.respondedAt))
        : null;

    const insertPayload: ContactInsert = {
      type: validType,
      name: typeof data.name === 'string' ? data.name : '',
      email: typeof data.email === 'string' ? data.email : '',
      phone: typeof data.phone === 'string' ? data.phone : null,
      subject: typeof data.subject === 'string' ? data.subject : null,
      message: typeof data.message === 'string' ? data.message : null,
      meetingType: typeof data.meetingType === 'string' ? data.meetingType : null,
      scheduledDate,
      durationMinutes:
        typeof data.durationMinutes === 'number' && Number.isFinite(data.durationMinutes)
          ? data.durationMinutes
          : null,
      status,
      priority,
      respondedAt,
      userId: typeof data.userId === 'string' ? data.userId : null,
    };

    const inserted = await db.insert(schema.contactrequests).values(insertPayload).returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error('Error creating contact request:', e);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await client.end();
  }
};
