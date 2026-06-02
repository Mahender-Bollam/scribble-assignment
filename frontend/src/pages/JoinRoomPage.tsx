import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useRoomStore } from "../state/roomStore";

export function JoinRoomPage() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const roomStore = useRoomStore();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = playerName.trim();
    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedName) {
      setError("Please enter your player name.");
      return;
    }

    if (!normalizedCode) {
      setError("Please enter a room code.");
      return;
    }

    if (!/^[A-Z0-9]{4}$/.test(normalizedCode)) {
      setError("Enter a valid 4-character room code.");
      return;
    }

    try {
      setError(null);
      await roomStore.joinRoom(normalizedCode, normalizedName);
      navigate("/lobby");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to join room");
    }
  }

  return (
    <section className="panel panel--narrow placeholder-page">
      <PageHeader
        kicker="Existing lobby"
        title="Join Room"
        description="Enter your player name and the room code to join an existing lobby."
      />
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          <span>Player name</span>
          <input
            className="form__input"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Second pencil"
          />
        </label>

        <label className="form__field">
          <span>Room code</span>
          <input
            className="form__input form__input--code"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="ABCD"
          />
        </label>
        {error ? <p className="form__error">{error}</p> : null}
        <div className="button-row">
          <button className="button button--primary" type="submit">
            Join Lobby
          </button>
          <button className="button button--secondary" type="button" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </form>
    </section>
  );
}
