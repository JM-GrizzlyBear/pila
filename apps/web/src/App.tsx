import { Navigate, Route, Routes } from "react-router";
import { AppHeader } from "./presentation/components/layout/AppHeader";
import { GuestOnly } from "./presentation/components/routing/GuestOnly";
import { RequireAdmin } from "./presentation/components/routing/RequireAdmin";
import { RequireAuth } from "./presentation/components/routing/RequireAuth";
import { HomePage } from "./presentation/pages/HomePage";
import { LoginPage } from "./presentation/pages/LoginPage";
import { AccountsPage } from "./presentation/pages/admin/AccountsPage";
import { EditAccountPage } from "./presentation/pages/admin/EditAccountPage";
import { NewAccountPage } from "./presentation/pages/admin/NewAccountPage";

export function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin/accounts" element={<AccountsPage />} />
            <Route path="/admin/accounts/new" element={<NewAccountPage />} />
            <Route path="/admin/accounts/:id" element={<EditAccountPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
