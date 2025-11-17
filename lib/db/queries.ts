import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, users, dictionary, transcriptions, NewTranscription } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}


export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getDictionaryWords() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: dictionary.id,
      word: dictionary.word,
      createdAt: dictionary.createdAt,
      updatedAt: dictionary.updatedAt
    })
    .from(dictionary)
    .where(and(eq(dictionary.userId, user.id), isNull(dictionary.deletedAt)))
    .orderBy(desc(dictionary.createdAt));
}

export async function createTranscription(data: Omit<NewTranscription, 'userId'>) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [transcription] = await db
    .insert(transcriptions)
    .values({
      ...data,
      userId: user.id,
    })
    .returning();

  return transcription;
}

export async function updateTranscription(id: number, data: Partial<NewTranscription>) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [transcription] = await db
    .update(transcriptions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(transcriptions.id, id), eq(transcriptions.userId, user.id)))
    .returning();

  return transcription;
}

export async function getTranscription(id: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [transcription] = await db
    .select()
    .from(transcriptions)
    .where(and(eq(transcriptions.id, id), eq(transcriptions.userId, user.id), isNull(transcriptions.deletedAt)))
    .limit(1);

  return transcription;
}

export async function getTranscriptions() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: transcriptions.id,
      transcription: transcriptions.transcription,
      status: transcriptions.status,
      createdAt: transcriptions.createdAt,
      updatedAt: transcriptions.updatedAt,
    })
    .from(transcriptions)
    .where(and(eq(transcriptions.userId, user.id), isNull(transcriptions.deletedAt)))
    .orderBy(desc(transcriptions.createdAt));
}

export async function deleteTranscription(id: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const [transcription] = await db
    .update(transcriptions)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(transcriptions.id, id), eq(transcriptions.userId, user.id)))
    .returning();

  return transcription;
}
