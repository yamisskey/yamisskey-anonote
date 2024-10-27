export class RateLimiter {
  constructor(private kv: KVNamespace) {}

  async isLimitExceeded(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean> {
    const now = Date.now();

    const windowKey = `${key}:${Math.floor(now / (windowSeconds * 1000))}`;

    const currentCount = await this.incrementCounter(windowKey, windowSeconds);

    return currentCount > limit;
  }

  private async incrementCounter(
    key: string,
    expirationSeconds: number
  ): Promise<number> {
    const currentValue = ((await this.kv.get(key, "json")) as number) || 0;
    const newValue = currentValue + 1;

    await this.kv.put(key, JSON.stringify(newValue), {
      expirationTtl: expirationSeconds,
    });

    return newValue;
  }
}
