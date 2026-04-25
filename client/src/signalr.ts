import * as signalR from "@microsoft/signalr";

const hubUrl = import.meta.env.VITE_SIGNALR_URL ?? "https://localhost:7181/gamehub";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl(hubUrl)
  .withAutomaticReconnect()
  .build();