import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function ResultPanel() {
  const { room } = useRoomState();

  const latestGuess = room?.guessHistory.at(-1) ?? null;

  return (
    <Card title="Activity">
      <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {latestGuess
            ? `${latestGuess.participantName} guessed "${latestGuess.text}"`
            : "Game activity and guesses will appear here."}
        </p>
      </div>
    </Card>
  );
}
