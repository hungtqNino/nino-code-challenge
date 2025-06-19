import { ENDPOINTS } from "@/libs/endpoints";

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTokenImage = (currency: string) => {
  return `${ENDPOINTS.TOKEN_IMAGE}/${currency}.svg`;
};

export const formatNumber = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return "0.0";
  const [whole, decimal] = num.toString().split(".");
  if (!decimal) return whole;
  return `${whole}.${decimal.slice(0, 8)}`;
};
