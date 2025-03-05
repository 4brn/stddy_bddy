import { AuthProvider } from "@/context/AuthContext";
import { NotyfProvider } from "@/context/NotyfContext";
import Notyf from "@/components/Notyf";
import Router from "@/Router";

function App() {
  return (
    <AuthProvider>
      <NotyfProvider>
        <Router />
        <Notyf />
      </NotyfProvider>
    </AuthProvider>
  );
}

export default App;
