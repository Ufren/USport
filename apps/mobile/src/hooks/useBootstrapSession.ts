import { useEffect, useState } from "react";

import { useUserStore } from "../store/userStore";
import { getToken, getUserInfo } from "../utils/storage";

export function useBootstrapSession(): boolean {
  const hydrateSession = useUserStore((state) => state.hydrateSession);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      // 启动时先恢复本地会话，避免页面闪成未登录再切回已登录。
      const [token, userInfo] = await Promise.all([getToken(), getUserInfo()]);

      if (!isActive) {
        return;
      }

      hydrateSession({ token, userInfo });
      setBootstrapped(true);
    })();

    return () => {
      isActive = false;
    };
  }, [hydrateSession]);

  return bootstrapped;
}
