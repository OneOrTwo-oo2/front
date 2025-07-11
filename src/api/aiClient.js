import axios from "axios";
import { AI_API } from "./base";

const aiClient = axios.create({
  baseURL: AI_API,
});

export default aiClient;