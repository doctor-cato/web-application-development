// ============================================================
//  3HD2K — DATA STORE
//  Tất cả dữ liệu phim, rạp và suất chiếu mẫu
// ============================================================

// ── HERO SLIDESHOW ──────────────────────────────────────────
const heroMovies = [
    {
        id: "your-name",
        title: "YOUR NAME - TÊN CẬU LÀ GÌ?",
        meta: "2016 • Anime, Tình Cảm • 1h 46m",
        desc: "Hai cô cậu học sinh trung học, một ở Tokyo sầm uất, một ở vùng quê hẻo lánh, bất ngờ bị hoán đổi cơ thể cho nhau trong giấc mơ. Từ đó, vô vàn rắc rối xen lẫn những rung động tinh khôi bắt đầu...",
        age: "T13",
        trailer: "https://www.youtube.com/embed/k4xGqY5IDBE",
        trailerWatch: "https://www.youtube.com/watch?v=k4xGqY5IDBE",
        bg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnSURswrgKGgY2hE8cwABvIHXJk9Y0naYN1cN4w6Tf0aJ9kEsgSgGrGtBaxhyphenhyphenqRQ4GcTJaHELDx2G0rlx6mrulOu2f_tSKEoJo4IVXFjwBFC8RYrT-V9mFRxLPw_W8qFCcjOz-lmYdl9wr/s1600/742320.jpg"
    },
    {
        id: "ready-player-one",
        title: "READY PLAYER ONE",
        meta: "2018 • Hành Động, Viễn Tưởng • 2h 20m",
        desc: "Lấy bối cảnh năm 2045, thế giới thực đang trên đà sụp đổ, con người tìm thấy sự cứu rỗi trong OASIS - một vũ trụ ảo khổng lồ. Một cuộc truy tìm Trứng Phục Sinh vĩ đại bắt đầu.",
        age: "T13",
        trailer: "https://www.youtube.com/embed/1hrwbc5qCZ4",
        trailerWatch: "https://www.youtube.com/watch?v=1hrwbc5qCZ4",
        bg: "images/Ready_Player_One.jpg"
    },
    {
        id: "ke-kien-tao",
        title: "KẺ KIẾN TẠO",
        meta: "2024 • Khoa Học Viễn Tưởng • 2h 10m",
        desc: "Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền, một cựu đặc vụ phải thâm nhập vào sào huyệt của chúng để phá hủy thứ vũ khí tối thượng có khả năng hủy diệt nhân loại.",
        age: "T16",
        trailer: "https://www.youtube.com/embed/ex3C1-5Dhb8",
        trailerWatch: "https://www.youtube.com/watch?v=ex3C1-5Dhb8",
        bg: "images/Ke_Kien_Tao_2.jpg"
    },
    {
        id: "vuong-quoc-hanh-tinh-khi",
        title: "VƯƠNG QUỐC HÀNH TINH KHỈ",
        meta: "2024 • Phiêu Lưu, Hành Động • 2h 25m",
        desc: "Nhiều thế hệ sau kỷ nguyên của Caesar, loài khỉ vươn lên thành giống loài thống trị, trong khi con người phải lẩn trốn và sống trong sự kìm kẹp của đế chế khỉ bạo tàn.",
        age: "T13",
        trailer: "https://www.youtube.com/embed/8ZFsTMe9JDw",
        trailerWatch: "https://www.youtube.com/watch?v=8ZFsTMe9JDw",
        bg: "https://photo.znews.vn/w660/Uploaded/rohunaa/2023_03_29/Weta_Digital_war_for_the_planet_1.jpg"
    },
    {
        id: "battleship",
        title: "BATTLESHIP - CHIẾN HẠM",
        meta: "2012 • Hành Động, Viễn Tưởng • 2h 11m",
        desc: "Cuộc chiến khốc liệt trên biển khơi nổ ra khi hạm đội hải quân quốc tế bất ngờ chạm trán với một hạm đội tàu vũ trụ của người ngoài hành tinh mang dã tâm hủy diệt Trái Đất.",
        age: "T13",
        trailer: "https://www.youtube.com/embed/lIhPnMhEVvo",
        trailerWatch: "https://www.youtube.com/watch?v=lIhPnMhEVvo",
        bg: "https://tintuc-divineshop.cdn.vccloud.vn/wp-content/uploads/2024/07/1-15.jpg"
    }
];

// ── NOW SHOWING ──────────────────────────────────────────────
const nowShowingMovies = [
    {
        id: "battle-los-angeles",
        title: "Battle: Los Angeles",
        titleEn: "Battle: Los Angeles",
        year: 2011,
        duration: "116 phút",
        age: "T16",
        tags: ["2D", "Hành Động"],
        formats: ["2D"],
        genre: "Hành Động, Khoa Học Viễn Tưởng",
        cinema: "Q1",
        poster: "images/battle_la.jpg",
        backdrop: "https://occ-0-8407-116.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABUqJNDbTjtk_ks55Cn2DDKJr-2oU_AzL7yvpcMhg4FFX75qGsJhbhIIWzGkFdQmEBzCxAYuWcRmrfSIH4f7DLh5HCK9haTZHUsxw.jpg?r=10a",
        synopsis: "Một đội thủy quân lục chiến Mỹ đang chiến đấu chống lại cuộc xâm lược của người ngoài hành tinh tại Los Angeles. Trung sĩ Nantz phải dẫn đầu một nhóm binh lính vào vùng chiến sự để giải cứu những thường dân còn sống sót trước khi không quân tiến hành ném bom hủy diệt toàn bộ khu vực.",
        director: "Jonathan Liebesman",
        cast: [
            { name: "Aaron Eckhart", avatar: "https://i.pravatar.cc/80?img=11" },
            { name: "Michelle Rodriguez", avatar: "https://i.pravatar.cc/80?img=21" },
            { name: "Ramón Rodríguez", avatar: "https://i.pravatar.cc/80?img=13" },
            { name: "Bridget Moynahan", avatar: "https://i.pravatar.cc/80?img=47" }
        ],
        releaseDate: "25/03/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt",
        rating: 5.9,
        ratingCount: 2841,
        trailer: "https://www.youtube.com/embed/Yt7ofokzn04",
        trailerWatch: "https://www.youtube.com/watch?v=Yt7ofokzn04",
        gallery: [
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "war-machine",
        title: "War Machine",
        titleEn: "War Machine",
        year: 2026,
        duration: "120 phút",
        age: "T18",
        tags: ["2D", "Hành Động"],
        formats: ["2D", "4DX"],
        genre: "Hành Động, Phiêu Lưu",
        cinema: "Q7",
        poster: "images/war_machine.jpg",
        backdrop: "https://static.wikia.nocookie.net/robotics/images/9/93/The_Machine_%28War_Machine_2026%29.webp/revision/latest?cb=20260405000634",
        synopsis: "Trong một thế giới tương lai nơi robot chiến đấu thống trị chiến trường, một cựu chiến binh phải đối mặt với kẻ thù nguy hiểm nhất của mình — chính cỗ máy chiến tranh anh ta từng tin tưởng. Cuộc hành trình đầy hiểm nguy đưa anh xuyên qua những vùng xung đột tàn khốc để tìm lại nhân tính đã bị chiến tranh cướp mất.",
        director: "David Ayer",
        cast: [
            { name: "Liam Neeson", avatar: "https://i.pravatar.cc/80?img=51" },
            { name: "Emily Blunt", avatar: "https://i.pravatar.cc/80?img=25" },
            { name: "Chris Hemsworth", avatar: "https://i.pravatar.cc/80?img=15" },
            { name: "Zoe Saldana", avatar: "https://i.pravatar.cc/80?img=32" }
        ],
        releaseDate: "12/06/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt / Lồng tiếng",
        rating: 7.2,
        ratingCount: 1203,
        trailer: "https://www.youtube.com/embed/JESc8YBonFc",
        trailerWatch: "https://www.youtube.com/watch?v=JESc8YBonFc",
        gallery: [
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "f1-the-movie",
        title: "F1: The Movie",
        titleEn: "F1: The Movie",
        year: 2025,
        duration: "130 phút",
        age: "T16",
        tags: ["IMAX", "Hành Động"],
        formats: ["2D", "IMAX"],
        genre: "Hành Động, Thể Thao",
        cinema: "Q1",
        poster: "images/f1_movie.jpg",
        backdrop: "https://www.f1themovie.com/images/share.jpg",
        synopsis: "Dựa trên câu chuyện có thật về đội đua APXGP, một tay đua huyền thoại đã về hưu trở lại đường đua F1 để hướng dẫn một tài năng trẻ đầy tiềm năng. Hai thế hệ tay đua cùng nhau đối mặt với những áp lực khắc nghiệt nhất của môn thể thao vua tốc độ.",
        director: "Joseph Kosinski",
        cast: [
            { name: "Brad Pitt", avatar: "https://i.pravatar.cc/80?img=53" },
            { name: "Damson Idris", avatar: "https://i.pravatar.cc/80?img=17" },
            { name: "Kerry Condon", avatar: "https://i.pravatar.cc/80?img=23" },
            { name: "Javier Bardem", avatar: "https://i.pravatar.cc/80?img=60" }
        ],
        releaseDate: "27/06/2025",
        language: "Tiếng Anh - Phụ đề Tiếng Việt",
        rating: 8.1,
        ratingCount: 5672,
        trailer: "https://www.youtube.com/embed/hnhvlfa9nKg",
        trailerWatch: "https://www.youtube.com/watch?v=hnhvlfa9nKg",
        gallery: [
            "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "iron-man-2",
        title: "Iron Man 2",
        titleEn: "Iron Man 2",
        year: 2010,
        duration: "124 phút",
        age: "T13",
        tags: ["2D", "Hành Động"],
        formats: ["2D", "IMAX"],
        genre: "Hành Động, Khoa Học Viễn Tưởng",
        cinema: "Q7",
        poster: "images/iron_man2.jpg",
        backdrop: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsctNLtFojtCkZzlqWDF2MrPaFh3ths_qT4w&s",
        synopsis: "Tony Stark đang đối mặt với hai mối đe dọa lớn: chính phủ muốn tịch thu bộ giáp Iron Man và một kẻ thù bí ẩn đến từ Nga mang mối hận thù sâu sắc. Trong khi đó, bộ giáp dần phá hủy cơ thể anh từ bên trong.",
        director: "Jon Favreau",
        cast: [
            { name: "Robert Downey Jr.", avatar: "https://i.pravatar.cc/80?img=57" },
            { name: "Gwyneth Paltrow", avatar: "https://i.pravatar.cc/80?img=44" },
            { name: "Scarlett Johansson", avatar: "https://i.pravatar.cc/80?img=26" },
            { name: "Mickey Rourke", avatar: "https://i.pravatar.cc/80?img=62" }
        ],
        releaseDate: "07/05/2010",
        language: "Tiếng Anh - Phụ đề Tiếng Việt / Lồng tiếng",
        rating: 7.0,
        ratingCount: 18432,
        trailer: "https://www.youtube.com/embed/qsRZghNciIo",
        trailerWatch: "https://www.youtube.com/watch?v=qsRZghNciIo",
        gallery: [
            "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80"
        ]
    }
];

// ── COMING SOON ──────────────────────────────────────────────
const comingSoonMovies = [
    {
        id: "gran-turismo",
        title: "Gran Turismo - Tay Đua Cự Phách",
        titleEn: "Gran Turismo",
        year: 2023,
        duration: "134 phút",
        age: "T13",
        genre: "Hành Động, Thể Thao",
        tags: ["IMAX", "Hành Động"],
        formats: ["2D", "IMAX"],
        poster: "images/Gran_Turismo.jpg",
        backdrop: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80",
        synopsis: "Dựa trên câu chuyện có thật của Jann Mardenborough — một game thủ Gran Turismo đã biến giấc mơ thành hiện thực khi trở thành tay đua chuyên nghiệp sau khi thắng chương trình GT Academy. Hành trình đầy gian truân từ màn hình game đến đường đua thực sự.",
        director: "Neill Blomkamp",
        cast: [
            { name: "Archie Madekwe", avatar: "https://i.pravatar.cc/80?img=8" },
            { name: "David Harbour", avatar: "https://i.pravatar.cc/80?img=52" },
            { name: "Orlando Bloom", avatar: "https://i.pravatar.cc/80?img=18" },
            { name: "Djimon Hounsou", avatar: "https://i.pravatar.cc/80?img=54" }
        ],
        releaseDate: "15/08/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt",
        rating: 7.3,
        ratingCount: 8921,
        trailer: "https://www.youtube.com/embed/GBuElSi_t-U",
        trailerWatch: "https://www.youtube.com/watch?v=GBuElSi_t-U",
        gallery: [
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "world-war-z",
        title: "World War Z - Thế Chiến Z",
        titleEn: "World War Z",
        year: 2013,
        duration: "116 phút",
        age: "T16",
        genre: "Hành Động, Kinh Dị",
        tags: ["2D", "Hành Động"],
        formats: ["2D"],
        poster: "https://m.media-amazon.com/images/M/MV5BODg3ZTM2YWQtZDE5Ny00NGNiLTkzYjgtYWVlYjNkOTg5NDI1XkEyXkFqcGc@.jpg",
        backdrop: "https://www.dneg.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F3sjsytt3tkv5%2F4WVPfAXZejqcLCDeRxphuJ%2Fed8e2c89c611d9f77547484c89a36858%2Fworld-war-z-game.jpeg&w=3840&q=75",
        synopsis: "Gerry Lane, cựu điều tra viên Liên Hợp Quốc, phải lên đường vòng quanh thế giới để tìm cách chống lại đại dịch zombie đang bùng phát với tốc độ kinh hoàng, đe dọa xóa sổ toàn bộ nhân loại.",
        director: "Marc Forster",
        cast: [
            { name: "Brad Pitt", avatar: "https://i.pravatar.cc/80?img=53" },
            { name: "Mireille Enos", avatar: "https://i.pravatar.cc/80?img=41" },
            { name: "James Badge Dale", avatar: "https://i.pravatar.cc/80?img=19" },
            { name: "Daniella Kertesz", avatar: "https://i.pravatar.cc/80?img=35" }
        ],
        releaseDate: "20/07/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt",
        rating: 7.0,
        ratingCount: 12305,
        trailer: "https://www.youtube.com/embed/4EC7P5WdUko",
        trailerWatch: "https://www.youtube.com/watch?v=4EC7P5WdUko",
        gallery: [
            "https://images.unsplash.com/photo-1512358958502-3f4af0dda77d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "moon-fall",
        title: "Moon Fall - Trăng Rơi",
        titleEn: "Moonfall",
        year: 2022,
        duration: "130 phút",
        age: "T13",
        genre: "Hành Động, Viễn Tưởng",
        tags: ["2D", "Viễn Tưởng"],
        formats: ["2D"],
        poster: "images/Moon_Fall.jpg",
        backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80",
        synopsis: "Mặt trăng đang trên đà va chạm với Trái Đất, và chỉ có ba người — hai cựu phi hành gia và một nhà thiên văn học nghiệp dư — có thể tìm ra sự thật đằng sau thảm họa vũ trụ và cứu lấy nhân loại.",
        director: "Roland Emmerich",
        cast: [
            { name: "Halle Berry", avatar: "https://i.pravatar.cc/80?img=27" },
            { name: "Patrick Wilson", avatar: "https://i.pravatar.cc/80?img=56" },
            { name: "John Bradley", avatar: "https://i.pravatar.cc/80?img=22" },
            { name: "Michael Peña", avatar: "https://i.pravatar.cc/80?img=14" }
        ],
        releaseDate: "04/08/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt",
        rating: 5.2,
        ratingCount: 7413,
        trailer: "https://www.youtube.com/embed/DzHqxgcY5Io",
        trailerWatch: "https://www.youtube.com/watch?v=DzHqxgcY5Io",
        gallery: [
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "your-name",
        title: "Your Name - Tên Cậu Là Gì?",
        titleEn: "Kimi no Na wa",
        year: 2016,
        duration: "106 phút",
        age: "T13",
        genre: "Anime, Tình Cảm",
        tags: ["2D", "Anime"],
        formats: ["2D"],
        poster: "images/Kimi-no-Na-wa.-Visual.jpg",
        backdrop: "https://cdn.sforum.vn/sforum/wp-content/uploads/2022/05/1-16.jpg",
        synopsis: "Mitsuha, một cô gái sống ở vùng quê hẻo lánh, và Taki, một cậu trai ở Tokyo náo nhiệt, bỗng nhiên hoán đổi cơ thể cho nhau khi ngủ. Khi họ tìm cách liên lạc và gặp nhau, họ khám phá ra một bí mật về thời gian vượt ngoài sức tưởng tượng.",
        director: "Makoto Shinkai",
        cast: [
            { name: "Ryunosuke Kamiki", avatar: "https://i.pravatar.cc/80?img=5" },
            { name: "Mone Kamishiraishi", avatar: "https://i.pravatar.cc/80?img=29" },
            { name: "Masami Nagasawa", avatar: "https://i.pravatar.cc/80?img=33" },
            { name: "Nobunaga Shimazaki", avatar: "https://i.pravatar.cc/80?img=7" }
        ],
        releaseDate: "22/08/2026",
        language: "Tiếng Nhật - Phụ đề Tiếng Việt",
        rating: 8.4,
        ratingCount: 32150,
        trailer: "https://www.youtube.com/embed/k4xGqY5IDBE",
        trailerWatch: "https://www.youtube.com/watch?v=k4xGqY5IDBE",
        gallery: [
            "https://images.unsplash.com/photo-1580655653885-65763b2597d1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "diep-vien-sieu-dang",
        title: "Điệp Viên Siêu Đẳng",
        titleEn: "Super Spy",
        year: 2026,
        duration: "120 phút",
        age: "T13",
        genre: "Hành Động, Hài",
        tags: ["2D", "IMAX"],
        formats: ["2D", "IMAX"],
        poster: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a3aaf?auto=format&fit=crop&w=400&q=80",
        backdrop: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80",
        synopsis: "Một điệp viên vụng về nhất cục tình báo bất ngờ được giao nhiệm vụ bảo vệ nhân chứng quan trọng nhất thế kỷ. Hành trình hài hước, hồi hộp và đầy bất ngờ bắt đầu khi mọi thứ đều đi sai kế hoạch.",
        director: "James Wan",
        cast: [
            { name: "Kevin Hart", avatar: "https://i.pravatar.cc/80?img=4" },
            { name: "Dwayne Johnson", avatar: "https://i.pravatar.cc/80?img=58" },
            { name: "Gal Gadot", avatar: "https://i.pravatar.cc/80?img=30" },
            { name: "Ryan Reynolds", avatar: "https://i.pravatar.cc/80?img=16" }
        ],
        releaseDate: "10/09/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt / Lồng tiếng",
        rating: 6.8,
        ratingCount: 892,
        trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        trailerWatch: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        gallery: [
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "khu-rung-ky-dieu",
        title: "Khu Rừng Kỳ Diệu",
        titleEn: "The Magic Forest",
        year: 2026,
        duration: "95 phút",
        age: "P",
        genre: "Hoạt Hình, Phiêu Lưu",
        tags: ["2D", "3D"],
        formats: ["2D", "3D"],
        poster: "https://images.unsplash.com/photo-1440581572325-0bea30075d9d?auto=format&fit=crop&w=400&q=80",
        backdrop: "https://images.unsplash.com/photo-1440581572325-0bea30075d9d?auto=format&fit=crop&w=1920&q=80",
        synopsis: "Một cậu bé lạc vào khu rừng kỳ diệu nơi muôn vật đều biết nói chuyện. Cùng những người bạn mới, cậu phải hoàn thành sứ mệnh giải cứu khu rừng khỏi bóng tối đang bao phủ trước khi quá muộn.",
        director: "Pixar Animation",
        cast: [
            { name: "Tom Hanks", avatar: "https://i.pravatar.cc/80?img=59" },
            { name: "Cate Blanchett", avatar: "https://i.pravatar.cc/80?img=43" },
            { name: "Idris Elba", avatar: "https://i.pravatar.cc/80?img=3" },
            { name: "Emma Stone", avatar: "https://i.pravatar.cc/80?img=36" }
        ],
        releaseDate: "01/10/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt / Lồng tiếng",
        rating: 8.5,
        ratingCount: 421,
        trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        trailerWatch: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        gallery: [
            "https://images.unsplash.com/photo-1440581572325-0bea30075d9d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526748373434-89a8e2dd7b4c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1495556650867-99590cea3592?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "chuyen-tinh-mua-thu",
        title: "Chuyện Tình Mùa Thu",
        titleEn: "Autumn Love Story",
        year: 2026,
        duration: "112 phút",
        age: "T16",
        genre: "Tình Cảm, Tâm Lý",
        tags: ["2D"],
        formats: ["2D"],
        poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        backdrop: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=80",
        synopsis: "Một câu chuyện tình yêu đẹp và đau lòng của hai người trẻ gặp nhau trong mùa thu vàng. Khi hai thế giới hoàn toàn khác biệt chạm nhau, họ phải chọn lựa giữa trái tim và lý trí.",
        director: "Park Chan-wook",
        cast: [
            { name: "Song Joong-ki", avatar: "https://i.pravatar.cc/80?img=6" },
            { name: "Song Hye-kyo", avatar: "https://i.pravatar.cc/80?img=48" },
            { name: "Park Seo-joon", avatar: "https://i.pravatar.cc/80?img=9" },
            { name: "IU", avatar: "https://i.pravatar.cc/80?img=39" }
        ],
        releaseDate: "15/10/2026",
        language: "Tiếng Hàn - Phụ đề Tiếng Việt",
        rating: 8.0,
        ratingCount: 234,
        trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        trailerWatch: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        gallery: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520411219547-9e5b86c6d2d1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "battleship",
        title: "Battleship - Chiến Hạm",
        titleEn: "Battleship",
        year: 2012,
        duration: "131 phút",
        age: "T13",
        genre: "Hành Động, Viễn Tưởng",
        tags: ["2D", "IMAX"],
        formats: ["2D", "IMAX"],
        poster: "https://m.media-amazon.com/images/M/MV5BMjI5NTM5MDA2N15BMl5BanBnXkFtZTcwNjkwMzQxNw@@.jpg",
        backdrop: "https://m.media-amazon.com/images/M/MV5BOTc0MDM5OTQ3MF5BMl5BanBnXkFtZTcwNzgwMzQxNw@@._V1_.jpg",
        synopsis: "Cuộc chiến trên biển khơi nổ ra khi hạm đội hải quân quốc tế chạm trán với một hạm đội tàu vũ trụ của người ngoài hành tinh. Với sức mạnh vượt trội, kẻ xâm lăng muốn hủy diệt Trái Đất nhưng ý chí của con người không dễ bị khuất phục.",
        director: "Peter Berg",
        cast: [
            { name: "Taylor Kitsch", avatar: "https://i.pravatar.cc/80?img=12" },
            { name: "Rihanna", avatar: "https://i.pravatar.cc/80?img=28" },
            { name: "Alexander Skarsgård", avatar: "https://i.pravatar.cc/80?img=20" },
            { name: "Liam Neeson", avatar: "https://i.pravatar.cc/80?img=51" }
        ],
        releaseDate: "25/11/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt / Lồng tiếng",
        rating: 5.8,
        ratingCount: 15672,
        trailer: "https://www.youtube.com/embed/lIhPnMhEVvo",
        trailerWatch: "https://www.youtube.com/watch?v=lIhPnMhEVvo",
        gallery: [
            "https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1534796636912-3b952d9a7b3e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "tham-hoa-2012",
        title: "2012: Thảm Họa Toàn Cầu",
        titleEn: "2012",
        year: 2009,
        duration: "158 phút",
        age: "T13",
        genre: "Hành Động, Phiêu Lưu",
        tags: ["2D"],
        formats: ["2D"],
        poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80",
        backdrop: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1920&q=80",
        synopsis: "Khi các nhà khoa học phát hiện ra rằng trái đất sắp đến hồi kết vào năm 2012, chính phủ các nước bí mật xây dựng những con tàu khổng lồ để cứu vớt một phần nhân loại. Jackson Curtis — một nhà văn thất bại — không đầu hàng số phận và tìm mọi cách đưa gia đình đến nơi an toàn.",
        director: "Roland Emmerich",
        cast: [
            { name: "John Cusack", avatar: "https://i.pravatar.cc/80?img=55" },
            { name: "Amanda Peet", avatar: "https://i.pravatar.cc/80?img=45" },
            { name: "Chiwetel Ejiofor", avatar: "https://i.pravatar.cc/80?img=2" },
            { name: "Thandie Newton", avatar: "https://i.pravatar.cc/80?img=37" }
        ],
        releaseDate: "20/12/2026",
        language: "Tiếng Anh - Phụ đề Tiếng Việt / Lồng tiếng",
        rating: 5.8,
        ratingCount: 22840,
        trailer: "https://www.youtube.com/embed/ZpVex-E4yfo",
        trailerWatch: "https://www.youtube.com/watch?v=ZpVex-E4yfo",
        gallery: [
            "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80"
        ]
    }
];

// ── ALL MOVIES (combined for detail page lookup) ─────────────
const allMoviesData = [...nowShowingMovies, ...comingSoonMovies];

// ── CINEMAS ──────────────────────────────────────────────────
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

// ── MOCK SHOWTIMES GENERATOR ─────────────────────────────────
// Returns mock showtime data for a given cinemaId and format
function generateShowtimes(cinemaId, format) {
    const allTimes = ["09:00", "10:30", "11:45", "13:15", "14:30", "16:00", "17:20", "18:45", "20:10", "21:30", "22:50"];
    const statuses = ["available", "available", "available", "almost-full", "available", "full", "available", "almost-full", "available", "available", "available"];
    const count = 5 + Math.floor(Math.random() * 4);
    const startIdx = Math.floor(Math.random() * (allTimes.length - count));
    return allTimes.slice(startIdx, startIdx + count).map((time, i) => ({
        time,
        status: statuses[(startIdx + i) % statuses.length]
    }));
}

// ── MOCK REVIEWS ─────────────────────────────────────────────
const mockReviews = [
    {
        user: "Minh Tuấn",
        avatar: "https://i.pravatar.cc/48?img=1",
        rating: 9,
        date: "10/06/2026",
        text: "Phim rất hay! Kỹ xảo đỉnh cao, cốt truyện hấp dẫn từ đầu đến cuối. Xem ở IMAX mới cảm nhận được hết độ hoành tráng.",
        hasSpoiler: false
    },
    {
        user: "Lan Anh",
        avatar: "https://i.pravatar.cc/48?img=20",
        rating: 8,
        date: "09/06/2026",
        text: "Diễn xuất của các diễn viên chính rất tốt. Tuy nhiên phần đầu hơi chậm, phải đến 30 phút sau phim mới thực sự bắt đầu cuốn hút.",
        hasSpoiler: false
    },
    {
        user: "Đức Khải",
        avatar: "https://i.pravatar.cc/48?img=3",
        rating: 7,
        date: "08/06/2026",
        text: "Cẩn thận spoiler! Kết thúc phim khá bất ngờ và cảm xúc. Nếu bạn đã xem phần trước thì sẽ hiểu hơn nhiều.",
        hasSpoiler: true
    },
    {
        user: "Thu Hà",
        avatar: "https://i.pravatar.cc/48?img=44",
        rating: 10,
        date: "07/06/2026",
        text: "Masterpiece! Không có gì để chê. Âm nhạc, hình ảnh, diễn xuất đều xuất sắc. Đây chắc chắn là một trong những bộ phim hay nhất năm nay.",
        hasSpoiler: false
    }
];

// Normalize image paths based on current URL depth
const _isPagesDir = window.location.pathname.includes('/pages/');
const _ASSET_PREFIX = _isPagesDir ? '../assets/' : 'assets/';

const _normalizePath = (path) => {
    if (!path || path.startsWith('http') || path.startsWith('assets/')) return path;
    if (path.startsWith('images/')) return _ASSET_PREFIX + path;
    return path;
};

if (typeof heroMovies !== 'undefined') heroMovies.forEach(m => { m.bg = _normalizePath(m.bg); m.poster = _normalizePath(m.poster); });
if (typeof nowShowingMovies !== 'undefined') nowShowingMovies.forEach(m => { m.poster = _normalizePath(m.poster); m.bg = _normalizePath(m.bg); });
if (typeof comingSoonMovies !== 'undefined') comingSoonMovies.forEach(m => { m.poster = _normalizePath(m.poster); m.bg = _normalizePath(m.bg); });


