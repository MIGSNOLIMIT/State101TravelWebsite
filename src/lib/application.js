// Client-side helpers for ApplicationEntry operations

export async function deleteApplication(id) {
  if (!id) throw new Error("Missing id");
  const res = await fetch(`/api/application/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let msg = "Failed to delete";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
