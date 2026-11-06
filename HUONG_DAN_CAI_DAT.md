# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG SMARTOMR 1.0

**Phiên bản:** PWA 1.0 – bản thử nghiệm (06/11/2026)  
**Chức năng:** Chấm phiếu trắc nghiệm trên trình duyệt; hỗ trợ camera điện thoại, cấu hình điểm và đáp án 3 phần, nhận diện số báo danh và gợi ý tên tiếng Việt, tổng hợp điểm trực tiếp.

> **Quan trọng:** Đây là bản thử nghiệm, chưa được kiểm định độ chính xác chấm thi; phải rà soát các ô tô mờ, kết quả OCR và riêng phần trả lời ngắn. Dữ liệu chỉ lưu trong trình duyệt, chưa đồng bộ Google Sheets.

## 1. Thành phần gói cài đặt

- `index.html`: giao diện ứng dụng (bản triển khai sạch, không có dữ liệu học sinh/đáp án ban đầu).
- `manifest.webmanifest`, `sw.js`, thư mục `icons/`: cài lên màn hình chính như ứng dụng PWA, dùng tốt trên điện thoại.
- `Danh_sach_HS_mau.csv`: tệp mẫu để nhập từ Excel.
- `tai_lieu/Mau_phieu_2018.pdf`: phiếu trắc nghiệm tham chiếu (40/8/6 câu).
- `HUONG_DAN_CAI_DAT.html` và `HUONG_DAN_CAI_DAT.md`: hướng dẫn sử dụng và xử lý lỗi.

Không cần cài Python, PHP, Node.js hay Google Apps Script để ứng dụng hoạt động. **Tuy nhiên**, muốn dùng camera và cài PWA ổn định, cần tải ứng dụng lên địa chỉ **HTTPS**; OCR tiếng Việt cần Internet để tải Tesseract.js và mô hình ngôn ngữ.

## 2. Cài đặt nhanh bằng GitHub Pages (khuyên dùng)

1. Tải file `SmartOMR_CaiDat_DienThoai_v1.0.zip`, giải nén trên máy tính.
2. Đăng nhập [github.com](https://github.com). Vào **New repository** để tạo kho mới, ví dụ `smartomr`; với tài khoản GitHub Free chọn kho **Public** để dùng GitHub Pages.
3. Vào kho vừa tạo → **Add file → Upload files**; tải lên **các tệp và thư mục trong thư mục đã giải nén** sao cho `index.html` nằm ngay ở thư mục gốc của kho. Bấm **Commit changes**.
4. Vào **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Chọn nhánh `main`, thư mục `/(root)` rồi **Save**.
5. Khi hệ thống xuất bản xong, truy cập địa chỉ dạng `https://TEN-TAI-KHOAN.github.io/smartomr/` (thay tên tài khoản và kho thật).
6. Trên điện thoại, mở địa chỉ đó bằng Chrome/Safari để cấp quyền camera và cài biểu tượng lên màn hình chính.

**Chú ý bảo mật:** mã nguồn ứng dụng và các tệp bạn tải lên GitHub Pages có thể truy cập công khai. Không tải tệp sao lưu JSON, danh sách học sinh thực, ảnh phiếu đã làm hoặc bảng điểm thực lên kho GitHub.

## 3. Cài qua Vercel (phương án thay thế)

**Cách thuận tiện:** đưa toàn bộ mã nguồn lên một kho GitHub (như bước 2.1–2.3), vào [vercel.com](https://vercel.com) → **Add New / Project** → chọn kho → **Deploy**. Đây là dự án HTML tĩnh, không cần framework. Truy cập URL HTTPS được Vercel cấp.

**Dành cho người biết dòng lệnh:** giải nén, mở terminal trong thư mục chứa `index.html`, cài CLI bằng `npm i -g vercel`, đăng nhập và chạy `vercel --prod` theo hướng dẫn.

## 4. Cài biểu tượng lên màn hình điện thoại

- **Android/Chrome:** mở URL HTTPS ứng dụng, bấm menu `⋮` rồi chọn **Cài đặt ứng dụng / Install app** hoặc **Thêm vào màn hình chính** (tùy phiên bản trình duyệt).
- **iPhone/Safari:** mở URL HTTPS → nút **Chia sẻ** → **Thêm vào Màn hình chính (Add to Home Screen)** → bật **Mở như ứng dụng web (Open as Web App)** nếu hiển thị → **Thêm**.
- **Máy tính Chrome/Edge:** mở URL HTTPS → biểu tượng cài ứng dụng ở thanh địa chỉ (nếu có), hoặc từ menu trình duyệt chọn cài ứng dụng/trang web.

PWA là ứng dụng web được cài biểu tượng, **không phải APK**. Giữ nguyên địa chỉ website sau khi cài để dữ liệu cục bộ không bị tách sang một tên miền khác.

## 5. Thiết lập lần đầu trước khi chấm

1. **Danh sách học sinh:** dùng Excel tạo các cột `SBD,Họ và tên,Lớp` rồi lưu **CSV UTF-8**. SBD 8 chữ số: lưu dưới dạng **Text** để giữ số 0 ở đầu. Vào **Danh sách học sinh → Nhập CSV từ Excel**.
2. **Cấu hình điểm:** vào **Cấu hình điểm**, đặt số câu của Phần I (không quá 40), Phần II (không quá 8) và Phần III (không quá 6). Đặt điểm cho từng câu, hoặc nhập tổng điểm của phần rồi bấm **Chia đều**. Phần II có bảng hệ số điểm theo số ý đúng (0–4), điều chỉnh nếu cần.
3. **Đáp án chuẩn:** vào **Đáp án chuẩn**, nhập đáp án Phần I (A–D), Phần II (Đúng/Sai từng ý a–d), Phần III (số, dấu âm, dấu phẩy). Bản triển khai bắt đầu với đáp án trống và **không cho lưu bảng điểm nếu còn đáp án chưa cấu hình**.
4. **Kiểm tra thang điểm:** mặc định tổng là 10 điểm (4 + 4 + 2) theo phân bổ tham khảo; nếu đổi số câu thì phải kiểm tra lại tổng và điều chỉnh điểm.
5. **Sao lưu:** sau khi nhập xong danh sách và đáp án, vào **Lịch sử chấm → Sao lưu toàn bộ (.json)** để lưu dự phòng.

## 6. Chấm bài bằng camera

1. Vào **Quét bằng camera** → cho phép camera hoặc bấm **Chụp / tải ảnh**.
2. Đặt phiếu phẳng, đầy đủ bốn mốc định vị đen; đủ sáng, không bóng, không che mép.
3. Chạm lần lượt **bốn góc** theo hướng dẫn trên màn hình để ứng dụng căn chỉnh ảnh.
4. Bấm **Đọc phiếu + tên tiếng Việt**. Ứng dụng thử đọc ô tô, SBD, mã đề và cắt vùng họ tên để OCR.
5. Màn hình chuyển đến **Chấm bài và bảng điểm**, hiện **họ tên, SBD, Phần I, II, III và tổng điểm**.
6. Kiểm tra các ô mờ/nhiều đáp án, đặc biệt **Phần III phải đối chiếu thủ công**. Nếu chữ viết tay hoặc SBD chưa chắc chắn, chọn học sinh trong danh sách hoặc xác nhận gợi ý.
7. Bấm **Lưu & quét tiếp** để chấm phiếu tiếp theo.
8. Vào **Lịch sử chấm → Xuất CSV (Excel)** để tải bảng điểm.

### Nhận diện họ tên tiếng Việt

SBD hợp lệ được ưu tiên dùng để tra tên tiếng Việt có dấu từ danh sách nhập trước. OCR chữ viết tay có thể sai dấu, sai chữ, sai họ; **không dùng tên OCR chưa xác nhận làm danh tính chính thức**. Khi OCR và SBD mâu thuẫn, hệ thống yêu cầu xác nhận trước khi lưu.

## 7. Sao lưu, khôi phục và nâng cấp

- **Sao lưu:** vào **Lịch sử chấm** → **Sao lưu toàn bộ (.json)**. Tệp có đầy đủ danh sách, đáp án, cấu hình điểm và lịch sử, có **thông tin học sinh**, vì vậy cần lưu riêng, không chia sẻ công khai.
- **Khôi phục:** vào **Lịch sử chấm** → **Khôi phục từ tệp JSON**; chọn tệp đã sao lưu. Hệ thống yêu cầu xác nhận vì thao tác này **ghi đè toàn bộ dữ liệu hiện tại trong trình duyệt**.
- **Cập nhật phiên bản:** thay mới mã nguồn tại **chính URL/domain đang dùng**; xuất sao lưu JSON trước, tải lại trang để lấy phiên bản mới. Không xóa dữ liệu trang web hoặc đổi trình duyệt/hồ sơ người dùng khi chưa sao lưu.
- **Đổi điện thoại:** lưu JSON trên điện thoại cũ → mở cùng URL ứng dụng trên điện thoại mới → nhập tệp JSON vào mục Khôi phục.

## 8. Cách xử lý lỗi thường gặp

| Vấn đề | Cách xử lý |
|---|---|
| Không mở được camera | Dùng địa chỉ HTTPS, cho phép Camera trong quyền trang web, thử Chrome/Safari mới nhất. Có thể dùng nút Chụp/tải ảnh thay thế. |
| Không có nút Cài ứng dụng | Kiểm tra URL HTTPS, dùng Chrome trên Android hoặc Safari trên iPhone; thử thêm vào Màn hình chính. |
| Ứng dụng không xuất hiện sau khi tải GitHub | Đảm bảo `index.html` ở gốc kho, Settings → Pages đang chọn main và /(root), chờ triển khai hoàn tất. |
| OCR không nhận tiếng Việt | Kiểm tra Internet (tải thư viện/mô hình qua CDN); chụp đủ sáng, không nhòe; thử chọn tên từ danh sách. |
| Tên không khớp | So lại SBD 8 số và danh sách CSV; OCR chữ viết tay chỉ là gợi ý, không tự quyết định. |
| Điểm bằng 0 hoặc không lưu được | Kiểm tra đáp án chuẩn có đủ chưa, số câu/thang điểm và câu trống; kết quả camera chỉ tạm tính trước xác nhận. |
| Không thấy dữ liệu trên máy khác | Phiên bản này **không có máy chủ đồng bộ**; phải xuất JSON và khôi phục thủ công. |
| Không thấy tệp CSV/JSON đã tải | Kiểm tra thư mục Downloads/Tệp trên điện thoại hoặc quyền tải xuống của trình duyệt. |

## 9. Giới hạn an toàn

- Bản 1.0 là **bản thử nghiệm**, không khuyến nghị dùng để quyết định điểm thi chính thức trước khi kiểm định với nhiều phiếu thực tế.
- Mẫu hỗ trợ tối đa 40 câu Phần I, 8 câu Phần II và 6 câu Phần III; thay đổi vị trí ô/tỉ lệ phiếu có thể khiến thuật toán nhận sai.
- Nhận dạng chữ viết tay tiếng Việt của Tesseract không đảm bảo chính xác; phần III chưa nhận tự động đầy đủ.
- Dữ liệu được lưu bằng **localStorage** trên chính thiết bị/trình duyệt; không có tài khoản đăng nhập, phân quyền, máy chủ, đồng bộ Google Sheets hay mã hóa dữ liệu ứng dụng. Không dùng trên thiết bị công cộng khi chứa dữ liệu học sinh thật.
- PWA có thể mở giao diện khi mạng yếu nhờ bộ nhớ đệm, nhưng OCR tiếng Việt có thể **không hoạt động ngoại tuyến** vì tải thư viện/mô hình từ Internet.

**Liên kết tham khảo:** https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site ; https://vercel.com/docs/deployments ; https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27 ; https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
