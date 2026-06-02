import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function Scoreboard() {
  const { room } = useRoomState();
  const winnerIds = new Set(room?.result?.winnerParticipantIds ?? []);

  return (
    <Card title="Scoreboard">
      {!room ? null : (
        <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
          {room.participants.map((participant) => (
            <div className="placeholder-row" key={participant.id}>
              <span>
                {participant.name}
                {winnerIds.has(participant.id) ? " (Winner)" : ""}
              </span>
              <strong>{room.scores[participant.id] ?? 0}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
