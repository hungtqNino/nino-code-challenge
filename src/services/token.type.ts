export interface TokenPrice {
  currency: string;
  price: number;
  date: string;
}

export interface TokenData {
  [key: string]: {
    price: number;
    date: string;
  };
}

export type ClosingDownType = "from" | "to" | null;
