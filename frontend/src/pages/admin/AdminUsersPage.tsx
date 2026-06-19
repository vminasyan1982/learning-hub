import { useEffect, useState } from "react";
import {
  getUsers, getRegistrationRequests, approveRegistration, denyRegistration,
  getInvitations, createInvitation,
} from "@/api";
import type { User, RegistrationRequest, InvitationToken } from "@/types";
import Badge from "@/components/ui/Badge";
import styles from "../trainings/TrainingsPage.module.css";
import adminStyles from "./AdminUsersPage.module.css";
import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";

type Tab = "users" | "requests" | "invitations";

export default function AdminUsersPage() {
  const { user } = useAuthStore();

  // All hooks must be declared before any conditional return
  const [tab, setTab] = useState<Tab>("requests");
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [invitations, setInvitations] = useState<InvitationToken[]>([]);
  const [inviteNote, setInviteNote] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      getUsers(),
      getRegistrationRequests("pending"),
      getInvitations(),
    ]).then(([u, r, i]) => {
      setUsers(u.data.results);
      setRequests(r.data.results);
      setInvitations(i.data.results);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  // Guard after all hooks
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  const handleApprove = async (id: number) => {
    await approveRegistration(id, "viewer");
    loadAll();
  };

  const handleDeny = async (id: number) => {
    const reason = prompt("Reason for denial (optional):");
    await denyRegistration(id, reason || undefined);
    loadAll();
  };

  const handleCreateInvite = async () => {
    await createInvitation({ note: inviteNote });
    setInviteNote("");
    loadAll();
  };

  return (
    <div className={styles.page}>
      <div className={adminStyles.tabs}>
        <button className={`${adminStyles.tab} ${tab === "requests" ? adminStyles.tabActive : ""}`} onClick={() => setTab("requests")}>
          Requests {requests.length > 0 && <span className={adminStyles.badge}>{requests.length}</span>}
        </button>
        <button className={`${adminStyles.tab} ${tab === "invitations" ? adminStyles.tabActive : ""}`} onClick={() => setTab("invitations")}>
          Invitations
        </button>
        <button className={`${adminStyles.tab} ${tab === "users" ? adminStyles.tabActive : ""}`} onClick={() => setTab("users")}>
          Users
        </button>
      </div>

      {loading && <div className={styles.center}>Loading…</div>}

      {!loading && tab === "requests" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Position</th><th>Business Unit</th><th>Role</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={7} className={styles.center}>No pending requests</td></tr>
              ) : requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.first_name} {r.last_name}</td>
                  <td>{r.email}</td>
                  <td>{r.position}</td>
                  <td>{r.business_unit}</td>
                  <td><Badge variant="info">{r.requested_role}</Badge></td>
                  <td>{r.created_at.slice(0, 10)}</td>
                  <td>
                    <div className={adminStyles.actions}>
                      <button className={adminStyles.approveBtn} onClick={() => handleApprove(r.id)}>Approve</button>
                      <button className={adminStyles.denyBtn} onClick={() => handleDeny(r.id)}>Deny</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === "invitations" && (
        <>
          <div className={adminStyles.inviteCreate}>
            <input
              className={styles.search}
              placeholder="Note (optional)"
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
            />
            <button className={adminStyles.approveBtn} onClick={handleCreateInvite}>
              Create invitation
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Link</th><th>Note</th><th>Status</th><th>Expires</th></tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <a href={inv.invite_url} target="_blank" rel="noreferrer" style={{ color: "var(--color-info)", fontSize: 12 }}>
                        {inv.invite_url}
                      </a>
                    </td>
                    <td>{inv.note || "—"}</td>
                    <td>
                      <Badge variant={inv.is_used ? "neutral" : inv.is_valid ? "success" : "danger"}>
                        {inv.is_used ? "Used" : inv.is_valid ? "Active" : "Expired"}
                      </Badge>
                    </td>
                    <td>{inv.expires_at.slice(0, 16).replace("T", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && tab === "users" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><Badge variant="info">{u.role}</Badge></td>
                  <td>{u.department || "—"}</td>
                  <td><Badge variant={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Blocked"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
