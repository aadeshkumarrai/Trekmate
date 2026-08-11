import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const adminNavigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: "⌂",
    end: true,
  },
  {
    label: "Treks",
    path: "/admin/treks",
    icon: "△",
  },
  {
    label: "Bookings",
    path: "/admin/bookings",
    icon: "▣",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: "♙",
  },
  {
    label: "Staff",
    path: "/admin/team",
    icon: "♟",
  },
  {
    label: "Staff Requests",
    path: "/admin/staff",
    icon: "♙",
  },
  {
    label: "AI Assistant",
    path: "/chat",
    icon: "✦",
  },
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getApprovalStatus = (account) => {
  const approvalStatus =
    account.approvalStatus ||
    (account.isApproved ? "approved" : "pending");

  const statusClasses = {
    approved: "approved",
    pending: "pending",
    rejected: "rejected",
    not_required: "open",
  };

  return {
    label: approvalStatus.replaceAll("_", " ").toUpperCase(),
    className: statusClasses[approvalStatus] || "open",
  };
};

const getAccountStatus = (account) => {
  if (account.isBlacklisted) {
    return {
      label: "Blacklisted",
      className: "rejected",
    };
  }

  if (
    account.role === "staff" &&
    account.approvalStatus === "pending"
  ) {
    return {
      label: "Pending",
      className: "pending",
    };
  }

  if (
    account.role === "staff" &&
    account.approvalStatus === "rejected"
  ) {
    return {
      label: "Rejected",
      className: "rejected",
    };
  }

  return {
    label: "Active",
    className: "approved",
  };
};

function AdminAccounts({ accountRole = "user" }) {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isStaffPage = accountRole === "staff";
  const pageTitle = isStaffPage
    ? "Manage Staff"
    : "Manage Users";

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(
        `/admin/accounts?role=${accountRole}`
      );

      setAccounts(data.accounts || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load accounts"
      );
    } finally {
      setLoading(false);
    }
  }, [accountRole]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return accounts;

    return accounts.filter((account) => {
      const searchableText =
        `${account.name || ""} ${account.email || ""}`.toLowerCase();

      return searchableText.includes(query);
    });
  }, [accounts, search]);

  const updateBlacklist = async (account) => {
    const nextStatus = !account.isBlacklisted;

    const confirmed = window.confirm(
      nextStatus
        ? `Blacklist ${account.name}? They will be logged out and blocked from signing in.`
        : `Remove ${account.name} from blacklist?`
    );

    if (!confirmed) return;

    setActionId(account._id);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.patch(
        `/admin/accounts/${account._id}/blacklist`,
        {
          isBlacklisted: nextStatus,
        }
      );

      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount._id === account._id
            ? data.account
            : currentAccount
        )
      );

      setSuccess(
        data.message ||
          (nextStatus
            ? "Account blacklisted successfully"
            : "Account removed from blacklist")
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update account"
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <DashboardLayout
      eyebrow="ADMIN PANEL"
      title={pageTitle}
      navigation={adminNavigation}
    >
      {success && (
        <p className="dashboard-success">{success}</p>
      )}

      {error && (
        <p className="dashboard-error">{error}</p>
      )}

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              ACCOUNT MANAGEMENT
            </p>

            <h2>
              {isStaffPage
                ? "All staff accounts"
                : "All user accounts"}
            </h2>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={fetchAccounts}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="dashboard-filters">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={`Search ${
              isStaffPage ? "staff" : "users"
            } by name or email`}
          />
        </div>

        {loading ? (
          <p className="empty-state">
            Loading accounts...
          </p>
        ) : filteredAccounts.length === 0 ? (
          <p className="empty-state">
            No{" "}
            {isStaffPage
              ? "staff accounts"
              : "user accounts"}{" "}
            found.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>

                  {isStaffPage && <th>Approval</th>}

                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((account) => {
                  const accountStatus =
                    getAccountStatus(account);

                  const approvalStatus =
                    getApprovalStatus(account);

                  return (
                    <tr key={account._id}>
                      <td>{account.name}</td>

                      <td>{account.email}</td>

                      <td>
                        {formatDate(account.createdAt)}
                      </td>

                      {isStaffPage && (
                        <td>
                          <span
                            className={`status-badge ${approvalStatus.className}`}
                          >
                            {approvalStatus.label}
                          </span>
                        </td>
                      )}

                      <td>
                        <span
                          className={`status-badge ${accountStatus.className}`}
                        >
                          {accountStatus.label}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`secondary-button small ${
                            account.isBlacklisted
                              ? ""
                              : "danger-button"
                          }`}
                          type="button"
                          onClick={() =>
                            updateBlacklist(account)
                          }
                          disabled={
                            actionId === account._id
                          }
                        >
                          {actionId === account._id
                            ? "Updating..."
                            : account.isBlacklisted
                              ? "Unblacklist"
                              : "Blacklist"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default AdminAccounts;