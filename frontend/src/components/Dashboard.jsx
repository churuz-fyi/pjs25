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
          requestKey: null,
        });
        console.log("Fetched reports:", recordsList);

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
      <h2 className="text-xl text-center font-semibold">PaJamaS Dashboard</h2>
      <h3 className="text-xl text-center font-semibold mb-4">Bug Reports </h3>
      {reports.length === 0 && <div>No Reports Found</div>}
      <ul>
        {reports.map((report) => (
          <li key={report.id} className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded uppercase">{report.category}</span>
              <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${report.severity === "high" ? "bg-red-600" : report.severity === "medium" ? "bg-yellow-500" : "bg-green-600"}`}>{report.severity}</span>
            </div>
            <p className="text-gray-800 mb-2 whitespace-pre-wrap">{report.description}</p>
            <div className="text-xs text-gray-500">
              <div>
                <strong>Submitted:</strong> {new Date(report.created).toLocaleString()}
              </div>
              <div>
                <strong>Page URL:</strong>{" "}
                <a href={report.pageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {report.pageUrl}
                </a>
              </div>
              <div>
                <strong>Email:</strong> {report.email || "N/A"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
