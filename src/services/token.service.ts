import axios from "axios";
import { ENDPOINTS } from "@/libs/endpoints";
import { TokenPrice } from "@/services/token.type";

export const getPrices = () => {
  return axios
    .get<TokenPrice[]>(ENDPOINTS.TOKEN_PRICES)
    .then((res) => res.data);
};
