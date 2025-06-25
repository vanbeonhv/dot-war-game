`GameHub` là lớp trung tâm trong SignalR – nó giống như “server-side controller cho kết nối realtime”.

Mỗi khi một client (trình duyệt, app) kết nối, nó nối tới GameHub qua WebSocket.

Mọi dữ liệu realtime sẽ đi qua các method trong Hub này:

Client gọi server → gọi hàm trong GameHub

Server gửi tin lại client → gọi Clients.Caller, Clients.All, v.v.

💡 Bạn có thể hiểu GameHub như:  
👉 “Nơi nhận lệnh từ client (vd: di chuyển, bắn)”   
👉 “Nơi gửi phản hồi realtime về client (vd: sync vị trí, cập nhật điểm số)”