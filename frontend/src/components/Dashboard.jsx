import { useState, useEffect } from "react";
import Pocketbase from "pocketbase";

const pb = new Pocketbase("https://pjs25.onrender.com/");

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const recordsList = await pb.collection("reports").getFullList(200, {
          sort: "-created",
        });
        setReports(recordsList);
      } catch (err) {
        setError("Failed to load reports" + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <div>Loading Reports...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 my-6">
      <h2 className="text-xl font-semibold mb-4">Bug Reports Dashboard</h2>
      {reports.length === 0 && <div>No Reports Found</div>}
      <ul>
        {reports.map((report) => {
          <li key={report.id} className="border rounded p-3 mb-3">
            <div>
              <stong>Category:</stong>
              {report.category}
            </div>
            <div>
              <stong>Severity:</stong>
              {report.severity}
            </div>
            <div>
              <stong>Description:</stong>
              {report.description}
            </div>
            <div>
              <stong>Created:</stong>
              {new Date(report.created).toLocaleString()}
            </div>
            <div>
              <stong>Email:</stong>
              {report.email || "N/A"}
            </div>
            <div>
              <stong>Page URL:</stong>
              {report.pageUrl}
            </div>
          </li>;
        })}
      </ul>
    </div>
  );
}
