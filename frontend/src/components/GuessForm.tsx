import { useState } from "react";

interface GuessFormProps {
  disabled?: boolean;
  error?: string | null;
  onSubmitGuess: (guess: string) => Promise<void>;
}

export function GuessForm({ disabled = false, error = null, onSubmitGuess }: GuessFormProps) {
  const [guessText, setGuessText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedGuess = guessText.trim();
    if (!trimmedGuess) {
      setLocalError("Enter a guess before submitting.");
      return;
    }

    setLocalError(null);
    await onSubmitGuess(trimmedGuess);
    setGuessText("");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => setGuessText(event.target.value)}
          placeholder="Type your guess here..."
          disabled={disabled}
        />
      </label>
      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={disabled}>
          Submit Guess
        </button>
      </div>
      {localError || error ? <p className="form__error">{localError ?? error}</p> : null}
    </form>
  );
}
