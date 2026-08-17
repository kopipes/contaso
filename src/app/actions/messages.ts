'use server'

import { verifySession } from "@/lib/dal";
import { getMessages } from "@/lib/repliz";
import type { ReplizMessage } from "@/lib/repliz";

export type GetMessagesResult = {
  success: boolean;
  messages?: ReplizMessage[];
  error?: string;
};

export async function fetchChatMessages(chatId: string): Promise<GetMessagesResult> {
  await verifySession();
  try {
    const result = await getMessages(chatId, 1, 50);
    // Messages come newest first — reverse to show oldest first
    return { success: true, messages: result.docs.reverse() };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gagal memuat pesan" };
  }
}
