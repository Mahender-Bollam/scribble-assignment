import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type PropsWithChildren
} from "react";
import { api, type FinalResult, type RoomSessionResponse, type RoomSnapshot } from "../services/api";

export interface GameplayViewModel {
  isDrawer: boolean;
  isResultsStage: boolean;
  isHost: boolean;
  drawerName: string;
  scoreByParticipantId: Record<string, number>;
  finalResult: FinalResult | null;
  canRestart: boolean;
}

export interface RoomState {
  room: RoomSnapshot | null;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
}

type Listener = () => void;

class RoomStore {
  private state: RoomState = {
    room: null,
    participantId: null,
    error: null,
    isLoading: false
  };

  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  private setState(nextState: Partial<RoomState>) {
    this.state = {
      ...this.state,
      ...nextState
    };
    this.listeners.forEach((listener) => listener());
  }

  private async withLoading<T>(operation: () => Promise<T>) {
    this.setState({
      isLoading: true,
      error: null
    });

    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected request failure";
      this.setState({ error: message });
      throw error;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  setRoomSession(response: RoomSessionResponse) {
    this.setState({
      participantId: response.participantId,
      room: response.room,
      error: null
    });
  }

  setRoomSnapshot(room: RoomSnapshot) {
    const sanitizedRoom =
      room.viewerRole === "drawer"
        ? room
        : {
            ...room,
            secretWord: undefined
          };

    this.setState({
      room: sanitizedRoom,
      error: null
    });
  }

  async createRoom(playerName: string) {
    const response = await this.withLoading(() => api.createRoom(playerName));
    this.setRoomSession(response);
    return response;
  }

  async joinRoom(code: string, playerName: string) {
    const response = await this.withLoading(() => api.joinRoom(code, playerName));
    this.setRoomSession(response);
    return response;
  }

  async fetchRoom(options?: { silent?: boolean }) {
    if (!this.state.room) {
      return null;
    }

    const silent = options?.silent ?? false;

    if (!silent) {
      this.setState({
        isLoading: true,
        error: null
      });
    }

    try {
      const response = await api.fetchRoom(this.state.room.code, this.state.participantId ?? undefined);
      this.setRoomSnapshot(response.room);
      return response.room;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch room";
      this.setState({ error: message });
      throw error;
    } finally {
      if (!silent) {
        this.setState({ isLoading: false });
      }
    }
  }

  async startGame() {
    const activeRoom = this.state.room;
    const participantId = this.state.participantId;

    if (!activeRoom || !participantId) {
      throw new Error("Room session is missing");
    }

    const roomCode = activeRoom.code;

    const response = await this.withLoading(() => api.startGame(roomCode, participantId));
    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async submitStroke(input: { x: number; y: number; color: string; size: number }) {
    if (!this.state.room || !this.state.participantId) {
      throw new Error("Room session is missing");
    }

    const response = await api.submitStroke(this.state.room.code, {
      participantId: this.state.participantId,
      x: input.x,
      y: input.y,
      color: input.color,
      size: input.size
    });

    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async clearCanvas() {
    const activeRoom = this.state.room;
    const participantId = this.state.participantId;

    if (!activeRoom || !participantId) {
      throw new Error("Room session is missing");
    }

    const response = await this.withLoading(() => api.clearCanvas(activeRoom.code, participantId));
    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async submitGuess(text: string) {
    const activeRoom = this.state.room;
    const participantId = this.state.participantId;

    if (!activeRoom || !participantId) {
      throw new Error("Room session is missing");
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error("Guess is required");
    }

    const response = await this.withLoading(() => api.submitGuess(activeRoom.code, participantId, trimmedText));
    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async restartGame() {
    const activeRoom = this.state.room;
    const participantId = this.state.participantId;

    if (!activeRoom || !participantId) {
      throw new Error("Room session is missing");
    }

    const response = await this.withLoading(() => api.restartGame(activeRoom.code, participantId));
    this.setRoomSnapshot(response.room);
    return response.room;
  }
}

const RoomStoreContext = createContext<RoomStore | null>(null);

export function RoomStoreProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<RoomStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = new RoomStore();
  }

  useEffect(() => undefined, []);

  return createElement(RoomStoreContext.Provider, { value: storeRef.current }, children);
}

export function useRoomStore() {
  const store = useContext(RoomStoreContext);

  if (!store) {
    throw new Error("RoomStoreProvider is missing");
  }

  return store;
}

export function useRoomState() {
  const store = useRoomStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useGameplayViewModel() {
  const { room, participantId } = useRoomState();

  if (!room || !participantId) {
    return {
      isDrawer: false,
      isResultsStage: false,
      isHost: false,
      drawerName: "Unassigned",
      scoreByParticipantId: {},
      finalResult: null,
      canRestart: false
    } satisfies GameplayViewModel;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;

  const drawerName = room.participants.find((participant) => participant.id === room.drawerParticipantId)?.name ?? "Unassigned";

  return {
    isDrawer: room.viewerRole === "drawer",
    isResultsStage: room.status === "results",
    isHost: Boolean(viewer?.isHost),
    drawerName,
    scoreByParticipantId: room.scores,
    finalResult: room.result,
    canRestart: room.canRestart
  } satisfies GameplayViewModel;
}
