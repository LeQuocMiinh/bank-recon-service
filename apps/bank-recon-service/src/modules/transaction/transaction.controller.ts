import { Context } from "hono";
import { portgressDb } from "../../stores/db";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { addCacheExpire, getCache } from "../../stores/redis";
import { parseAmount } from "../../utils";
import { ImportTransactionDto } from "../../dtos";

export async function importTransactions(c: Context) {
  try {
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (!file) return c.json({ ok:false, error: "No file uploaded" }, 400);

    const user = c.get("user") as any;

    const cacheKey = `userIdTransaction:${user.userId}`;
    await addCacheExpire(cacheKey, user.userId);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const BATCH_SIZE = 10_000;
    let batch: any[] = [];
    let imported = 0;

    const stream = Readable.from(buffer).pipe(csvParser());

    for await (const row of stream) {
       const rawRow = {
          date: row.date?.trim(),
          content: row.content?.trim(),
          amount: parseAmount(row.amount?.trim()),
          type: row.type?.trim(),
          userId: Number(await getCache(cacheKey))
        };c

        const parsed = ImportTransactionDto.safeParse(rawRow);
        if (!parsed.success) {
          continue;
        }
      
        batch.push(rawRow);

      if (batch.length >= BATCH_SIZE) {
        await portgressDb.transaction.createMany({ data: batch });
        imported += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await portgressDb.transaction.createMany({ data: batch });
      imported += batch.length;
    }

    return c.json({ ok:true, message:'Import transactions successfully' , total: imported });
  } catch (error) {
    console.error(error);
    return c.json({ ok:false, error: "Internal Server Error" }, 500);
  }
}

export async function listTransactions(c: Context) {
  try {
  const user = c.get("user") as { id: number };
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const page = parseInt(c.req.query("page") || "1", 10);
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const skip = (page - 1) * limit;

  const transactions = await portgressDb.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    skip,
    take: limit,
  });

  const total = await portgressDb.transaction.count({
    where: { userId: user.id },
  });

  return c.json({
    ok: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    transactions,
  });
  } catch (error) {
       console.error(error);
    return c.json({ ok:false, error: "Internal Server Error" }, 500);
  }

};
