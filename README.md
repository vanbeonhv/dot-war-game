# 📊 Progress - Dot War Game 2D (Survival Mode)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/vanbeonhv/dot-war-game?utm_source=oss&utm_medium=github&utm_campaign=vanbeonhv%2Fdot-war-game&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
## 🎮 Demo

![game-play](assets/game-play.png)

https://github.com/user-attachments/assets/a1eefca3-7d09-42c7-bb92-2d2be65f0d65

---

## ✅ Checklist phát triển

### 1. Khởi tạo & Cơ bản

- ✅ Scaffold React + Vite + Tailwind
- ✅ Cài đặt Phaser 3
- ✅ Tích hợp canvas game vào React (GameCanvas)

### 2. Gameplay Core

- ✅ Player di chuyển bằng WASD
- ✅ Bắn đạn bằng chuột
- ✅ Đạn va chạm player (chết, respawn)
- ✅ Giới hạn player trong màn chơi
- ✅ Hiển thị nhiều bot (fake player), mỗi bot màu khác nhau
- ✅ Bot di chuyển ngẫu nhiên, có thể bắn về phía player
- ✅ Va chạm đạn ↔ player, bot chết sẽ respawn
- ✅ Không thể tự bắn mình
- ✅ Hiển thị tên, máu, điểm số
- ✅ Hiển thị leaderboard điểm số
- ✅ Vật cản (obstacle) random trên bản đồ, không thể đi/bắn xuyên qua

### 3. Nâng cao & Polish

- ✅ Hiệu ứng đạn nổ, particle, flash, explosion
- ✅ Hiệu ứng respawn (fade in/out, countdown)
- ✅ Hiệu ứng di chuyển mượt mà hơn (trail effect cho đạn)
- ✅ HUD hiển thị điểm số, high score
- ✅ Menu pause/resume (ESC key)
- ✅ Refactor code: tách logic game khỏi UI, chuẩn hóa code
- ✅ Leaderboard realtime (local)
- ✅ Bot có thể bắn đạn về phía player
- ✅ Mỗi nhân vật có máu (HP), mặc định 3 điểm
- ✅ Trúng đạn 3 lần sẽ chết (respawn lại từ đầu)
- ✅ Hiển thị thanh máu trên đầu nhân vật
- ✅ Cộng điểm khi bắn chết bot

### 4. Ultimate Skill (Tuyệt chiêu)

- ✅ Thêm thanh năng lượng (energy bar) cho mỗi nhân vật, tối đa 5 điểm
- ✅ Tiêu diệt 1 địch được +1 energy (không tăng khi tự sát hoặc đối thủ chết do nguyên nhân khác)
- ✅ Đầy năng lượng (5/5) sẽ kích hoạt được ultimate: bắn liên tiếp 10 viên đạn theo hình quạt (spread shot ±45 độ quanh hướng chuột)
- ✅ Khi đầy năng lượng, player có hiệu ứng nổi bật (viền sáng, nhấp nháy, hoặc glow). Có thể thêm popup nhỏ "Ultimate Ready!" trên đầu player
- ✅ Đạn ultimate có hiệu ứng đặc biệt (màu khác, particle effect, tốc độ nhanh hơn)
- ✅ Chết sẽ reset năng lượng về 0
- ✅ Không thể tích lũy energy vượt quá 5
- ✅ Chỉ dùng ultimate khi còn sống, không đang respawn
- ✅ Không có cooldown cho ultimate (có thể dùng liên tục nếu đủ energy)
- ✅ Ultimate chỉ bắn về hướng chuột, spread ±45 độ quanh hướng chuột
- ✅ Âm thanh: Có hiệu ứng âm thanh khi kích hoạt ultimate

#### Hướng mở rộng về sau

- ⬜ Ultimate có thể có cooldown (ví dụ: 5 giây sau khi dùng mới được dùng tiếp)
- ⬜ Ultimate có thể gây hiệu ứng đặc biệt lên đối thủ (làm chậm, choáng, v.v.)
- ⬜ Có thể nâng cấp ultimate (bắn nhiều viên hơn, damage cao hơn, hiệu ứng đẹp hơn)
- ⬜ Thêm nhiều loại ultimate khác nhau cho từng nhân vật
- ⬜ Thêm thông báo nổi bật khi player dùng ultimate thành công
- ⬜ Bot có thể tự động dùng ultimate khi đủ energy
- ⬜ Ultimate có thể phá vật cản hoặc xuyên qua nhiều đối thủ

### 5. Power-ups System

- ✅ Tạo cấu trúc dữ liệu PowerUp (id, type, x, y, sprite, duration, value)
- ✅ Logic spawn power-up ngẫu nhiên trên map (không trên obstacle)
- ✅ Logic nhặt power-up khi player đi qua
- ✅ Health Pack: Hồi 1 máu (tối đa 3 máu), icon ❤️ màu đỏ
- ✅ Energy Orb: +2 energy ngay lập tức, icon ⚡ màu vàng
- ✅ Speed Boost: Tăng tốc độ di chuyển 50% trong 10 giây, icon 💨 màu xanh
- ✅ Rapid Fire: Giảm cooldown bắn 70% trong 8 giây, icon 🔥 màu cam
- ✅ Shield: Bảo vệ 1 lần bị bắn, icon 🛡️ màu xanh
- ✅ Double Damage: Đạn mạnh gấp đôi trong 15 giây, icon ⚔️ màu đỏ
- ✅ Visual effects cho power-up (animation xoay, nhấp nháy)
- ✅ Particle effects khi nhặt power-up
- ✅ Hiệu ứng nháy màu khi nhận power-up
- ✅ Hiệu ứng phụ động: gió cho speed, lửa động cho rapid
- ⬜ Hiệu ứng phụ động: tia sét/vòng năng lượng cho damage, tim đập cho health, tia điện cho energy
- ⬜ HUD hiển thị power-up đang active với timer
- ⬜ Power-up tự động biến mất sau 10 giây nếu không ai nhặt
- ⬜ Giới hạn tối đa 2-3 power-up trên map cùng lúc

### 6. 🎯 Survival Mode - Chế độ sinh tồn

#### 6.1 Core Survival Mechanics
- ✅ Hệ thống thời gian sống sót (timer countdown)
- ✅ Wave system: mỗi wave tăng độ khó, bot chỉ spawn 1 lần đầu wave, giết hết bot mới qua wave mới
- ✅ Mục tiêu rõ ràng: "Sống sót X phút" hoặc "Vượt qua X wave"
- ✅ Game over screen với thống kê (thời gian sống, điểm số, wave đạt được)
- ⬜ High score system cho survival mode

#### 6.2 Progressive Difficulty
- ✅ Bot spawn nhiều hơn theo wave (3, 5, 7, ...)
- ✅ Bot di chuyển nhanh hơn ở wave cao
- ✅ Bot bắn nhanh hơn và chính xác hơn
- ✅ **Bot có pattern bắn đạn thông minh từ wave 5 trở đi:**
  - Pattern 1: Bắn thẳng với độ lệch nhỏ (±11 độ)
  - Pattern 2: Bắn 3 viên spread (±15 độ)
  - Pattern 3: Bắn với độ lệch lớn (±22 độ)
  - Pattern 4: Bắn 2 viên song song
- ✅ **Boss có 5 pattern bắn đạn đa dạng từ wave 5 trở đi:**
  - Pattern 1: Bắn thẳng với độ lệch lớn (±30 độ)
  - Pattern 2: Bắn 4 viên spread (±45 độ)
  - Pattern 3: Bắn 3 viên song song
  - Pattern 4: Bắn 2 viên với hướng hoàn toàn ngẫu nhiên
  - Pattern 5: Bắn 2 viên với tốc độ khác nhau (chậm và nhanh)
- ✅ **Ultimate của Boss được cải thiện:**
  - Tăng spread từ ±60 độ lên ±90 độ
  - Tăng số đạn từ 8 lên 10 viên
  - Thêm độ lệch ngẫu nhiên ±15 độ cho từng đạn
- ✅ **Wave 1-4: Bot và Boss bắn đơn giản, dễ né hơn**
- ✅ **Wave 5+: Bot và Boss có pattern phức tạp, khó né hơn**
- ⬜ Bot có thể dùng ultimate skill ở wave cao
- ✅ Boss bot xuất hiện cuối mỗi 5 wave

#### 6.3 Survival Rewards & Progression
- ⬜ Combo system: bắn liên tiếp được bonus điểm
- ⬜ Streak bonus: sống sót càng lâu càng nhiều điểm
- ⬜ Survival milestones: đạt 1 phút, 2 phút, 5 phút...
- ⬜ Unlock new abilities sau mỗi milestone
- ⬜ Persistent upgrades giữa các game

#### 6.4 Enhanced AI & Gameplay
- ⬜ Bot có thể thu thập power-up
- ⬜ Bot có thể tạo thành nhóm tấn công
- ⬜ Bot tránh đạn thông minh hơn
- ⬜ Bot có thể dùng shield và ultimate
- ⬜ Bot có thể heal khi HP thấp

#### 6.5 Dynamic Environment
- ⬜ Map thay đổi theo thời gian (obstacle di chuyển)
- ⬜ Khu vực nguy hiểm (lava, poison) xuất hiện
- ⬜ Safe zones tạm thời
- ⬜ Teleport points
- ⬜ Environmental hazards

#### 6.6 UI/UX Polish
- ⬜ HUD hiển thị thời gian sống sót, wave hiện tại
- ⬜ HUD hiển thị power-up đang active và thời gian còn lại
- ⬜ Màn hình hướng dẫn phím điều khiển (WASD, Q để ulti)
- ⬜ Hiệu ứng âm thanh và visual feedback
- ⬜ Toggle sound effects
- ⬜ Tùy chỉnh tốc độ di chuyển, tốc độ đạn
- ⬜ Polish UI/UX: hiệu ứng, âm thanh, animation mượt mà hơn

#### 6.7 Code Optimization
- ⬜ Tối ưu code, tách logic game và UI rõ ràng hơn
- ⬜ Refactor game state management
- ⬜ Implement proper game modes system
- ⬜ Add configuration system cho difficulty
- ⬜ Performance optimization cho nhiều bot

### 7. 🦾 Boss Bot (Survival Mode)

#### 7.1 Thiết kế tổng quan
- ✅ Boss xuất hiện ở cuối mỗi 5 wave (Wave 5, 10, 15, ...)
- ✅ Boss có HP cao (15~30 máu), kích thước lớn, hiệu ứng đặc biệt
- ✅ Boss có AI di chuyển thông minh, tấn công đa dạng
- ✅ Boss có ultimate skill (bắn spread, burst, đạn nổ...)
- ✅ Khi gần chết, boss có thể "enrage" (tăng tốc, đổi pattern)
- ✅ Khi tiêu diệt boss: nhận nhiều điểm, rơi nhiều power-up, hồi máu/energy
- ✅ Thanh máu boss lớn trên HUD, hiệu ứng đặc biệt khi boss xuất hiện/chết

#### 7.2 Checklist Boss Bot
- ✅ Tạo class `BossBot` kế thừa từ `Player`
- ✅ Logic spawn boss ở cuối mỗi 5 wave
- ✅ AI di chuyển và tấn công đặc biệt cho boss
- ✅ Ultimate skill cho boss
- ✅ Hiệu ứng đặc biệt (glow, outline, particle)
- ✅ Thanh máu boss trên HUD
- ✅ **AI bắn đạn thông minh với 5 pattern khác nhau từ wave 5 trở đi**
- ✅ **Ultimate skill được cải thiện với spread rộng hơn và nhiều đạn hơn**
- ✅ **Wave 1-4: Boss bắn đơn giản với độ lệch nhỏ (±11 độ)**
- ✅ **Wave 5+: Boss có pattern phức tạp, khó né hơn**
- ⬜ Phần thưởng khi tiêu diệt boss
- ✅ Âm thanh/visual effect khi boss xuất hiện/chết

#### 7.3 Mô tả chi tiết Boss Bot
- **HP cao**: Gấp 5-10 lần bot thường (ví dụ: 15~30 máu)
- **Kích thước lớn hơn**: Sprite lớn hơn bot thường (gấp 1.5~2 lần)
- **Tốc độ di chuyển**: Nhanh hơn bot thường ở wave đầu, có thể tăng khi gần chết
- **Tốc độ bắn**: Bắn liên tục hoặc burst fire
- **Ultimate**: Có thể dùng ultimate skill (bắn nhiều viên, đạn xuyên, đạn nổ...)
- **AI bắn đạn thông minh**: 
  - **Wave 1-4**: Bắn đơn giản với độ lệch nhỏ (±11 độ)
  - **Wave 5+**: 5 pattern bắn đạn đa dạng (spread, song song, ngẫu nhiên, tốc độ khác nhau)
- **Ultimate cải thiện**: Spread ±90 độ, 10 viên đạn, độ lệch ngẫu nhiên
- **Hiệu ứng đặc biệt**: Glow, outline, particle riêng biệt
- **Tên riêng**: Hiển thị "BOSS" hoặc tên đặc biệt trên đầu
- **AI**: Đuổi theo player chính, tránh đạn, triệu hồi bot thường ở wave cao
- **Enrage**: Khi gần chết, tăng tốc hoặc đổi pattern tấn công
- **Phần thưởng**: Nhiều điểm, nhiều power-up, hồi máu/energy
- **UI/UX**: Thanh máu boss lớn, hiệu ứng rung màn hình/âm thanh khi boss xuất hiện/chết

**managers/PlayerManager.ts**
- Khi đến boss wave, spawn 1 BossBot thay vì bot thường.
- Theo dõi boss còn sống để kết thúc wave.

**ui/GameUI.ts**
- Thêm thanh máu boss lớn ở trên cùng màn hình khi boss xuất hiện.

---

### 🆕 **Mô tả Survival Mode (Wave System mới)**

- Mỗi wave sẽ spawn số lượng bot cố định (Wave 1: 3 bot, Wave 2: 5 bot, Wave 3: 7 bot, ...)
- Bot chỉ spawn 1 lần đầu wave, **bot chết sẽ không respawn**
- Khi giết hết toàn bộ bot của wave hiện tại, sẽ có 3 giây nghỉ (break) rồi mới sang wave tiếp theo
- Wave sau sẽ tăng số lượng bot, tốc độ di chuyển và tốc độ bắn của bot cũng tăng dần
- UI hiển thị số bot còn lại, wave hiện tại, và tiến độ tiêu diệt bot
- Mục tiêu: sống sót càng lâu, vượt qua càng nhiều wave càng tốt!

---

### 🎯 **Cải tiến gần đây (Latest Updates)**

#### **Hệ thống bắn đạn thông minh**
- **Bot thường**: Từ wave 5 trở đi có 4 pattern bắn đạn khác nhau thay vì chỉ bắn thẳng
- **Boss Bot**: Từ wave 5 trở đi có 5 pattern bắn đạn đa dạng và khó né hơn
- **Ultimate Boss**: Được cải thiện với spread rộng hơn và nhiều đạn hơn
- **Progressive Difficulty**: Wave 1-4 dễ chơi, wave 5+ tăng độ khó đáng kể

#### **Sửa lỗi hệ thống**
- ✅ Sửa lỗi wave bị reset về 1 sau wave 5
- ✅ Sửa lỗi boss ultimate gây crash khi bulletManager null
- ✅ Đảm bảo wave 1 luôn có bot khi bắt đầu game
- ✅ Cải thiện logic khởi tạo game và chuyển wave

#### **Cân bằng game**
- **Wave 1-4**: Bot và boss bắn đơn giản (±7-11 độ lệch), phù hợp cho người mới
- **Wave 5+**: Pattern phức tạp, độ lệch lớn (±15-45 độ), thách thức cho người chơi có kinh nghiệm
- **Boss**: Từ wave 5 trở đi trở nên nguy hiểm hơn với pattern đa dạng
