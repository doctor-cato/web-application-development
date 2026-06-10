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
        title: "Biệt Đội Đánh Thuê 4",
        duration: "123 phút",
        age: "T16",
        tags: ["2D", "Hành Động"],
        formats: ["2D"],
        genre: "Hành Động",
        cinema: "Q1",
        poster: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Ác Quỷ Ma Sơ II",
        duration: "110 phút",
        age: "T18",
        tags: ["2D", "4DX", "Kinh Dị"],
        formats: ["2D", "4DX"],
        genre: "Kinh Dị",
        cinema: "Q7",
        poster: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Dune: Phần Hai",
        duration: "166 phút",
        age: "T16",
        tags: ["IMAX", "Viễn Tưởng"],
        formats: ["2D", "IMAX"],
        genre: "Viễn Tưởng",
        cinema: "Q1",
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Kẻ Độc Hành",
        duration: "105 phút",
        age: "T18",
        tags: ["2D", "Hành Động"],
        formats: ["2D"],
        genre: "Hành Động",
        cinema: "Q7",
        poster: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80"
    }
];

const comingSoonMovies = [
    {
        title: "Kingdom of the Planet of the Apes",
        duration: "145 phút",
        age: "T13",
        genre: "Phiêu Lưu, Hành Động",
        tags: ["IMAX", "4DX"],
        poster: "https://images.unsplash.com/photo-1611419010196-18e3e18f8a4c?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Furiosa: A Mad Max Saga",
        duration: "148 phút",
        age: "T18",
        genre: "Hành Động, Phiêu Lưu",
        tags: ["IMAX"],
        poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Deadpool & Wolverine",
        duration: "128 phút",
        age: "T16",
        genre: "Hành Động, Hài",
        tags: ["2D", "IMAX"],
        poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=400&q=80"
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
        id: "district-1",
        name: "3HD2K DISTRICT 1",
        distance: "0.8 KM",
        address: "Tầng 5, Saigon Center, 65 Lê Lợi, Phường Bến Nghé, Quận 1",
        screens: 8,
        features: ["IMAX", "4DX", "Dolby Atmos"],
        lat: 10.7725,
        lng: 106.7010
    },
    {
        id: "landmark",
        name: "3HD2K LANDMARK",
        distance: "2.4 KM",
        address: "Vincom Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh",
        screens: 10,
        features: ["IMAX", "Dolby Atmos", "ScreenX"],
        lat: 10.7952,
        lng: 106.7219
    },
    {
        id: "district-7",
        name: "3HD2K DISTRICT 7",
        distance: "4.1 KM",
        address: "Crescent Mall Phase 2, 101 Tôn Dật Tiên, Phường Tân Phú, Quận 7",
        screens: 6,
        features: ["4DX", "Dolby Atmos"],
        lat: 10.7295,
        lng: 106.7186
    },
    {
        id: "thao-dien",
        name: "3HD2K THẢO ĐIỀN",
        distance: "5.8 KM",
        address: "Vincom Mega Mall, 161 Võ Nguyên Giáp, Phường Thảo Điền, TP. Thủ Đức",
        screens: 7,
        features: ["IMAX", "4DX"],
        lat: 10.8031,
        lng: 106.7374
    }
];
