# **BƯỚC 5: XÁC ĐỊNH SCENARIO, EPIC VÀ USER STORY**

### **1. Kịch bản sử dụng (Scenario)**

Đây là các kịch bản thực tế mô tả chi tiết cách người dùng mục tiêu tương tác với hệ thống để giải quyết các khó khăn cụ thể của họ, lấy nhân vật giả định Nguyễn Minh Đức (Persona ở Bước 3) làm trung tâm.

* **Kịch bản 1: Đức đi xem phim cuối tuần cùng hội bạn thân (Giải quyết bài toán chia tiền - Split & Lock)**  
  * **Đức** (21 tuổi, sinh viên năm 3) thường xuyên lên lịch đi xem phim với nhóm bạn 4 người vào dịp cuối tuần. Đức mở ứng dụng 3HD2Kcinema, tra cứu nhanh lịch chiếu và so sánh giá vé giữa các rạp.  
  * Thông thường, Đức sẽ phải đứng ra ứng tiền trước để đặt cả cụm ghế cạnh nhau, sau đó lại mất công tính toán và đòi tiền từng người rất ngại ngùng.  
  * Để giải quyết, khi chọn được suất chiếu phù hợp, Đức sử dụng tính năng **"Booking Nhóm" (Split & Lock)** để chọn và tạm khóa 4 ghế liền nhau trong 15 phút. Hệ thống sinh ra một đường dẫn thanh toán nhóm, Đức chỉ việc gửi đường link này vào nhóm chat của bạn bè để từng thành viên tự thanh toán phần vé của mình.  
  * Sau khi cả 4 người hoàn tất thanh toán, hệ thống chính thức khóa ghế, chốt giao dịch thành công và xuất mã QR vé nhóm, giúp cả hội bạn có chỗ ngồi đẹp liền kề mà không cần gom tiền thủ công phiền phức.  

* **Kịch bản 2: Đức đi hẹn hò và tối ưu hóa thời gian soát vé, lấy bắp nước (Tích hợp Seat Mapping & F&B)**  
  * Cuối tuần kế tiếp, **Đức** muốn đi xem phim hẹn hò cùng bạn gái. Vì thời gian rảnh không cố định, Đức đặt vé rất sát giờ chiếu ngay trên đường đi. Đức mở app 3HD2Kcinema, xem sơ đồ phòng chiếu trực quan theo thời gian thực và chọn ngay cặp ghế đôi Sweetbox có góc nhìn đẹp nhất, tránh việc phải xếp hàng mua tại quầy chỉ còn ghế góc khuất.  
  * Cực kỳ ghét việc phải xếp hàng soát vé xong lại phải tiếp tục xếp hàng lần hai tại quầy bắp nước vào giờ cao điểm, Đức chọn đặt kèm **"Combo Couple"** (bắp và nước) trực tiếp trong quy trình thanh toán vé.  
  * Đức hoàn tất thanh toán một chạm qua Ví điện tử MoMo trên điện thoại và nhận về **một mã QR Code tích hợp duy nhất** cho cả vé và combo bắp nước. Đến rạp, Đức chỉ cần đưa mã QR ra quét một lần tại cửa kiểm soát để vừa soát vé vừa lấy đồ ăn nhanh chóng mà không phải xếp hàng chờ đợi.

---

### **2. Nhóm tính năng lớn (Epic)**

Hệ thống 3HD2Kcinema được phân rã thành 4 Epic cốt lõi bao quát toàn bộ các tính năng từ cơ bản đến nâng cao:

* **Epic 1: Quản lý Tài khoản & Cá nhân hóa**  
  * Bao gồm các tính năng: đăng ký, đăng nhập, quản lý hồ sơ cá nhân, lịch sử giao dịch và tích lũy điểm thưởng thành viên.  
* **Epic 2: Tìm kiếm, Tra cứu tổng hợp & Chọn ghế (Aggregator & Real-time Seat Mapping)**  
  * Bao gồm các tính năng: xem danh sách phim đang/sắp chiếu, tra cứu cụm rạp đa hệ thống, bộ lọc lịch chiếu thông minh và thao tác trên sơ đồ ghế ngồi trực quan cập nhật trạng thái thời gian thực.  
* **Epic 3: Dịch vụ mở rộng & Thanh toán (Snack Booking & Payment Gateway)**  
  * Bao gồm các tính năng: đặt kèm F&B (bắp nước), thanh toán một chạm qua ví điện tử đa nền tảng và xuất vé điện tử QR Code tích hợp (hỗ trợ hiển thị ngoại tuyến).  
* **Epic 4: Tương tác xã hội & Quản trị rạp (Social Features & Admin Management)**  
  * Bao gồm các tính năng: Booking nhóm tự động chia hóa đơn (Split bill), đánh giá & bình luận phim sau khi xem, và trang quản trị (Admin Dashboard) quản lý suất chiếu/phòng chiếu.

---

### **3. Câu chuyện người dùng chi tiết (User Story)**

Dưới đây là danh sách các User Story quan trọng được triển khai từ 4 Epic trên, bám sát nhu cầu và mang lại giá trị cao nhất cho người dùng:

#### **Thuộc Epic 1 (Quản lý Tài khoản & Cá nhân hóa):**
* **US05:** Là khách vãng lai, tôi muốn đăng ký tài khoản và đăng nhập vào ứng dụng bằng email/mật khẩu, để lưu trữ lịch sử giao dịch và tích lũy điểm thưởng thành viên một cách an toàn.

#### **Thuộc Epic 2 (Tìm kiếm & Chọn ghế):**
* **US01:** Là một bạn trẻ bận rộn thường đi xem phim cuối tuần, tôi muốn tra cứu lịch chiếu, giá vé và thông tin phim trực quan, để tôi nhanh chóng chọn được suất chiếu phù hợp với thời gian và ngân sách của mình.  
* **US02:** Là một người kỹ tính khi đi xem phim rạp, tôi muốn thấy sơ đồ phòng chiếu trực quan theo thời gian thực và tự chọn vị trí ghế (Ghế thường, VIP hay Sweetbox), để tôi chắc chắn đặt được chỗ ngồi có góc nhìn đẹp nhất mà không lo bị trùng ghế với người khác.  

#### **Thuộc Epic 3 (Thanh toán & Dịch vụ F&B):**
* **US03:** Là một khách hàng yêu thích sự tiện lợi, tôi muốn chọn mua các gói combo bắp nước ưu đãi trực quan ngay trong quy trình checkout đặt vé, để tôi thanh toán trước và rút ngắn tối đa thời gian xếp hàng chờ đợi nhận đồ ăn tại quầy rạp.  
* **US04:** Là thành viên thích giao dịch nhanh gọn, tôi muốn thanh toán trực tuyến an toàn qua ví điện tử (MoMo/VNPAY) và nhận ngay vé điện tử QR Code tích hợp hiển thị ngoại tuyến, để hoàn tất quy trình giao dịch nhanh chóng và soát vé tiện lợi tại rạp mà không cần in vé giấy.

#### **Thuộc Epic 4 (Tương tác xã hội & Quản trị):**
* **US06:** Là một sinh viên thường đi xem phim chung với hội bạn thân, tôi muốn sử dụng tính năng "Booking Nhóm" (Split & Lock) để cùng chọn ghế và tự động chia đều hóa đơn khi thanh toán, để chúng tôi ngồi cạnh nhau mà không gặp cảnh ngại ngùng khi phải gom tiền thủ công.  
* **US07:** Là thành viên tích cực, tôi muốn gửi đánh giá sao và bình luận nhận xét về bộ phim sau khi xem xong; và là Admin, tôi muốn có giao diện quản lý phim, rạp và suất chiếu trực quan để điều phối hoạt động rạp chiếu hiệu quả.
