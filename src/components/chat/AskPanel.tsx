// ============================================================
// src/components/chat/AskPanel.tsx
// Grounded Follow-up Q&A Assistant (Lazy loaded via next/dynamic)
// Per PRD.md §7 (FR5) and SECURITY.md §4
// ============================================================

import React, { useState } from 'react';
import { Profile, AirSnapshot, ChatTurn } from '@/lib/types';
import { Button } from '../common/Button';

interface AskPanelProps {
  profile: Profile;
  snapshot?: AirSnapshot;
  manualAqi?: number;
}

export function AskPanel({ profile, snapshot, manualAqi }: AskPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userText = question.trim();
    setQuestion('');
    setError(null);
    setIsLoading(true);

    const updatedHistory: ChatTurn[] = [...history, { role: 'user', content: userText }];
    setHistory(updatedHistory);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          profile,
          snapshot,
          manualAqi,
          history: updatedHistory.slice(-6),
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setHistory([...updatedHistory, { role: 'assistant', content: json.data.answer }]);
      } else {
        setError(json.error?.message || 'Unable to process question.');
      }
    } catch {
      setError('Network communication failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-surface border border-rule rounded space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Grounded Follow-up Assistant</h3>
          <p className="text-xs text-ink-muted">
            Ask specific questions about today&apos;s routines, masks, school runs, or ventilation.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs"
        >
          {isOpen ? 'Close Chat ▴' : 'Ask Question ▾'}
        </Button>
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-rule space-y-3">
          {history.length > 0 && (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
              {history.map((turn, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded ${
                    turn.role === 'user'
                      ? 'bg-accent/10 text-ink ml-6 border border-accent/20'
                      : 'bg-bg text-ink-muted mr-6 border border-rule'
                  }`}
                >
                  <strong className="block text-ink text-[11px] mb-0.5">
                    {turn.role === 'user' ? 'You:' : 'Saans Assistant:'}
                  </strong>
                  <div className="leading-relaxed">{turn.content}</div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              maxLength={500}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Can my 6-year-old cycle to school tomorrow morning?"
              className="flex-1 px-3 py-1.5 text-xs bg-bg border border-rule rounded text-ink focus-visible:outline-accent"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="shrink-0 text-xs"
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
