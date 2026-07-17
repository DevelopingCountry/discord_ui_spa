import { useAuth } from "@/components/auth/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const publicPaths = ["/", "/auth/kakao", "/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // localStorage 불러올 시간 주기
    const timeout = setTimeout(() => {
      setChecked(true);
    }, 50); // 너무 길게 줄 필요 없음

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (checked && !isAuthenticated && !publicPaths.includes(path)) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, path, navigate, checked]);

  return <>{children}</>;
}
