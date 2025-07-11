import axios from "axios";
import { BASE_API } from "./base";

const apiClient = axios.create({
  baseURL: BASE_API,
  withCredentials: true, // 세션 등 필요하면
});

export default apiClient;