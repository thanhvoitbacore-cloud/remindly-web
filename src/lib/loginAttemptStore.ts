/**
 * Abstracted storage layer for Rate Limiting Admin logic.
 * 
 * Implementing an interface that allows for a seamless swap from an in-memory 
 * `Map` block downwards into a `Redis` client in a production environment.
 */

type AttemptRecord = {
    count: number;
    lockUntil: number | null;
};

// In-memory store fallback. Note: In serverless deployments, this resets on cold starts.
const store = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const loginAttemptStore = {
    async get(ip: string): Promise<AttemptRecord> {
        return store.get(ip) || { count: 0, lockUntil: null };
    },

    async increment(ip: string): Promise<AttemptRecord> {
        let record = await this.get(ip);
        const now = Date.now();

        // If lock has naturally expired, reset count immediately.
        if (record.lockUntil && now > record.lockUntil) {
            record = { count: 0, lockUntil: null };
        }

        // If we are currently locked out, just return the locked state
        if (record.lockUntil && now < record.lockUntil) {
            return record;
        }

        record.count += 1;

        // If breached maximum thresholds, initiate lock
        if (record.count >= MAX_ATTEMPTS) {
            record.lockUntil = now + LOCKOUT_DURATION_MS;
        }

        store.set(ip, record);
        return record;
    },

    async clear(ip: string): Promise<void> {
        store.delete(ip);
    }
};
