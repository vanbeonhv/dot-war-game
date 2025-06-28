# 📊 Progress - Dot War Game (Single Player)

## 🎯 Tổng quan
- **Dự án:** Dot War - 2D Single Player Game
- **Trạng thái:** Đang phát triển

---

## ✅ Checklist phát triển

### 1. Khởi tạo & Cơ bản
- [x] Scaffold React + Vite + Tailwind
- [x] Cài đặt Phaser 3
- [x] Tích hợp canvas game vào React (GameCanvas)

### 2. Gameplay Core
- [x] Player di chuyển bằng WASD
- [x] Bắn đạn bằng chuột
- [x] Đạn va chạm player (chết, respawn)
- [x] Giới hạn player trong màn chơi
- [x] Hiển thị nhiều bot (fake player), mỗi bot màu khác nhau
- [x] Bot di chuyển ngẫu nhiên, có thể bắn về phía player
- [x] Va chạm đạn ↔ player, bot chết sẽ respawn
- [x] Không thể tự bắn mình
- [x] Hiển thị tên, máu, điểm số
- [x] Hiển thị leaderboard điểm số
- [x] Vật cản (obstacle) random trên bản đồ, không thể đi/bắn xuyên qua

### 3. Nâng cao & Polish
- [x] Hiệu ứng đạn nổ, particle, flash, explosion
- [x] Hiệu ứng respawn (fade in/out, countdown)
- [x] Hiệu ứng di chuyển mượt mà hơn (trail effect cho đạn)
- [x] HUD hiển thị điểm số, high score
- [x] Menu pause/resume (ESC key)
- [x] Refactor code: tách logic game khỏi UI, chuẩn hóa code
- [x] Leaderboard realtime (local)
- [x] Bot có thể bắn đạn về phía player
- [x] Mỗi nhân vật có máu (HP), mặc định 3 điểm
- [x] Trúng đạn 3 lần sẽ chết (respawn lại từ đầu)
- [x] Hiển thị thanh máu trên đầu nhân vật
- [x] Cộng điểm khi bắn chết bot

### 4. Ultimate Skill (Tuyệt chiêu)
- [ ] Thêm thanh năng lượng (energy bar) cho mỗi nhân vật, tối đa 5 điểm
- [ ] Tiêu diệt 1 địch được +1 energy (không tăng khi tự sát hoặc đối thủ chết do nguyên nhân khác)
- [ ] Đầy năng lượng (5/5) sẽ kích hoạt được ultimate: bắn liên tiếp 10 viên đạn theo hình quạt (spread shot ±45 độ quanh hướng chuột)
- [ ] Khi đầy năng lượng, player có hiệu ứng nổi bật (viền sáng, nhấp nháy, hoặc glow). Có thể thêm popup nhỏ "Ultimate Ready!" trên đầu player
- [ ] Đạn ultimate có hiệu ứng đặc biệt (màu khác, particle effect, tốc độ nhanh hơn)
- [ ] Chết sẽ reset năng lượng về 0
- [ ] Không thể tích lũy energy vượt quá 5
- [ ] Chỉ dùng ultimate khi còn sống, không đang respawn
- [ ] Không có cooldown cho ultimate (có thể dùng liên tục nếu đủ energy)
- [ ] Ultimate chỉ bắn về hướng chuột, spread ±45 độ quanh hướng chuột
- [ ] Âm thanh: Có hiệu ứng âm thanh khi kích hoạt ultimate

#### Hướng mở rộng về sau
- [ ] Ultimate có thể có cooldown (ví dụ: 5 giây sau khi dùng mới được dùng tiếp)
- [ ] Ultimate có thể gây hiệu ứng đặc biệt lên đối thủ (làm chậm, choáng, v.v.)
- [ ] Có thể nâng cấp ultimate (bắn nhiều viên hơn, damage cao hơn, hiệu ứng đẹp hơn)
- [ ] Thêm nhiều loại ultimate khác nhau cho từng nhân vật
- [ ] Thêm thông báo nổi bật khi player dùng ultimate thành công
- [ ] Bot có thể tự động dùng ultimate khi đủ energy
- [ ] Ultimate có thể phá vật cản hoặc xuyên qua nhiều đối thủ

### 5. UI/UX Polish & Khác
- [ ] Màn hình game over
- [ ] Tùy chỉnh tốc độ di chuyển, tốc độ đạn
- [ ] Toggle sound effects
- [ ] Thêm item hồi máu, regen máu
- [ ] Highlight player dẫn đầu
- [ ] Cơ chế "bounty": giết người top sẽ +20 điểm
- [ ] Cảnh báo nếu có người vượt top
- [ ] Thêm chế độ chơi mới (One Shot, Turbo, King of the Hill...)

---