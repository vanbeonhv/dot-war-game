# 📊 Progress - Dot War Game

## 🎯 Tổng quan
- **Dự án:** Dot War - Realtime 2D Multiplayer Game
- **Ngày bắt đầu:** Hôm nay
- **Trạng thái:** Phase 1 - Client Gameplay (Ưu tiên cao)

---

## ✅ Đã hoàn thành

### Phase 1: Client Setup & Core Gameplay
- [x] **React + Vite + Tailwind scaffold**
  - ✅ Tạo dự án React với TypeScript
  - ✅ Cài đặt và cấu hình Tailwind CSS
  - ✅ Cài đặt Phaser game engine
  - ✅ Tích hợp Phaser vào React (GameCanvas)

- [x] **Player di chuyển bằng WASD**
  - ✅ Thêm logic điều khiển player bằng WASD/Arrow keys
  - ✅ Player di chuyển mượt mà trong canvas
  - ✅ Giới hạn player trong màn chơi

- [x] **Render nhiều player**
  - ✅ Tạo cấu trúc dữ liệu quản lý nhiều player
  - ✅ Hiển thị 6 dot (1 player chính + 5 fake players)
  - ✅ Mỗi dot có màu sắc và tên riêng

- [x] **Va chạm đạn ↔ player**
  - ✅ Phát hiện va chạm giữa đạn và player
  - ✅ Player bị bắn sẽ "chết" (biến mất)
  - ✅ Hiệu ứng đơn giản khi player chết (explosion animation)
  - ✅ Không thể tự bắn mình

- [x] **Respawn logic**
  - ✅ Player chết sẽ respawn sau 3 giây
  - ✅ Vị trí respawn ngẫu nhiên
  - ✅ Hiển thị countdown respawn (3, 2, 1 giây)
  - ✅ Player đang respawn không thể bị bắn

- [x] **Score system (local)**
  - ✅ Đếm số lần bắn trúng (+10 điểm mỗi lần)
  - ✅ Hiển thị điểm số trên màn hình
  - ✅ Lưu điểm cao nhất (localStorage)
  - ✅ Tên player biến mất khi chết và xuất hiện lại khi respawn

- [x] **Game UI**
  - ✅ HUD hiển thị điểm số, high score
  - ✅ Menu pause/resume (ESC key)
  - [ ] Màn hình game over

---

## 🚧 Đang làm

### Lỗi cần sửa (Ưu tiên cao)
- [x] **Fix Phaser.Class error**
  - ✅ Đã refactor scene để sử dụng ES6 class
  - ⚠️ Còn lỗi TypeScript null check (không ảnh hưởng chạy game)

- [x] **Fix pause/resume bug**
  - ✅ Đã sửa logic pause/resume
  - ✅ ESC key hoạt động bình thường

### Tính năng đang phát triển
- [x] **Bắn đạn bằng chuột**
  - ✅ Click chuột để bắn đạn
  - ✅ Đạn di chuyển theo hướng chuột
  - ✅ Hiển thị đạn trên màn hình (màu vàng)
  - ✅ Đạn tự động biến mất sau 3 giây hoặc ra khỏi màn hình

- [x] **Score system (local)**
  - [ ] Đếm số lần bắn trúng
  - [ ] Hiển thị điểm số trên màn hình
  - [ ] Lưu điểm cao nhất (localStorage)

- [x] **Visual effects (Polish)**
  - ✅ Hiệu ứng đạn nổ đẹp hơn (particle effects, flash, explosion)
  - ✅ Particle effects khi player chết (8 particles bay ra ngoài)
  - ✅ Hiệu ứng respawn (fade in/out cho sprite và tên)
  - ✅ Hiệu ứng di chuyển mượt mà hơn (trail effect cho đạn)

- [x] **Gameplay nâng cao**
  - ✅ Mỗi nhân vật có máu (HP), mặc định 3 điểm
  - ✅ Trúng đạn 3 lần sẽ chết (respawn lại từ đầu)
  - ✅ Hiển thị thanh máu trên đầu nhân vật
  - ✅ Bot (fake player) di chuyển ngẫu nhiên
  - ✅ Bot có thể bắn đạn về phía player
  - ✅ Bot và player đều có điểm, cộng điểm khi bắn chết đối thủ

- [x] **Leaderboard**
  - ✅ Hiển thị realtime ở góc phải trên, sắp xếp theo điểm
  - ✅ Hiển thị cả bot và player chính

- [x] **Gun & Shooting Polish**
  - ✅ Mỗi nhân vật có mũi súng (hình chữ nhật) hướng theo chuột hoặc mục tiêu
  - ✅ Hiệu ứng flash khi bắn
  - ✅ Sửa bug mất mũi súng sau khi respawn

- [ ] **Refactor & Code Structure**
  - [ ] Tách logic game khỏi UI (GameScene, Player, Bullet, Bot...)
  - [ ] Phân tách file: src/game/ (logic), src/components/ (UI), src/types/
  - [ ] Chuẩn hóa code, dễ mở rộng cho multiplayer

- [ ] **Game settings**
  - [ ] Tùy chỉnh tốc độ di chuyển
  - [ ] Tùy chỉnh tốc độ đạn
  - [ ] Toggle sound effects

### Phase 3: UI/UX Polish (Client-side)
- [x] **Game UI**
  - ✅ HUD hiển thị điểm số, high score
  - ✅ Menu pause/resume (ESC key)
  - ⚠️ Màn hình game over (để sau)

### Phase 4: Multiplayer Preparation
- [ ] **Refactor code structure**
  - [ ] Tách logic game ra khỏi UI
  - [ ] Chuẩn bị cấu trúc cho WebSocket
  - [ ] Tạo game state management

---

## 🔄 Server-side (Để sau)

### Phase 5: WebSocket + Sync
- [ ] **Gửi + nhận vị trí giữa các client**
- [ ] **Quản lý danh sách player (id, name, x, y)**
- [ ] **Sync đạn & collision**

### Phase 6: Leaderboard + API
- [ ] **Server tính điểm**
- [ ] **REST API: `/api/leaderboard`**
- [ ] **React UI hiển thị top điểm**

---

## 🎮 Tính năng game hiện tại
- ✅ Màn chơi 800x600 với background xanh đậm
- ✅ 6 dot (player) với màu sắc khác nhau
- ✅ Player chính (You) điều khiển được bằng WASD
- ✅ 5 fake players đứng yên (để test)
- ✅ Tên hiển thị trên đầu mỗi dot

---

## 🔧 Tech Stack đã setup
- ✅ **Client:** React 19 + TypeScript + Vite
- ✅ **Styling:** Tailwind CSS
- ✅ **Game Engine:** Phaser 3.90.0
- ✅ **Package Manager:** pnpm

---

## 📝 Ghi chú
- **Ưu tiên:** Sửa lỗi Phaser.Class → Bắn đạn → Va chạm → Respawn
- **Server:** Để sau khi client gameplay hoàn thiện
- **Focus:** Tạo game loop hoàn chỉnh trước khi làm multiplayer 

## 💡 Ý tưởng & Tính năng mở rộng (TODO)

- **Địa hình**
  - [ ] Thêm vật cản (obstacle) trên bản đồ
  - [ ] Vật cản không thể di chuyển qua, đạn cũng không bắn xuyên qua

- **Tuyệt chiêu (Ultimate Skill)**
  - [ ] Thêm thanh năng lượng (energy bar) cho mỗi nhân vật
  - [ ] Thanh năng lượng tối đa 5 điểm, tiêu diệt 1 địch được 1 điểm
  - [ ] Đầy năng lượng sẽ kích hoạt tuyệt chiêu: bắn liên tiếp 10 viên đạn
  - [ ] Khi đầy năng lượng, nhân vật có hiệu ứng hiển thị nổi bật
  - [ ] Thêm hiệu ứng đạn đặc biệt cho chiêu tuyệt chiêu
  - [ ] Chết sẽ bị reset năng lượng

- **Hạt năng lượng (Energy Orb)**
  - [ ] Thêm hạt năng lượng mọc ngẫu nhiên trên bản đồ
  - [ ] Mỗi hạt nhặt được tăng 1 điểm năng lượng
  - [ ] Cứ 5s sẽ mọc 1 hạt mới 