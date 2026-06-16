import re

path = r'c:\Users\PC KHANH\web-application-development\src\engagement\minigame\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

cards_html = '''
                <!-- CARD 4 -->
                <div class="pool-card" data-movie="cyber-core">
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

                <!-- CARD 5 -->
                <div class="pool-card" data-movie="laugh-riot">
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
                            <button class="option-btn" data-option="Kỷ lục">Kỷ lục</button>
                            <button class="option-btn" data-option="Bình thường">Bình thường</button>
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: 40 Điểm</span>
                            <button class="btn-bet-action">DỰ ĐOÁN</button>
                        </div>
                    </div>
                </div>
            </div>
'''

content = content.replace('            </div>\n        </main>', cards_html + '        </main>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Appended cards')
