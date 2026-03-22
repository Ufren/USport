import type { UserInfo } from "@usport/shared";

interface SessionState {
  token: string | null;
  userInfo: UserInfo | null;
}

interface StoreState {
  session: SessionState;
}

interface StoreInstance {
  dispatch: (action: string, payload?: unknown) => void;
  getState: () => StoreState;
  subscribe: (listener: (state: StoreState) => void) => () => void;
}

let state: StoreState = {
  session: {
    token: null,
    userInfo: null,
  },
};

const subscribers = new Set<(nextState: StoreState) => void>();
let storeInstance: StoreInstance | null = null;

function notify(): void {
  subscribers.forEach((listener) => listener(state));
}

function setState(nextState: Partial<StoreState>): void {
  state = {
    ...state,
    ...nextState,
  };
  notify();
}

function dispatch(action: string, payload?: unknown): void {
  switch (action) {
    case "session/hydrate": {
      const session = payload as Partial<SessionState> | undefined;
      setState({
        session: {
          token: session?.token ?? null,
          userInfo: session?.userInfo ?? null,
        },
      });
      break;
    }
    case "session/clear": {
      setState({
        session: {
          token: null,
          userInfo: null,
        },
      });
      break;
    }
    default:
      break;
  }
}

export function initStore(): StoreInstance {
  if (storeInstance) {
    return storeInstance;
  }

  storeInstance = {
    dispatch,
    getState: () => state,
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
  };

  return storeInstance;
}
