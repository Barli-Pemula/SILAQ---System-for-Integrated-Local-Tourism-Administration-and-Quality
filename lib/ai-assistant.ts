'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface AiMessage {
  from: 'user' | 'ai'
  text: string
}

export interface AiAnswer {
  text: string
  followUps?: string[]
}

interface UseAiAssistantOptions {
  initialMessages: AiMessage[]
  stages: string[]
  thinkMs?: number
  answer: (input: string) => AiAnswer
}

export function useAiAssistant({
  initialMessages,
  stages,
  thinkMs = 1900,
  answer,
}: UseAiAssistantOptions) {
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages)
  const [stage, setStage] = useState<string | null>(null)
  const [streaming, setStreaming] = useState<string | null>(null)
  const [followUps, setFollowUps] = useState<string[]>([])

  const timers = useRef<number[]>([])
  const pending = useRef<{ full: string; followUps: string[]; shown: number } | null>(null)

  const isThinking = stage !== null
  const isStreaming = streaming !== null
  const isBusy = isThinking || isStreaming

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  // Reveal the prepared answer character by character, then commit it to the log.
  useEffect(() => {
    const p = pending.current
    if (!p) return
    if (p.shown >= p.full.length) {
      const finished = p
      pending.current = null
      setMessages((prev) => [...prev, { from: 'ai', text: finished.full }])
      setFollowUps(finished.followUps)
      setStreaming(null)
      return
    }
    const id = window.setTimeout(() => {
      p.shown = Math.min(p.full.length, p.shown + 3)
      setStreaming(p.full.slice(0, p.shown))
    }, 16)
    return () => window.clearTimeout(id)
  }, [streaming])

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || isBusy) return

      clearTimers()
      pending.current = null
      setStreaming(null)
      setFollowUps([])
      setMessages((prev) => [...prev, { from: 'user', text }])

      const sequence = stages.length > 0 ? stages : ['Menganalisis pertanyaan…']
      const span = thinkMs / sequence.length
      setStage(sequence[0])
      sequence.slice(1).forEach((label, index) => {
        timers.current.push(window.setTimeout(() => setStage(label), span * (index + 1)))
      })
      timers.current.push(
        window.setTimeout(() => {
          const result = answer(text)
          pending.current = {
            full: result.text,
            followUps: result.followUps ?? [],
            shown: 0,
          }
          setStage(null)
          setStreaming('')
        }, thinkMs)
      )
    },
    [answer, clearTimers, isBusy, stages, thinkMs]
  )

  const reset = useCallback(() => {
    clearTimers()
    pending.current = null
    setMessages(initialMessages)
    setStage(null)
    setStreaming(null)
    setFollowUps([])
  }, [clearTimers, initialMessages])

  return {
    messages,
    stage,
    streaming,
    followUps,
    isThinking,
    isStreaming,
    isBusy,
    send,
    reset,
  }
}
