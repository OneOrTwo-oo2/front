import axios from "axios";
import { getAiApi } from "./base";

const aiClient = axios.create({
  baseURL: getAiApi(),
});

export default aiClient;