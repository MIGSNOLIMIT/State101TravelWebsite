// Client-side helpers for ApplicationEntry operations

export async function archiveApplication(id) {
  if (!id) throw new Error("Missing id");
  const res = await fetch(`/api/application/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Failed to archive";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function restoreApplication(id) {
  if (!id) throw new Error("Missing id");
  const res = await fetch(`/api/application/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: false }),
  });
  if (!res.ok) {
    let msg = "Failed to restore";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
