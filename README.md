I, Web Ứng dụng Tìm đường đi ngắn nhất trong Khuôn viên

Đây là một ứng dụng web mô phỏng tìm đường đi ngắn nhất (Shortest Path) trong khuôn viên trường đại học/khu vực giới hạn, sử dụng các thuật toán cơ bản của Lý thuyết Đồ thị.

Ứng dụng được xây dựng hoàn toàn bằng **HTML, CSS, và JavaScript** (không cần backend), lý tưởng để triển khai (deploy) ngay lập tức trên **GitHub Pages**.

II, Tính năng chính

1.  **Vẽ & Mô phỏng Bản đồ:** Sử dụng Canvas để trực quan hóa bản đồ (đồ thị).
2.  **Tìm đường đi ngắn nhất:** Áp dụng **thuật toán Dijkstra** để tìm đường giữa hai điểm.
3.  **Duyệt đồ thị:** Hỗ trợ trực quan hóa quá trình duyệt theo **BFS** và **DFS**.
4.  **Kiểm tra tính chất:** Kiểm tra đồ thị có phải là **đồ thị 2 phía (Bipartite Graph)** hay không.
5.  **Chuyển đổi biểu diễn:** Hiển thị dữ liệu đồ thị dưới dạng **Ma trận kề, Danh sách kề,** và **Danh sách cạnh**.
6.  **Lưu trữ:** Lưu bản đồ (cấu trúc đồ thị) dưới định dạng **JSON**.

III, Hướng dẫn sử dụng

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/YourUsername/your-repo-name.git](https://github.com/YourUsername/your-repo-name.git)
    cd campus-pathfinder
    ```
2.  **Mở ứng dụng:** Mở tệp `index.html` trong trình duyệt của bạn.

IV, Triển khai trên GitHub Pages

Vì không có backend, bạn chỉ cần bật tính năng GitHub Pages:

1.  Trong repository của bạn, vào mục **Settings**.
2.  Chọn **Pages** ở thanh bên trái.
3.  Trong phần "Source", chọn nhánh (`main` hoặc `master`) và chọn thư mục gốc (`/`).
4.  Nhấn **Save**.

Sau vài phút, ứng dụng sẽ hoạt động tại đường dẫn: `https://YourUsername.github.io/your-repo-name/`
