import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { FinalResultPanel } from "../components/FinalResultPanel";
import { GuessForm } from "../components/GuessForm";
import { GuessHistory } from "../components/GuessHistory";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import {
  useGameplayViewModel,
  useRoomState,
  useRoomStore,
} from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, error, isLoading } = useRoomState();
  const { isDrawer, isHost, isResultsStage, drawerName, canRestart } =
    useGameplayViewModel();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (room?.status === "lobby") {
      navigate("/lobby", { replace: true });
    }
  }, [navigate, room?.status]);

  useEffect(() => {
    if (!room || room.status === "lobby") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void roomStore.fetchRoom({ silent: true }).catch((caughtError) => {
        setLocalError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to refresh game state",
        );
      });
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [room?.code, room?.status, roomStore]);

  if (!room) {
    return null;
  }

  const viewer =
    room.participants.find((participant) => participant.id === participantId) ??
    null;
  const isGuesser = room.viewerRole === "guesser";
  const roleLabel = isDrawer ? "Drawer" : isGuesser ? "Guesser" : "Spectator";
  const canDraw = isDrawer && room.status === "playing";
  const canGuess = !isDrawer && room.status === "playing";

  async function handleSubmitStroke(stroke: {
    x: number;
    y: number;
    color: string;
    size: number;
  }) {
    try {
      setLocalError(null);
      await roomStore.submitStroke(stroke);
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error ? caughtError.message : "Unable to draw",
      );
    }
  }

  async function handleClearCanvas() {
    try {
      setLocalError(null);
      await roomStore.clearCanvas();
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to clear canvas",
      );
    }
  }

  async function handleSubmitGuess(guess: string) {
    try {
      setLocalError(null);
      await roomStore.submitGuess(guess);
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to submit guess",
      );
    }
  }

  async function handleRestartGame() {
    try {
      setLocalError(null);
      await roomStore.restartGame();
    } catch (caughtError) {
      setLocalError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to restart game",
      );
    }
  }

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">Guess the Word!</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <FinalResultPanel />
          <ResultPanel />
          <GuessHistory />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <DrawingCanvas
              strokes={room.canvas.strokes}
              disabled={!canDraw || isLoading}
              onStroke={handleSubmitStroke}
            />
            <div className="button-row button-row--compact">
              <button
                className="button button--secondary"
                onClick={handleClearCanvas}
                disabled={!canDraw || isLoading}
              >
                Clear Canvas
              </button>
            </div>
            <p>
              {isResultsStage
                ? "Round completed. Review the final result and restart when ready."
                : room.status !== "playing"
                  ? "Waiting for the host to start the next round."
                  : isDrawer
                  ? "You are drawing this round."
                  : `${drawerName} is drawing this round.`}
            </p>
            {error || localError ? (
              <p className="form__error">{error ?? localError}</p>
            ) : null}
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{roleLabel}</dd>
              </div>
              <div>
                <dt>Drawer</dt>
                <dd>
                  {room.participants.find(
                    (participant) =>
                    {room.status === "playing"
                      ? room.participants.find((participant) => participant.id === room.drawerParticipantId)?.name ?? "Unassigned"
                      : "Awaiting next round"}
                  )?.name ?? "Unassigned"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Secret Word">
            <p>
              {room.status === "results"
                ? "Round finished"
                : isDrawer
                  ? (room.secretWord ?? "Waiting for word...")
                  : "Hidden for guessers"}
            </p>
          </Card>

          <Card title="Your Guess">
            <GuessForm
              disabled={!canGuess || isLoading}
              onSubmitGuess={handleSubmitGuess}
              error={error ?? localError}
            />
          </Card>

          {isResultsStage ? (
            <Card title="Restart">
              <button
                className="button button--primary"
                onClick={handleRestartGame}
                disabled={!isHost || !canRestart || isLoading}
              >
                {isHost ? "Restart Game" : "Host Only"}
              </button>
              <p>
                {isHost
                  ? "Start a fresh game with the same room members."
                  : "Only the host can restart this room."}
              </p>
            </Card>
          ) : null}
        </aside>
      </div>

      <div className="button-row">
        <button
          className="button button--secondary"
          onClick={() => navigate("/lobby")}
        >
          Exit Game
        </button>
      </div>
    </section>
  );
}
