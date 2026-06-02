import { Card } from "./Card";
import { useGameplayViewModel } from "../state/roomStore";

export function FinalResultPanel() {
  const { finalResult, isResultsStage } = useGameplayViewModel();

  if (!isResultsStage || !finalResult) {
    return null;
  }

  return (
    <Card title="Final Result">
      <div className="placeholder-block">
        <p className="status-line">
          {finalResult.isTie ? "Tie game" : "Winner decided"}
        </p>

        <ul className="final-result-list">
          {finalResult.rankings.map((entry) => {
            const isWinner = finalResult.winnerParticipantIds.includes(entry.participantId);
            return (
              <li key={entry.participantId}>
                <span>
                  #{entry.rank} {entry.participantName}
                </span>
                <span>
                  {entry.score} {isWinner ? "(Winner)" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
