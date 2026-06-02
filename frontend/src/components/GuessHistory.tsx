import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function GuessHistory() {
  const { room } = useRoomState();

  return (
    <Card title="Guess History">
      {!room || room.guessHistory.length === 0 ? (
        <p className="guess-history__empty">No guesses yet.</p>
      ) : (
        <ul className="guess-history">
          {room.guessHistory.map((entry) => (
            <li key={entry.id} className={entry.isCorrect ? "guess-history__item guess-history__item--correct" : "guess-history__item"}>
              <span>{entry.participantName}: {entry.text}</span>
              {entry.isCorrect ? <strong>Correct</strong> : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
