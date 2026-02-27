type Handler = (data: any) => void;

export function createWS(url: string, onMessage: Handler) {
  const ws = new WebSocket(url);

  const queue: string[] = [];
  let isOpen = false;
  let closeRequested = false;

  ws.addEventListener("open", () => {
    isOpen = true;

    // flush queued messages
    while (queue.length) ws.send(queue.shift()!);

    // if StrictMode cleanup requested close before open, close now safely
    if (closeRequested) ws.close();
  });

  ws.addEventListener("message", (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch {}
  });

  function safeSend(obj: any) {
    const msg = JSON.stringify(obj);
    if (isOpen && ws.readyState === WebSocket.OPEN) ws.send(msg);
    else queue.push(msg);
  }

  function close() {
    // If still connecting, mark close and let it close right after open
    if (ws.readyState === WebSocket.CONNECTING) {
      closeRequested = true;
      return;
    }
    if (ws.readyState === WebSocket.OPEN) ws.close();
  }

  return { ws, safeSend, close };
}