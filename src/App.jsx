import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseChart from "./components/ExpenseChart";
import Chat from "./components/Chat";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <div>
          <div className="flex justify-between p-4 bg-blue-600 text-white">
            <h1 className="font-bold">Expense Tracker</h1>
            <button onClick={logout}>Logout</button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="flex-1">
              <ExpenseForm />
              <ExpenseList />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <ExpenseChart />
              <Chat />
            </div>
          </div>
        </div>
      ) : (
        <Auth /> // your login/signup component
      )}
    </div>
  );
}

export default App;
