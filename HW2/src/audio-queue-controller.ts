export interface AudioTask {
  id: number;
  trackUrl: string;
  controller: AbortController;
  resolve: (buffer: AudioBuffer) => void;
  reject: (error: Error) => void;
}

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private isProcessing = false;
  private activeTask: AudioTask | null = null;
  private audioContext: AudioContext;
  private nextId = 1;
  private closed = false;

  constructor(audioContext?: AudioContext) {
    this.audioContext = audioContext ?? new AudioContext();
  }

  enqueue(trackUrl: string): Promise<AudioBuffer> {
    if (this.closed) {
      return Promise.reject(new Error("Audio queue is closed."));
    }

    return new Promise<AudioBuffer>((resolve, reject) => {
      const task: AudioTask = {
        id: this.nextId++,
        trackUrl,
        controller: new AbortController(),
        resolve,
        reject,
      };

      this.queue.push(task);
      void this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.closed) return;

    const task = this.queue.shift();
    if (!task) return;

    this.isProcessing = true;
    this.activeTask = task;

    try {
      const response = await fetch(task.trackUrl, {
        signal: task.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Audio download failed: HTTP ${response.status}`);
      }

      const audioData = await response.arrayBuffer();

      if (task.controller.signal.aborted) {
        throw new DOMException("Audio task cancelled", "AbortError");
      }

      const audioBuffer = await this.audioContext.decodeAudioData(audioData);

      if (task.controller.signal.aborted || this.closed) {
        throw new DOMException("Audio task cancelled", "AbortError");
      }

      task.resolve(audioBuffer);
    } catch (error) {
      task.reject(
        error instanceof Error
          ? error
          : new Error("Unknown audio processing error"),
      );
    } finally {
      if (this.activeTask === task) {
        this.activeTask = null;
      }

      this.isProcessing = false;

      if (!this.closed) {
        void this.processNext();
      }
    }
  }

  cancelAll(): void {
    const error = new DOMException("Audio task cancelled", "AbortError");

    this.activeTask?.controller.abort();

    for (const task of this.queue) {
      task.controller.abort();
      task.reject(error);
    }

    this.queue = [];
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  get busy(): boolean {
    return this.isProcessing;
  }

  async close(): Promise<void> {
    if (this.closed) return;

    this.closed = true;
    this.cancelAll();

    if (this.audioContext.state !== "closed") {
      await this.audioContext.close();
    }
  }
}
