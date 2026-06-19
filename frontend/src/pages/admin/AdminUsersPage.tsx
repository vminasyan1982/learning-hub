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
    const reason = prompt("Причина отказа (необязательно):");
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
          Заявки {requests.length > 0 && <span className={adminStyles.badge}>{requests.length}</span>}
        </button>
        <button className={`${adminStyles.tab} ${tab === "invitations" ? adminStyles.tabActive : ""}`} onClick={() => setTab("invitations")}>
          Приглашения
        </button>
        <button className={`${adminStyles.tab} ${tab === "users" ? adminStyles.tabActive : ""}`} onClick={() => setTab("users")}>
          Пользователи
        </button>
      </div>

      {loading && <div className={styles.center}>Загрузка…</div>}

      {!loading && tab === "requests" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>ФИО</th><th>Email</th><th>Должность</th><th>Бизнес-юнит</th><th>Роль</th><th>Дата</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={7} className={styles.center}>Нет ожидающих заявок</td></tr>
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
                      <button className={adminStyles.approveBtn} onClick={() => handleApprove(r.id)}>Одобрить</button>
                      <button className={adminStyles.denyBtn} onClick={() => handleDeny(r.id)}>Отклонить</button>
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
              placeholder="Для кого приглашение (необязательно)"
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
            />
            <button className={adminStyles.approveBtn} onClick={handleCreateInvite}>
              Создать приглашение
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Ссылка</th><th>Примечание</th><th>Статус</th><th>Истекает</th></tr>
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
                        {inv.is_used ? "Использован" : inv.is_valid ? "Активен" : "Истёк"}
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
              <tr><th>Логин</th><th>ФИО</th><th>Email</th><th>Роль</th><th>Отдел</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><Badge variant="info">{u.role}</Badge></td>
                  <td>{u.department || "—"}</td>
                  <td><Badge variant={u.is_active ? "success" : "danger"}>{u.is_active ? "Активен" : "Заблокирован"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
