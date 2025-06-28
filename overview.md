# 🕹️ Dot War – Realtime 2D Single Player Game (Web)

## 📌 Mục tiêu dự án

Xây dựng một game 2D single player đơn giản, hoạt động trên web. Người chơi điều khiển các "dot" (chấm tròn), bắn nhau với bot để ghi điểm. Dự án nhằm mục tiêu học kiến trúc game loop, quản lý state, xử lý va chạm, hiệu ứng, và tối ưu UI/UX cho game frontend.

---

## ✅ Tính năng chính

- Single player (đối đầu với nhiều bot)
- Di chuyển bằng WASD
- Bắn đạn bằng chuột
- Va chạm đạn ↔ player → chết → respawn
- Cộng điểm khi bắn bot
- Hiển thị leaderboard điểm số
- Tối giản asset (chấm tròn, đạn tròn, background đơn sắc)
- Code tách bạch UI/game logic, dễ mở rộng

---

## 🧱 Tech Stack

### 🖥️ Client (Web Game UI)
- **pnpm** - Quản lý package
- **React** – UI, quản lý trạng thái, component
- **Vite** – Dev server + bundling (siêu nhanh)
- **Phaser 3** – Game engine 2D (canvas, scene, physics)
- **Tailwind CSS** – UI nhanh gọn (cho menu, HUD, leaderboard)

---

## 🧠 Ghi chú kỹ thuật

- Game chạy hoàn toàn trên client, không có backend
- Logic va chạm, điểm số, bot, hiệu ứng đều xử lý local
- Dễ dàng mở rộng thêm chế độ chơi, bot AI, hiệu ứng, v.v.