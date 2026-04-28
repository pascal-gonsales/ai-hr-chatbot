import Link from 'next/link'

export const metadata = {
  title: 'TeamChat AI — Public Demo',
  description: 'Public read-only demo of the TeamChat AI HR chatbot. Fictional employee, fictional restaurant, no production data.',
}

export default function DemoLandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <span aria-hidden>🎭</span>
            <span>Demo mode — read-only fixtures, no production data</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            TeamChat AI — public demo
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            A working public demo of the production HR chatbot used by restaurant employees
            to check tips, review schedules, look up policies, and draft escalation emails to
            management.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            What you&apos;ll see
          </h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex gap-2">
              <span className="text-emerald-400">→</span>
              <span>
                <span className="text-zinc-200 font-medium">Real Claude API tool use.</span>{' '}
                The model calls 4 tools (tips, schedule, KB search, draft email) just like
                production. You see each tool call in the stream.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">→</span>
              <span>
                <span className="text-zinc-200 font-medium">Streaming responses</span> over
                Server-Sent Events.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">→</span>
              <span>
                <span className="text-zinc-200 font-medium">Bilingual employee context</span>{' '}
                (FR/EN). The fixture employee Sarah Chen is set to English; ask in French and
                the agent will respond in French.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">→</span>
              <span>
                <span className="text-zinc-200 font-medium">Read-only safety.</span> Tools
                return fixture data only. The draft-email tool returns a stub explaining what
                production would do — no actual DB write, no email sent.
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            Fixture context
          </h2>
          <div className="text-sm text-zinc-400 space-y-1">
            <p>
              <span className="text-zinc-500">Employee:</span>{' '}
              <span className="text-zinc-200">Sarah Chen</span> (server)
            </p>
            <p>
              <span className="text-zinc-500">Restaurant:</span>{' '}
              <span className="text-zinc-200">Le Bistro Demo</span> (fictional)
            </p>
            <p>
              <span className="text-zinc-500">Recent activity:</span>{' '}
              <span className="text-zinc-200">6 shifts logged, $222.50 tip balance</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
            Try asking
          </h2>
          <ul className="space-y-1 text-sm text-zinc-400 list-disc pl-5">
            <li>What&apos;s my current tip balance?</li>
            <li>Show me my upcoming shifts</li>
            <li>How do I request vacation time?</li>
            <li>Quels sont les horaires de la semaine prochaine?</li>
            <li>I need to report a workplace incident — what do I do?</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/demo/chat"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition"
          >
            Try the chat →
          </Link>
          <a
            href="https://github.com/pascal-gonsales/ai-hr-chatbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-200 font-medium transition"
          >
            View source on GitHub
          </a>
        </div>

        <footer className="pt-4 text-xs text-zinc-500 leading-relaxed">
          Production app: multi-tenant Next.js 16 + Claude API + Supabase with auth, RLS,
          per-conversation ownership checks, append-only decision log, and structured
          Claude ↔ Codex review cycles. Built by{' '}
          <a
            href="https://github.com/pascal-gonsales"
            className="text-zinc-300 hover:text-white underline"
          >
            Pascal Gonsales
          </a>
          .
        </footer>
      </div>
    </div>
  )
}
