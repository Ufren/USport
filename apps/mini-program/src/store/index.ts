type SetStateFunc<S> = (prevState: S) => Partial<S>;

class Store<S extends Record<string, any>> {
  private state: S;
  private subscribers: Set<(state: S) => void> = new Set();

  constructor(initialState: S) {
    this.state = initialState;
  }

  getState(): S {
    return this.state;
  }

  setState(updater: Partial<S> | SetStateFunc<S>): void {
    const prevState = this.state;
    const nextPartialState =
      typeof updater === "function" ? updater(prevState) : updater;
    this.state = { ...prevState, ...nextPartialState };
    this.notify();
  }

  subscribe(listener: (state: S) => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  private notify(): void {
    this.subscribers.forEach((listener) => listener(this.state));
  }
}

export { Store };

interface StoreInstance {
  dispatch: (action: string, payload?: any) => void;
}

let storeInstance: StoreInstance | null = null;

export function initStore(): StoreInstance {
  if (storeInstance) return storeInstance;

  storeInstance = {
    dispatch(action: string, payload?: any) {
      console.log("dispatch:", action, payload);
    },
  };

  return storeInstance;
}
