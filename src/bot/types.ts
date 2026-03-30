export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface IBot {
  readonly username: string;
  readonly health: number;
  readonly food: number;
  readonly position: Position | null;

  on(event: "spawn" | "health" | "chat" | "error" | "end" | "kicked", listener: (...args: any[]) => void): void;
  once(event: "spawn", listener: (...args: any[]) => void): void;

  chat(message: string): void;
  goTo(x: number, y: number, z: number): Promise<void>;
  attackEntity(entityName: string): Promise<void>;
  findBlocks(maxDistance: number, count: number): any[];
  
  disconnect(): void;
}
