
import BugReportWidget from './components/BugReportWidget';

function App() {
  return (
    <>
      <h1 className="text-red-700 text-center">hi</h1>
      <BugReportWidget config={{ endpoint: 'http://127.0.0.1:8090/api/collections/reports/records' }} />
    </>
  );
}

export default App;
