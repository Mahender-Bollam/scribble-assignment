import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, error, isLoading } = useRoomState();
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (room?.status === "playing") {
      navigate("/game", { replace: true });
    }
  }, [navigate, room?.status]);

  async function handleRefresh() {
    try {
      setRefreshError(null);
      await roomStore.fetchRoom({ silent: false });
    } catch (caughtError) {
      setRefreshError(caughtError instanceof Error ? caughtError.message : "Unable to refresh room");
    }
  }

  useEffect(() => {
    if (!room) {
      return;
    }

    let isActive = true;

    const poll = async () => {
      try {
        await roomStore.fetchRoom({ silent: true });
      } catch (caughtError) {
        if (isActive) {
          const message = caughtError instanceof Error ? caughtError.message : "Unable to refresh room";
          setRefreshError(message);
        }
      }
    };

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [room?.code, roomStore]);

  async function handleStartGame() {
    try {
      setRefreshError(null);
      const nextRoom = await roomStore.startGame();

      if (nextRoom.status === "playing") {
        navigate("/game");
      }
    } catch (caughtError) {
      setRefreshError(caughtError instanceof Error ? caughtError.message : "Unable to start game");
    }
  }

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId);
  const isHost = Boolean(viewer?.isHost);
  const canStart = isHost && room.participants.length >= 2;

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {participant.isHost ? " (Host)" : ""}
                  </span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{ backgroundColor: isLoading ? '#fef3c7' : '#e0e7ff', color: isLoading ? '#b45309' : '#3730a3' }}>
            {isLoading ? "Refreshing players..." : "Ready to play"}
          </p>
          {room.drawerParticipantId ? (
            <p style={{ marginTop: '8px' }}>
              Drawer assigned: {room.participants.find((participant) => participant.id === room.drawerParticipantId)?.name ?? "Unknown"}
            </p>
          ) : null}
          <p style={{ marginTop: '8px' }}>{error ?? refreshError ?? "Waiting for the host to start the game."}</p>
        </Card>
      </div>

      <div className="button-row button-row--spread">
        <button className="button button--secondary" disabled={isLoading} onClick={handleRefresh}>
          {isLoading ? "Refreshing..." : "Refresh Room"}
        </button>
        <button className="button button--primary" onClick={handleStartGame} disabled={!canStart || isLoading}>
          {isHost ? "Start Game" : "Host Only"}
        </button>
      </div>
    </section>
  );
}
