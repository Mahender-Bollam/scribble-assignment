import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function ResultPanel() {
  const { room } = useRoomState();

  const latestGuess = room?.guessHistory.at(-1) ?? null;
  const finalResult = room?.result ?? null;

  return (
    <Card title="Activity">
      <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {room?.status === "results"
            ? finalResult?.isTie
              ? "Final result is a tie. Host can restart when ready."
              : "Final result is locked. Host can restart when ready."
            : latestGuess
              ? `${latestGuess.participantName} guessed "${latestGuess.text}"`
              : "Game activity and guesses will appear here."}
        </p>
        {room?.status === "results" ? (
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            {room.canRestart ? "Restart is available." : "Restart is currently unavailable."}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
