export interface StreamHandlers {
  onToken?: (token: string) => void
  onPhase?: (msg: string) => void
  onLog?: (msg: string) => void
  onDone?: (msg: string) => void
  onError?: (msg: string) => void
}

export async function readStream(response: Response, handlers: StreamHandlers): Promise<void> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const evt = JSON.parse(line.slice(6))
        switch (evt.type) {
          case 'token': handlers.onToken?.(evt.message); break
          case 'phase': handlers.onPhase?.(evt.message); break
          case 'log':   handlers.onLog?.(evt.message);   break
          case 'done':  handlers.onDone?.(evt.message);  break
          case 'error': handlers.onError?.(evt.message); break
        }
      } catch { /* malformed SSE line — skip */ }
    }
  }
}
