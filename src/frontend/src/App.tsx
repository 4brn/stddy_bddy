import { AuthProvider } from "./context/AuthContext";
import { NotyfProvider } from "./context/NotyfContext";
import Notyf from "./ui/components/Notyf";
import Router from "./Router";

export default function App() {
  return (
    <AuthProvider>
      <NotyfProvider>
        <Router />

        <div id="notyf" className="z-50">
          <Notyf />
        </div>
      </NotyfProvider>
    </AuthProvider>
  );
}
