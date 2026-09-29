import { getAdmin, unauthorizedResponse } from "@/lib/admin/session";
import { getStore, StoreError } from "@/lib/admin/store";
import { applyEventOp, EventOpError, type EventOp } from "@/lib/admin/eventsRepo";

/** Create, update or delete one event. Each call is one commit. */
export async function POST(request: Request): Promise<Response> {
  const admin = await getAdmin();
  if (!admin) return unauthorizedResponse();

  const store = getStore();
  if (!store) return Response.json({ error: "Saving is not set up on this deployment yet." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as EventOp | null;
  if (!body || !["create", "update", "delete"].includes(body.op)) {
    return Response.json({ error: "That request was not understood." }, { status: 400 });
  }
  if (body.op !== "delete" && !Array.isArray(body.photos)) {
    return Response.json({ error: "That request was not understood." }, { status: 400 });
  }

  try {
    const result = await applyEventOp(store, body, admin.name);
    return Response.json({ ...result, store: store.kind });
  } catch (error) {
    if (error instanceof EventOpError) {
      return Response.json({ error: error.message, fieldErrors: error.fieldErrors }, { status: error.status });
    }
    console.error(error);
    if (error instanceof StoreError) {
      return Response.json(
        { error: "GitHub refused the save, so nothing was changed. Ask the webmaster to check the admin token." },
        { status: 502 },
      );
    }
    return Response.json({ error: "The save did not go through. Nothing was changed." }, { status: 500 });
  }
}
