export function seed(query: (text: string, params?: unknown[]) => Promise<unknown>, root?: string): Promise<void>;
export function splitSql(text: string): string[];
