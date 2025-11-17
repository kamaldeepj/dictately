import { getDictionaryWords } from '@/lib/db/queries';

export async function GET() {
  const words = await getDictionaryWords();
  return Response.json(words);
}

