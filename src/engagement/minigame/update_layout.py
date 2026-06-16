import re

html_path = r'c:\Users\PC KHANH\web-application-development\src\engagement\minigame\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_content = '''            <div class="section-header-row">
                <h2 class="section-title">SỰ KIỆN ĐANG DIỄN RA</h2>
                <span class="live-indicator"><span class="pulse-dot"></span> MỞ DỰ ĐOÁN</span>
            </div>

            <div class="pools-grid">
                <!-- CARD 1 -->
                <div class="pool-card">
                    <span class="card-badge hot" style="background-color: #f5c518; color: #000;">IMDb</span>
                    <div class="card-image" style="background-image: url('../../engagement/minigame/images/imdb_bg.png')"></div>
                    <div class="card-content">
                        <h3>ĐIỂM SỐ IMDB</h3>
                        <p class="card-description">Dự đoán điểm số IMDb của bom tấn 'The Neon Night' sau tuần công chiếu đầu tiên.</p>
                        <div class="reward-box">
                            <span class="reward-label">PHẦN THƯỞNG</span>
                            <span class="reward-value">Voucher Bỏng ngô Lớn</span>
                        </div>
                        <div class="options-row">
                            <button class="option-btn" data-option="Cao hơn 8.0">Trên 8.0 ↑</button>
                            <button class="option-btn" data-option="Thấp hơn 8.0">Dưới 8.0 ↓</button>
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: 50 Điểm</span>
                            <button class="btn-bet-action">DỰ ĐOÁN</button>
                        </div>
                    </div>
                </div>

                <!-- CARD 2 -->
                <div class="pool-card">
                    <span class="card-badge standard" style="background-color: #22c55e; color: #fff;">Doanh Thu</span>
                    <div class="card-image" style="background-image: url('../../engagement/minigame/images/box_office_bg.png')"></div>
                    <div class="card-content">
                        <h3>DOANH THU MỞ MÀN</h3>
                        <p class="card-description">Phim có vượt mốc 50 triệu USD doanh thu phòng vé toàn cầu trong tuần đầu ra mắt không?</p>
                        <div class="reward-box">
                            <span class="reward-label">PHẦN THƯỞNG</span>
                            <span class="reward-value">Voucher Đồ uống</span>
                        </div>
                        <div class="options-row">
                            <button class="option-btn" data-option="Trên 50M">Trên 50 Triệu</button>
                            <button class="option-btn" data-option="Dưới 50M">Dưới 50 Triệu</button>
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: 50 Điểm</span>
                            <button class="btn-bet-action">DỰ ĐOÁN</button>
                        </div>
                    </div>
                </div>

                <!-- CARD 4 -->
                <div class="pool-card">
                    <span class="card-badge expert" style="background-color: #f5c518; color: #000;">IMDb</span>
                    <div class="card-image" style="background-image: url('../../engagement/minigame/images/imdb_bg.png')"></div>
                    <div class="card-content">
                        <h3>IMDB: CYBER CORE</h3>
                        <p class="card-description">Đánh giá về kỹ xảo của Cyber Core đang cực kỳ khả quan, điểm IMDb có vượt 8.5?</p>
                        <div class="reward-box">
                            <span class="reward-label">PHẦN THƯỞNG</span>
                            <span class="reward-value">Voucher Đồ uống</span>
                        </div>
                        <div class="options-row">
                            <button class="option-btn" data-option="Trên 8.5">Trên 8.5 ↑</button>
                            <button class="option-btn" data-option="Dưới 8.5">Dưới 8.5 ↓</button>
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: 50 Điểm</span>
                            <button class="btn-bet-action">DỰ ĐOÁN</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-divider" style="margin: 60px 0 40px; border-top: 1px solid rgba(255,255,255,0.1);"></div>

            <div class="section-header-row ended">
                <h2 class="section-title" style="color: #9ca3af;">SỰ KIỆN ĐÃ KẾT THÚC</h2>
                <span class="live-indicator" style="color: #9ca3af; border-color: rgba(156, 163, 175, 0.3);"><span class="pulse-dot" style="background-color: #9ca3af; animation: none; box-shadow: none;"></span> ĐÃ ĐÓNG</span>
            </div>

            <div class="pools-grid">
                <!-- CARD 3 (ENDED) -->
                <div class="pool-card ended-card">
                    <span class="card-badge expert" style="background-color: #ef4444; color: #fff;">Cà Chua Tươi</span>
                    <div class="card-image" style="background-image: url('../../engagement/minigame/images/rotten_tomatoes_bg.png')"></div>
                    <div class="card-content">
                        <h3>ĐIỂM ROTTEN TOMATOES</h3>
                        <p class="card-description">Dự đoán tỷ lệ đánh giá tích cực của giới phê bình (Tomatometer) có đạt chứng nhận Cà Chua Tươi?</p>
                        <div class="reward-box">
                            <span class="reward-label">PHẦN THƯỞNG</span>
                            <span class="reward-value">Voucher Combo</span>
                        </div>
                        <div class="options-row">
                            <button class="option-btn disabled winner" data-option="Trên 85%">Trên 85% (KẾT QUẢ)</button>
                            <button class="option-btn disabled" data-option="Dưới 85%">Dưới 85%</button>
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: 75 Điểm</span>
                            <button class="btn-bet-action disabled">ĐÃ TRẢ THƯỞNG</button>
                        </div>
                    </div>
                </div>

                <!-- CARD 5 (ENDED) -->
                <div class="pool-card ended-card">
                    <span class="card-badge standard" style="background-color: #22c55e; color: #fff;">Doanh Thu</span>
                    <div class="card-image" style="background-image: url('../../engagement/minigame/images/box_office_bg.png')"></div>
                    <div class="card-content">
                        <h3>DOANH THU: LAUGH RIOT</h3>
                        <p class="card-description">Bộ phim hài này có lập kỷ lục doanh thu phòng vé dịp cuối tuần không?</p>
                        <div class="reward-box">
                            <span class="reward-label">PHẦN THƯỞNG</span>
                            <span class="reward-value">Voucher Combo</span>
                        </div>
                        <div class="options-row">
                            <button class="option-btn disabled" data-option="Kỷ lục">Kỷ lục</button>
                            <button class="option-btn disabled winner" data-option="Bình thường">Bình thường (KẾT QUẢ)</button>
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: 40 Điểm</span>
                            <button class="btn-bet-action disabled">ĐÃ TRẢ THƯỞNG</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>'''

start_marker = '<div class="section-header-row">'
end_marker = '</main>'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker) + len(end_marker)

html = html[:start_idx] + new_content + html[end_idx:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
