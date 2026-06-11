const heroMovies = [
    {
        title: "YOUR NAME - TÊN CẬU LÀ GÌ?",
        meta: "2016 • Anime, Tình Cảm • 1h 46m",
        desc: "Hai cô cậu học sinh trung học, một ở Tokyo sầm uất, một ở vùng quê hẻo lánh, bất ngờ bị hoán đổi cơ thể cho nhau trong giấc mơ. Từ đó, vô vàn rắc rối xen lẫn những rung động tinh khôi bắt đầu...",
        age: "T13",
        bg: "https://i.pinimg.com/736x/81/31/20/8131208cdb98026d71d3f89b8097c522.jpg"
    },
    {
        title: "BỘ TỨ BÁO THÙ",
        meta: "2024 • Hành Động, Viễn Tưởng • 2h 15m",
        desc: "Một nhóm anh hùng bất đắc dĩ phải hợp tác để ngăn chặn một thảm họa đe dọa toàn cầu. Những pha hành động nghẹt thở, kỹ xảo mãn nhãn và một cốt truyện đầy bất ngờ đang chờ đợi.",
        age: "C18",
        bg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80"
    },
    {
        title: "KẺ KIẾN TẠO",
        meta: "2024 • Khoa Học Viễn Tưởng • 2h 10m",
        desc: "Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền, một cựu đặc vụ phải thâm nhập vào sào huyệt của chúng để phá hủy thứ vũ khí tối thượng có khả năng hủy diệt nhân loại.",
        age: "T16",
        bg: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1920&q=80"
    },
    {
        title: "VƯƠNG QUỐC HÀNH TINH KHỈ",
        meta: "2024 • Phiêu Lưu, Hành Động • 2h 25m",
        desc: "Nhiều thế hệ sau kỷ nguyên của Caesar, loài khỉ vươn lên thành giống loài thống trị, trong khi con người phải lẩn trốn và sống trong sự kìm kẹp của đế chế khỉ bạo tàn.",
        age: "T13",
        bg: "https://photo.znews.vn/w660/Uploaded/rohunaa/2023_03_29/Weta_Digital_war_for_the_planet_1.jpg"
    },
    {
        title: "BATTLESHIP - CHIẾN HẠM",
        meta: "2012 • Hành Động, Viễn Tưởng • 2h 11m",
        desc: "Cuộc chiến khốc liệt trên biển khơi nổ ra khi hạm đội hải quân quốc tế bất ngờ chạm trán với một hạm đội tàu vũ trụ của người ngoài hành tinh mang dã tâm hủy diệt Trái Đất.",
        age: "T13",
        bg: "https://tintuc-divineshop.cdn.vccloud.vn/wp-content/uploads/2024/07/1-15.jpg"
    }
];

const nowShowingMovies = [
    {
        title: "Battle: Los Angeles (2011)",
        duration: "116 phút",
        age: "T16",
        tags: ["2D", "Hành Động"],
        formats: ["2D"],
        genre: "Hành Động",
        cinema: "Q1",
        poster: "../../shared/images/battle_la.jpg"
    },
    {
        title: "War Machine (2026)",
        duration: "120 phút",
        age: "T18",
        tags: ["2D", "Hành Động"],
        formats: ["2D", "4DX"],
        genre: "Hành Động",
        cinema: "Q7",
        poster: "../../shared/images/war_machine.jpg"
    },
    {
        title: "F1: The Movie (2025)",
        duration: "130 phút",
        age: "T16",
        tags: ["IMAX", "Hành Động"],
        formats: ["2D", "IMAX"],
        genre: "Hành Động",
        cinema: "Q1",
        poster: "../../shared/images/f1_movie.jpg"
    },
    {
        title: "Iron Man 2",
        duration: "124 phút",
        age: "T13",
        tags: ["2D", "Hành Động"],
        formats: ["2D", "IMAX"],
        genre: "Hành Động",
        cinema: "Q7",
        poster: "../../shared/images/iron_man2.jpg"
    }
];

const comingSoonMovies = [
    {
        title: "Gran Turismo",
        duration: "134 phút",
        age: "T13",
        genre: "Hành Động, Thể Thao",
        tags: ["IMAX", "Hành Động"],
        poster: "../../shared/images/Gran_Turismo.jpg"
    },
    {
        title: "World War Z",
        duration: "116 phút",
        age: "T16",
        genre: "Hành Động, Kinh Dị",
        tags: ["2D", "Hành Động"],
        poster: "../../shared/images/World_war_Z.jpg"
    },
    {
        title: "Moon Fall",
        duration: "130 phút",
        age: "T13",
        genre: "Hành Động, Viễn Tưởng",
        tags: ["2D", "Viễn Tưởng"],
        poster: "../../shared/images/Moon_Fall.jpg"
    },
    {
        title: "Your Name - Tên Cậu Là Gì?",
        duration: "106 phút",
        age: "T13",
        genre: "Anime, Tình Cảm",
        tags: ["2D"],
        poster: "https://upload.wikimedia.org/wikipedia/en/0/0b/Your_Name_poster.png"
    },
    {
        title: "Điệp Viên Siêu Đẳng",
        duration: "120 phút",
        age: "T13",
        genre: "Hành Động, Hài",
        tags: ["2D", "IMAX"],
        poster: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a3aaf?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Khu Rừng Kỳ Diệu",
        duration: "95 phút",
        age: "P",
        genre: "Hoạt Hình, Phiêu Lưu",
        tags: ["2D", "3D"],
        poster: "https://images.unsplash.com/photo-1440581572325-0bea30075d9d?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Chuyện Tình Mùa Thu",
        duration: "112 phút",
        age: "T16",
        genre: "Tình Cảm, Tâm Lý",
        tags: ["2D"],
        poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Battleship - Chiến Hạm",
        duration: "131 phút",
        age: "T13",
        genre: "Hành Động, Viễn Tưởng",
        tags: ["2D", "IMAX"],
        poster: "https://tintuc-divineshop.cdn.vccloud.vn/wp-content/uploads/2024/07/1-15.jpg"
    },
    {
        title: "2012: Thảm Họa Toàn Cầu",
        duration: "158 phút",
        age: "T13",
        genre: "Hành Động, Phiêu Lưu",
        tags: ["2D"],
        poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80"
    }
];

const cinemas = [
    {
        id: "ha-dong",
        name: "3HD2K HÀ ĐÔNG",
        distance: "0.5 KM",
        address: "Tầng 5, AEON Mall Hà Đông, Dương Nội, Quận Hà Đông, Hà Nội",
        screens: 9,
        features: ["IMAX", "4DX", "Dolby Atmos"],
        lat: 20.9745,
        lng: 105.7455
    },
    {
        id: "le-trong-tan",
        name: "3HD2K LÊ TRỌNG TẤN",
        distance: "2.1 KM",
        address: "Tầng 4, Trung tâm TM Hồ Gươm Plaza, 102 Trần Phú, Quận Hà Đông, Hà Nội",
        screens: 7,
        features: ["Dolby Atmos", "ScreenX"],
        lat: 20.9720,
        lng: 105.7830
    },
    {
        id: "my-dinh",
        name: "3HD2K MỸ ĐÌNH",
        distance: "5.3 KM",
        address: "Tầng 6, The Garden Shopping Center, Mễ Trì, Quận Nam Từ Liêm, Hà Nội",
        screens: 8,
        features: ["IMAX", "4DX"],
        lat: 21.0170,
        lng: 105.7780
    },
    {
        id: "royal-city",
        name: "3HD2K ROYAL CITY",
        distance: "7.8 KM",
        address: "Tầng B2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
        screens: 10,
        features: ["IMAX", "Dolby Atmos", "4DX"],
        lat: 21.0020,
        lng: 105.8148
    },
    {
        id: "cau-giay",
        name: "3HD2K CẦU GIẤY",
        distance: "2.8 KM",
        address: "Tầng 6, Indochina Plaza, 241 Xuân Thủy, Quận Cầu Giấy, Hà Nội",
        screens: 8,
        features: ["IMAX", "Dolby Atmos"],
        lat: 21.0365,
        lng: 105.7980
    },
    {
        id: "lang-ha",
        name: "3HD2K LÁNG HẠ",
        distance: "1.7 KM",
        address: "Tầng 4, M5 Tower, 91 Nguyễn Chí Thanh, Quận Đống Đa, Hà Nội",
        screens: 6,
        features: ["4DX", "Dolby Atmos"],
        lat: 21.0180,
        lng: 105.8080
    }
];
