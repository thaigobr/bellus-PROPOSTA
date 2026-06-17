'use client'

import { useState } from 'react'
import { PortfolioItem, Proposal } from '@/data/types'
import { track } from '@/lib/analytics'
import { Section, PendingMark } from './ui'
import { Play } from './icons'

const INSTAGRAM = 'https://www.instagram.com/belluscasamentos/'
const YOUTUBE = 'https://www.youtube.com/@belluseventos'

function PortfolioTile({
  item,
  proposalId,
  index,
}: {
  item: PortfolioItem
  proposalId: string
  index: number
}) {
  const [playing, setPlaying] = useState(false)
  const hasVideo = Boolean(item.youtubeId)

  function play() {
    if (!hasVideo) return
    setPlaying(true)
    track('portfolio_play', { proposal_id: proposalId, x_clip: item.youtubeId ?? `slot_${index}` })
  }

  return (
    <figure className="group relative overflow-hidden rounded-xl2 border border-line-dark bg-charcoal-soft">
      <div className="relative aspect-video">
        {playing && item.youtubeId ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={play}
            disabled={!hasVideo}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cream/80 disabled:cursor-default"
            aria-label={hasVideo ? `Assistir: ${item.title}` : item.title}
          >
            {/* moldura de filme sutil quando não há mídia ainda */}
            <span
              className="absolute inset-0 opacity-30 transition-opacity group-hover:opacity-50"
              style={{
                background:
                  'radial-gradient(60% 60% at 50% 40%, rgba(199,162,107,0.12), transparent), repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.03) 22px 24px)',
              }}
              aria-hidden
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft/50 bg-black/20 transition-transform duration-300 group-hover:scale-105">
              <Play width={22} height={22} className="ml-0.5 text-gold-soft" />
            </span>
            {!hasVideo && (
              <span className="relative mt-1">
                <PendingMark note="vídeo real da Bellus" light />
              </span>
            )}
          </button>
        )}
      </div>
      <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-10">
        <h3 className="font-serif text-lg text-cream">{item.title}</h3>
        {item.proves && <p className="mt-1 text-sm text-cream/65">{item.proves}</p>}
      </figcaption>
    </figure>
  )
}

export function PortfolioSection({ proposal }: { proposal: Proposal }) {
  return (
    <Section
      id="portfolio"
      dark
      eyebrow="Para você sentir"
      title="O que um filme da Bellus revela"
      intro="Naturalidade, emoção e os detalhes que passam despercebidos no dia."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {proposal.brand.portfolio.map((item, i) => (
          <PortfolioTile key={item.title} item={item} proposalId={proposal.proposalId} index={i} />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-cream/80 underline-offset-4 hover:text-gold-soft hover:underline"
        >
          Ver mais no Instagram @belluscasamentos
        </a>
        <a
          href={YOUTUBE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-cream/80 underline-offset-4 hover:text-gold-soft hover:underline"
        >
          Filmes no YouTube
        </a>
      </div>
    </Section>
  )
}
