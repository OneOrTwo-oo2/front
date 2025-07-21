import axios from "axios";
import { getBaseApi } from "./base";

const apiClient = axios.create({
  baseURL: getBaseApi(),
  withCredentials: true, // 세션 등 필요하면
});

export default apiClient;