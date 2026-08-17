'use server'

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { replyToComment, sendMessage } from "@/lib/repliz";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReplySchema = z.object({
  message: z.string().min(1).max(2000),
});

export type ReplyState = {
  success?: boolean;
  error?: string;
};

export async function replyCommentAction(
  accountId: string,
  replizCommentId: string,
  _prev: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const session = await verifySession();

  const parsed = ReplySchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) {
    return { error: "Pesan tidak boleh kosong" };
  }

  const { message } = parsed.data;

  try {
    await replyToComment(replizCommentId, message);
  } catch {
    return { error: "Gagal mengirim balasan. Coba lagi." };
  }

  await db.replyLog.create({
    data: {
      trackedAccountId: accountId,
      userId: session.userId,
      type: "comment",
      externalId: replizCommentId,
      body: message,
    },
  });

  revalidatePath(`/accounts/${accountId}`);
  return { success: true };
}

export async function sendChatAction(
  accountId: string,
  replizChatId: string,
  _prev: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const session = await verifySession();

  const parsed = ReplySchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) {
    return { error: "Pesan tidak boleh kosong" };
  }

  const { message } = parsed.data;

  try {
    await sendMessage(replizChatId, message);
  } catch {
    return { error: "Gagal mengirim pesan. Coba lagi." };
  }

  await db.replyLog.create({
    data: {
      trackedAccountId: accountId,
      userId: session.userId,
      type: "chat",
      externalId: replizChatId,
      body: message,
    },
  });

  revalidatePath(`/accounts/${accountId}?tab=chat`);
  return { success: true };
}
