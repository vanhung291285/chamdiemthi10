# SmartOMR Standalone 3.0 — Vercel only

## Cài đặt
1. Giải nén ZIP. Đưa **index.html**, **js/omr-auto.js** và **vercel.json** lên thư mục gốc GitHub (không tải nguyên ZIP vào repo).
2. Trên Vercel: Import repository → Framework Preset: Other → Root Directory: thư mục chứa index.html → Deploy.
3. Mở địa chỉ HTTPS bằng Chrome trên điện thoại, cấp quyền camera. Không cần PIN, Google Sheets, Apps Script, API hoặc biến môi trường.
4. Vào **Đáp án chuẩn** và **Cấu hình điểm** để nhập đáp án, điểm từng câu trước khi chấm. Không có đáp án mẫu mặc định.
5. Mở **Quét bằng camera**, giữ phiếu phẳng, đủ sáng, thấy bốn mốc góc; hệ thống thử tự quét sau 3 khung hình ổn định. Nếu không được, chụp ảnh và chọn 4 góc thủ công.
6. Kiểm tra ô tô và Phần III, lưu điểm. Xem lịch sử và xuất CSV.

## Quan trọng
- Dữ liệu lưu trong localStorage **của trình duyệt/thiết bị**, không đồng bộ giữa các máy; xóa dữ liệu trình duyệt có thể mất điểm và đáp án. Hãy xuất CSV và sao lưu JSON định kỳ.
- Chữ viết tay tiếng Việt OCR phụ thuộc dịch vụ tải ngôn ngữ bên ngoài, không bảo đảm chính xác. Họ tên và SBD không bắt buộc.
- Mẫu tọa độ nhận dạng được thiết kế cho phiếu TNTN 2018 đính kèm. Ảnh thật, bóng đổ, góc chụp, chất lượng in cần kiểm định trước khi dùng cho điểm chính thức.
- Phần III phải kiểm tra thủ công trước khi lưu. Điểm không nên dùng chính thức khi chưa đối chiếu.
- Vì là ứng dụng thuần client-side, đáp án và điểm trên thiết bị không được bảo vệ chống chỉnh sửa; không phù hợp làm hệ thống điểm thi bảo mật cao.
