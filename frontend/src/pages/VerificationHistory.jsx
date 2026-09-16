import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./VerificationHistory.css";

function AssetVerificationHistory() {
  const { id } = useParams();

  const [history, setHistory] = useState([]);
  const [asset, setAsset] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [ainFilter, setAinFilter] = useState("");
  const [outletNameFilter, setOutletNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVerificationHistory = async () => {
      try {
        setLoading(true);
        setError("");

        if (id) {
          const response = await api.get(`/verification-mappings/asset/${id}`);

          const verificationHistory = response.data.history || [];

          setHistory(verificationHistory);

          if (verificationHistory.length > 0) {
            setAsset(verificationHistory[0].asset);
          } else {
            const assetResponse = await api.get(`/assets/${id}`);

            setAsset(assetResponse.data.asset);
          }

          return;
        }

        const response = await api.get("/verification-mappings/history");

        setMappings(response.data.mappings || []);
      } catch (error) {
        console.error(
          "Get Verification History Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message ||
            "Failed to load verification history",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationHistory();
  }, [id]);

  const filteredMappings = mappings.filter((mapping) => {
    const ain = mapping.asset?.ain?.toLowerCase() || "";
    const matchesAin = ain.includes(ainFilter.trim().toLowerCase());
    const outletName = mapping.outlet?.name?.toLowerCase() || "";
    const matchesOutletName = outletName.includes(
      outletNameFilter.trim().toLowerCase(),
    );
    const matchesStatus = !statusFilter || mapping.status === statusFilter;

    return matchesAin && matchesOutletName && matchesStatus;
  });

  const clearFilters = () => {
    setAinFilter("");
    setOutletNameFilter("");
    setStatusFilter("");
  };

  if (loading) {
    return (
      <AppPageLayout>
        <div className="verification-history-page">
          <p>Loading verification history...</p>
        </div>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout>
        <div className="verification-history-page">
          <div className="verification-history-error">{error}</div>

          <Link
            to={id ? `/assets/${id}` : "/verification-mappings"}
            className="verification-history-link"
          >
            {id ? "← Back to Asset Details" : "← Back to Verification Review"}
          </Link>
        </div>
      </AppPageLayout>
    );
  }

  if (!id) {
    return (
      <AppPageLayout>
        <div className="verification-history-page">
          <div className="verification-history-header">
            <Link
              to="/verification-mappings"
              className="verification-history-link"
            >
              ← Back to Review Queue
            </Link>

            <h2>Verification Mapping History</h2>

            <p>
              Completed asset verification decisions from the admin review
              queue.
            </p>
          </div>

          <section className="verification-history-card">
            <div className="verification-history-card-heading">
              <h3>Completed Requests</h3>
              <span>
                {filteredMappings.length} of {mappings.length} Records
              </span>
            </div>

            <div className="verification-history-filters">
              <div className="verification-history-filter-field">
                <label htmlFor="verification-ain-filter">Asset AIN</label>
                <input
                  id="verification-ain-filter"
                  type="search"
                  value={ainFilter}
                  onChange={(event) => setAinFilter(event.target.value)}
                  placeholder="Filter by Asset AIN"
                />
              </div>

              <div className="verification-history-filter-field">
                <label htmlFor="verification-outlet-name-filter">
                  Outlet Name
                </label>
                <input
                  id="verification-outlet-name-filter"
                  type="search"
                  value={outletNameFilter}
                  onChange={(event) => setOutletNameFilter(event.target.value)}
                  placeholder="Filter by outlet name"
                />
              </div>

              <div className="verification-history-filter-field">
                <label htmlFor="verification-status-filter">Status</label>
                <select
                  id="verification-status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <button
                type="button"
                className="verification-history-clear-filters"
                onClick={clearFilters}
                disabled={!ainFilter && !outletNameFilter && !statusFilter}
              >
                Clear Filters
              </button>
            </div>

            {filteredMappings.length === 0 ? (
              <div className="verification-history-empty">
                {mappings.length === 0
                  ? "No completed verification records found."
                  : "No records match the selected filters."}
              </div>
            ) : (
              <div className="verification-history-table-wrapper">
                <table className="verification-history-table">
                  <thead>
                    <tr>
                      <th>Submitted</th>
                      <th>Asset AIN</th>
                      <th>Outlet</th>
                      <th>Submitted By</th>
                      <th>Reviewed By</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMappings.map((mapping) => (
                      <tr key={mapping._id}>
                        <td>
                          {mapping.createdAt
                            ? new Date(mapping.createdAt).toLocaleString()
                            : "N/A"}
                        </td>

                        <td>{mapping.asset?.ain || "N/A"}</td>

                        <td>{mapping.outlet?.name || "N/A"}</td>

                        <td>{mapping.submittedBy?.name || "N/A"}</td>

                        <td>{mapping.reviewedBy?.name || "N/A"}</td>

                        <td>
                          <span
                            className={`verification-result verification-result-${mapping.status?.toLowerCase()}`}
                          >
                            {mapping.status}
                          </span>
                        </td>

                        <td>
                          {mapping.rejectionRemarks || mapping.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
      <div className="verification-history-page">
        <div className="verification-history-header">
          <Link to={`/assets/${id}`} className="verification-history-link">
            ← Back to Asset Details
          </Link>

          <h2>Asset Verification History</h2>

          <p>History of System Admin verification decisions for this asset.</p>
        </div>

        {asset && (
          <section className="verification-history-card">
            <h3>Asset Information</h3>

            <div className="verification-history-grid">
              <div>
                <span>AIN</span>
                <strong>{asset.ain || "N/A"}</strong>
              </div>

              <div>
                <span>Serial Number</span>
                <strong>{asset.serialNumber || "N/A"}</strong>
              </div>

              <div>
                <span>Capacity</span>
                <strong>{asset.capacity || "N/A"}</strong>
              </div>
            </div>
          </section>
        )}

        <section className="verification-history-card">
          <h3>Verification Records</h3>

          {history.length === 0 ? (
            <div className="verification-history-empty">
              No verification records found.
            </div>
          ) : (
            <div className="verification-history-table-wrapper">
              <table className="verification-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Outlet</th>
                    <th>Verified By</th>
                    <th>Result</th>
                    <th>Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((record) => (
                    <tr key={record._id}>
                      <td>
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleString()
                          : "N/A"}
                      </td>

                      <td>
                        {record.outlet?.name || "N/A"}

                        {record.outlet?.code ? ` (${record.outlet.code})` : ""}
                      </td>

                      <td>{record.reviewedBy?.name || "N/A"}</td>

                      <td>
                        <span
                          className={`verification-result verification-result-${record.status?.toLowerCase()}`}
                        >
                          {record.status || "N/A"}
                        </span>
                      </td>

                      <td>{record.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppPageLayout>
  );
}

export default AssetVerificationHistory;
