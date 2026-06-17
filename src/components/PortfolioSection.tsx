'use client'

import { useState } from 'react'
import { PortfolioItem, Proposal } from '@/data/types'
import { track } from '@/lib/analytics'
import { Section } from './ui'
import { Play, Instagram } from './icons'

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
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={play}
            disabled={!hasVideo}
            className="absolute inset-0 flex items-center justify-center disabled:cursor-default"
            aria-label={hasVideo ? `Assistir: ${item.title}` : item.title}
          >
            {item.youtubeId ? (
              // object-cover recorta a tarja preta da miniatura 4:3, ficando 16:9 limpo
              <img
                src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    'radial-gradient(60% 60% at 50% 40%, rgba(199,162,107,0.12), transparent), repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.03) 22px 24px)',
                }}
                aria-hidden
              />
            )}
            <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" aria-hidden />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold-soft/60 bg-black/35 transition-transform duration-300 group-hover:scale-105">
              <Play width={22} height={22} className="ml-0.5 text-gold-soft" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-10">
        <h3 className="text-lg font-medium text-cream">{item.title}</h3>
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

      <div className="mt-10 flex items-center gap-5">
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram @belluscasamentos"
          className="text-cream/80 transition-colors hover:text-gold-soft"
        >
          <Instagram width={26} height={26} />
        </a>
        <a
          href={YOUTUBE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-cream/80 underline-offset-4 transition-colors hover:text-gold-soft hover:underline"
        >
          Ver mais filmes no YouTube
        </a>
      </div>
    </Section>
  )
}
