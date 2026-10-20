import "./style.css";
import { AudioTaskQueue } from "./audio-queue-controller";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found");
}

app.innerHTML = `
  <main class="dashboard">
    <header class="header">
      <p class="eyebrow">WEB AUDIO API · REAL-TIME ENGINE</p>
      <h1>Audio <span>Visualizer</span></h1>
      <p class="subtitle">
        Concurrent FIFO queue and real-time frequency analysis.
      </p>
    </header>

    <section class="player panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">NOW PLAYING</p>
          <h2>Audio Engine</h2>
        </div>
        <span id="status" class="status">READY</span>
      </div>

      <canvas id="visualizer" aria-label="Real-time audio frequency visualizer"></canvas>

      <div class="controls">
        <input
          id="track-url"
          type="url"
          placeholder="Paste a direct audio URL..."
          aria-label="Audio track URL"
        />
        <button id="add-track">Add to Queue</button>
      </div>

      <div class="metrics">
        <div>
          <span class="metric-label">QUEUE LENGTH</span>
          <strong id="queue-count">0</strong>
        </div>
        <div>
          <span class="metric-label">FFT SIZE</span>
          <strong>512</strong>
        </div>
        <div>
          <span class="metric-label">RENDER TARGET</span>
          <strong>60 FPS</strong>
        </div>
      </div>

      <p id="message" role="status" aria-live="polite">
        Add a direct audio URL to begin.
      </p>
    </section>

    <section class="panel queue-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">FIRST IN, FIRST OUT</p>
          <h2>Processing Queue</h2>
        </div>
        <button id="cancel-queue" class="secondary">Cancel All</button>
      </div>
      <ol id="queue-list" aria-label="Audio processing queue">
        <li class="empty">No tracks queued yet.</li>
      </ol>
    </section>

    <footer>CONCURRENT AUDIO ENGINE · TYPESCRIPT</footer>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#visualizer")!;
const canvasContext = canvas.getContext("2d")!;
const queueCount = document.querySelector<HTMLElement>("#queue-count")!;
const queueList = document.querySelector<HTMLOListElement>("#queue-list")!;
const status = document.querySelector<HTMLElement>("#status")!;
const message = document.querySelector<HTMLElement>("#message")!;
const urlInput = document.querySelector<HTMLInputElement>("#track-url")!;
const addButton = document.querySelector<HTMLButtonElement>("#add-track")!;
const cancelButton =
  document.querySelector<HTMLButtonElement>("#cancel-queue")!;

// Share one AudioContext between downloading/decoding and playback.
const audioContext = new AudioContext();
const audioQueue = new AudioTaskQueue(audioContext);
const analyser = audioContext.createAnalyser();

analyser.fftSize = 512;
analyser.connect(audioContext.destination);

const frequencyData = new Uint8Array(analyser.frequencyBinCount);

interface Track {
  id: number;
  label: string;
  bufferPromise: Promise<AudioBuffer>;
}

const tracks: Track[] = [];
let currentSource: AudioBufferSourceNode | null = null;
let finishCurrentPlayback: (() => void) | null = null;
let nextTrackId = 1;
let playbackRunning = false;
let generation = 0;
let animationId = 0;

function resizeCanvas(): void {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();

  canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
  canvas.height = Math.max(1, Math.floor(bounds.height * ratio));

  canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawVisualizer(): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  analyser.getByteFrequencyData(frequencyData);
  canvasContext.clearRect(0, 0, width, height);

  const barCount = 64;
  const gap = 3;
  const barWidth = Math.max(1, (width - gap * barCount) / barCount);

  for (let i = 0; i < barCount; i++) {
    const value = frequencyData[i] / 255;
    const barHeight = Math.max(3, value * height * 0.9);
    const x = i * (barWidth + gap);
    const y = height - barHeight;

    const gradient = canvasContext.createLinearGradient(0, y, 0, height);
    gradient.addColorStop(0, "#a78bfa");
    gradient.addColorStop(1, "#22d3ee");

    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(x, y, barWidth, barHeight);
  }

  animationId = requestAnimationFrame(drawVisualizer);
}

function updateQueueUI(): void {
  queueCount.textContent = String(tracks.length);
  queueList.replaceChildren();

  if (tracks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tracks queued yet.";
    queueList.append(empty);
    return;
  }

  for (const track of tracks) {
    const item = document.createElement("li");
    item.textContent = track.label;
    queueList.append(item);
  }
}

function removeTrack(trackId: number): void {
  const index = tracks.findIndex((track) => track.id === trackId);

  if (index !== -1) {
    tracks.splice(index, 1);
    updateQueueUI();
  }
}

function playBuffer(
  buffer: AudioBuffer,
  label: string,
  taskGeneration: number,
): Promise<void> {
  if (taskGeneration !== generation) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    currentSource = source;

    status.textContent = "PLAYING";
    message.textContent = `Now playing ${label}.`;

    const finish = () => {
      source.disconnect();

      if (currentSource === source) {
        currentSource = null;
      }

      if (finishCurrentPlayback === finish) {
        finishCurrentPlayback = null;
      }

      resolve();
    };

    finishCurrentPlayback = finish;
    source.onended = finish;

    source.start();
  });
}

async function processPlaybackQueue(): Promise<void> {
  if (playbackRunning) return;

  playbackRunning = true;
  const taskGeneration = generation;

  try {
    while (tracks.length > 0 && taskGeneration === generation) {
      const track = tracks[0];

      try {
        status.textContent = "LOADING";
        message.textContent = `Loading ${track.label}...`;

        const buffer = await track.bufferPromise;

        if (taskGeneration !== generation) break;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (taskGeneration !== generation) break;

        await playBuffer(buffer, track.label, taskGeneration);

        if (taskGeneration !== generation) break;

        removeTrack(track.id);
        status.textContent = "READY";
        message.textContent = `${track.label} finished playing.`;
      } catch (error) {
        removeTrack(track.id);

        if (taskGeneration !== generation) break;

        status.textContent = "ERROR";
        message.textContent =
          error instanceof Error ? error.message : "Unable to load audio.";
      }
    }
  } finally {
    playbackRunning = false;

    if (taskGeneration === generation && tracks.length === 0) {
      status.textContent = "READY";
    }
  }
}

function addTrack(): void {
  const trackUrl = urlInput.value.trim();

  if (!trackUrl) {
    message.textContent = "Please enter an audio URL.";
    return;
  }

  try {
    const parsedUrl = new URL(trackUrl);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }
  } catch {
    message.textContent = "Please enter a valid HTTP or HTTPS URL.";
    return;
  }

  const id = nextTrackId++;
  const label = `Track ${id}`;

  // Enqueue immediately so requests are processed in FIFO order.
  const bufferPromise = audioQueue.enqueue(trackUrl);

  // Avoid unhandled rejections if cancellation happens before playback awaits it.
  void bufferPromise.catch(() => undefined);

  tracks.push({ id, label, bufferPromise });
  updateQueueUI();

  urlInput.value = "";
  message.textContent = `${label} added to the FIFO queue.`;

  void processPlaybackQueue();
}

addButton.addEventListener("click", addTrack);

urlInput.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    addTrack();
  }
});

cancelButton.addEventListener("click", () => {
  // Invalidate any playback loop that is waiting for a download or audio to end.
  generation++;

  audioQueue.cancelAll();

  if (currentSource) {
    const source = currentSource;
    currentSource = null;
    source.onended = null;

    try {
      source.stop();
    } catch {
      // The source may already have stopped.
    }

    source.disconnect();
  }
  finishCurrentPlayback?.();
  tracks.length = 0;
  updateQueueUI();

  status.textContent = "CANCELLED";
  message.textContent = "Queue cancelled.";
});

window.addEventListener("resize", resizeCanvas);

window.addEventListener("pagehide", () => {
  cancelAnimationFrame(animationId);
  audioQueue.cancelAll();

  if (currentSource) {
    currentSource.onended = null;

    try {
      currentSource.stop();
    } catch {
      // The source may already have stopped.
    }

    currentSource.disconnect();
    currentSource = null;
    finishCurrentPlayback?.();
  }

  void audioQueue.close();
});

resizeCanvas();
drawVisualizer();
