# 🕹️ Dot War – Realtime 2D Multiplayer Game (Web)

## 📌 Mục tiêu dự án

Xây dựng một game 2D realtime đơn giản, hoạt động trên web, sử dụng WebSocket để đồng bộ trạng thái giữa nhiều người chơi. Người chơi điều khiển các "dot" (chấm tròn), bắn nhau để ghi điểm. Dự án nhằm mục tiêu học kiến trúc realtime, quản lý socket, sync state, và xử lý backend tối ưu.

---

## ✅ Tính năng chính

- Realtime multiplayer (5–10 người chơi)
- Di chuyển bằng WASD
- Bắn đạn bằng chuột
- Va chạm đạn ↔ player → chết → respawn
- Cộng điểm người bắn
- Hiển thị leaderboard top điểm số
- Tối giản asset (chấm tròn, đạn tròn, background đơn sắc)
- Phân tách rõ client/server

---
## folder 
client/
├── index.html
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   └── Leaderboard.tsx
│   ├── game/
│   │   ├── scenes/
│   │   │   └── MainScene.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── GameCanvas.tsx

---

## 🧱 Tech Stack



### 🖥️ Client (Web Game UI)
- **pnpm** - Thay the npm
- **React** – UI, quản lý trạng thái, component
- **Vite** – Dev server + bundling (siêu nhanh)
- **Phaser 3** – Game engine 2D (canvas, scene, physics)
- **Tailwind CSS** – UI nhanh gọn (cho menu, HUD, leaderboard)
- **WebSocket (browser)** – Giao tiếp realtime với server

### 🔌 Server (Backend)

- **.NET Core (ASP.NET 8)** – Xử lý logic game + socket server
- **WebSocket (System.Net.WebSockets)** – Kết nối realtime
- **REST API** – Leaderboard, login
- **Dapper** – ORM nhẹ cho truy vấn nhanh
- **PostgreSQL** – Lưu dữ liệu điểm, người chơi

### ⚙️ Hạ tầng

- **VPS Ubuntu (1 CPU / 2GB RAM)** – Đủ chạy 5–10 người
- **Nginx (optional)** – Reverse proxy
- **Certbot (optional)** – HTTPS nếu deploy public
- **Docker (optional)** – Container hóa backend nếu muốn scale sau này
---


## 🧠 Ghi chú kỹ thuật

- Game chạy client-authoritative nhưng kiểm tra va chạm từ server
- Tick rate dự kiến: 30 FPS (WebSocket update mỗi 33ms)
- Dữ liệu sync: `{ id, x, y, direction, bullets }`
- Server side giữ state đầy đủ: player, bullet, score