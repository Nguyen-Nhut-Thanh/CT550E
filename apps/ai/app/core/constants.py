DESTINATION_MAP = {
    # Domestic (Provinces & major cities)
    'ho chi minh': 'Hồ Chí Minh', 'tp hcm': 'Hồ Chí Minh', 'tphcm': 'Hồ Chí Minh', 'sai gon': 'Hồ Chí Minh',
    'ha noi': 'Hà Nội', 'da nang': 'Đà Nẵng', 'da lat': 'Đà Lạt', 'nha trang': 'Nha Trang',
    'phu quoc': 'Phú Quốc', 'ha long': 'Hạ Long', 'quang ninh': 'Quảng Ninh',
    'sa pa': 'Sa Pa', 'sapa': 'Sa Pa', 'lao cai': 'Lào Cai',
    'quy nhon': 'Quy Nhơn', 'hue': 'Huế', 'vung tau': 'Vũng Tàu',
    'phan thiet': 'Phan Thiết', 'mui ne': 'Mũi Né', 'con dao': 'Côn Đảo', 'can tho': 'Cần Thơ',
    'ninh binh': 'Ninh Bình', 'hoi an': 'Hội An', 'ha giang': 'Hà Giang', 'cao bang': 'Cao Bằng',
    'moc chau': 'Mộc Châu', 'phu yen': 'Phú Yên', 'buon ma thuot': 'Buôn Ma Thuột',
    'dak lak': 'Đắk Lắk', 'dak nong': 'Đắk Nông', 'an giang': 'An Giang', 'bac lieu': 'Bạc Liêu',
    'ben tre': 'Bến Tre', 'ca mau': 'Cà Mau', 'bac giang': 'Bắc Giang', 'quang nam': 'Quảng Nam',
    'quang binh': 'Quảng Bình', 'thanh hoa': 'Thanh Hóa', 'nghe an': 'Nghệ An', 'lam dong': 'Lâm Đồng',
    'khanh hoa': 'Khánh Hòa', 'kien giang': 'Kiên Giang', 'binh thuan': 'Bình Thuận',
    'binh phuoc': 'Bình Phước', 'binh duong': 'Bình Dương', 'dong nai': 'Đồng Nai',
    'long an': 'Long An', 'hau giang': 'Hậu Giang', 'soc trang': 'Sóc Trăng',
    'mien bac': 'Miền Bắc', 'mien trung': 'Miền Trung', 'mien nam': 'Miền Nam',
    'viet nam': 'Việt Nam', 'vietnam': 'Việt Nam', 'vn': 'Việt Nam',

    # International & Typos
    'japan': 'japan', 'janpan': 'japan', 'japn': 'japan', 'nhat ban': 'japan', 'nhat': 'japan',
    'nhật bản': 'japan', 'nhật': 'japan',
    'tokyo': 'Tokyo', 'hokkaido': 'Hokkaido', 'iwate': 'Iwate', 'osaka': 'Osaka', 'kyoto': 'Kyoto',
    'han quoc': 'Hàn Quốc', 'korea': 'Hàn Quốc', 'han': 'Hàn Quốc', 'seoul': 'Seoul', 'busan': 'Busan', 'jeju': 'Jeju',
    'thai lan': 'Thái Lan', 'thailand': 'Thái Lan', 'thai': 'Thái Lan', 'bangkok': 'Bangkok', 'phuket': 'Phuket',
    'singapore': 'Singapore', 'sing': 'Singapore',
    'trung quoc': 'Trung Quốc', 'china': 'Trung Quốc', 'dai loan': 'Đài Loan', 'taiwan': 'Đài Loan'
}

DESTINATION_SYNONYMS = {
    'japan': ['japan', 'janpan', 'nhat ban', 'nhat', 'tokyo', 'osaka', 'kyoto', 'hokkaido', 'hokkaido1', 'iwate', 'aomori', 'kanagawa', 'kanto', 'tohoku'],
    'nhat ban': ['japan', 'janpan', 'nhat ban', 'nhat', 'tokyo', 'osaka', 'kyoto', 'hokkaido', 'hokkaido1', 'iwate', 'aomori', 'kanagawa', 'kanto', 'tohoku'],
    'nhat': ['japan', 'janpan', 'nhat ban', 'nhat', 'tokyo', 'osaka', 'kyoto', 'hokkaido', 'hokkaido1', 'iwate', 'aomori', 'kanagawa', 'kanto', 'tohoku'],
    'tokyo': ['tokyo', 'japan', 'nhat ban'],
    'hokkaido': ['hokkaido', 'hokkaido1', 'japan', 'nhat ban'],
    'iwate': ['iwate', 'tohoku', 'japan', 'nhat ban'],
    'ho chi minh': ['ho chi minh', 'sai gon', 'tp hcm', 'tphcm'],
    'sai gon': ['ho chi minh', 'sai gon', 'tp hcm', 'tphcm'],
    'tp hcm': ['ho chi minh', 'sai gon', 'tp hcm', 'tphcm'],
    'tphcm': ['ho chi minh', 'sai gon', 'tp hcm', 'tphcm'],
    'sa pa': ['sa pa', 'sapa', 'lao cai'],
    'sapa': ['sa pa', 'sapa', 'lao cai'],
    'lao cai': ['sa pa', 'sapa', 'lao cai'],
    'ha long': ['ha long', 'quang ninh'],
    'quang ninh': ['ha long', 'quang ninh'],
    'hue': ['hue', 'thua thien hue'],
    'hoi an': ['hoi an', 'quang nam'],
    'quang nam': ['hoi an', 'quang nam'],
    'da lat': ['da lat', 'lam dong'],
    'lam dong': ['da lat', 'lam dong'],
    'nha trang': ['nha trang', 'khanh hoa'],
    'khanh hoa': ['nha trang', 'khanh hoa'],
    'phu quoc': ['phu quoc', 'kien giang'],
    'kien giang': ['phu quoc', 'kien giang'],
    'cao bang': ['cao bang'],
    'han quoc': ['han quoc', 'korea', 'han', 'seoul', 'busan', 'jeju'],
    'korea': ['han quoc', 'korea', 'han', 'seoul', 'busan', 'jeju'],
    'thai lan': ['thai lan', 'thailand', 'thai', 'bangkok', 'phuket'],
    'thailand': ['thai lan', 'thailand', 'thai', 'bangkok', 'phuket'],
    'mien bac': ['mien bac', 'ha noi', 'ninh binh', 'sa pa', 'sapa', 'lao cai', 'ha giang', 'cao bang', 'ha long', 'quang ninh', 'quang binh', 'thanh hoa', 'nghe an', 'bac giang'],
    'mien trung': ['mien trung', 'da nang', 'hue', 'hoi an', 'quang nam', 'nha trang', 'khanh hoa', 'quy nhon', 'phu yen', 'binh dinh', 'da lat', 'lam dong', 'binh thuan'],
    'mien nam': ['mien nam', 'ho chi minh', 'sai gon', 'vung tau', 'can tho', 'an giang', 'bac lieu', 'phu quoc', 'kien giang', 'ben tre', 'ca mau', 'dong nai', 'binh duong', 'long an', 'soc trang', 'hau giang'],
}

STOP_WORDS = r'(?:có\s+tour|có\s+không|co\s+khong|có\s+hông|co\s+hong|có\s+ko|co\s+ko|có|co|k|ko|kh|khong|không|hông|hong|hơm|hom|hổng|nữa|nua|ạ|nhe|nhé|nha|a|á|ơi|oi|giá|gia|bao\s+nhiêu|bao\s+nhieu|nếu|neu|cho|thì|thi|tầm|tam|khoảng|khoang|\d+\s*(?:người\s*lớn|nguoi\s*lon|trẻ\s*em|tre\s*em|em\s*bé|em\s*be|người|nguoi|khách|khach|vé|ve|trẻ|tre|bé|be)|\d+\s*ngày)'

DEST_PATTERNS = [
    rf'(?:có\s+tour\s*(?:nào\s*)?(?:đi|di|đến|den|tới|toi|ở|o|tại|tai)\s+|tour\s*(?:nào\s*)?(?:đi|di|đến|den|tới|toi|ở|o|tại|tai)\s+|tìm\s+tour\s*(?:đi|di|đến|den|tới|toi)?\s+)([A-Za-zÀ-ỹ0-9\s]+?)(?:\s+{STOP_WORDS}|\s*$)',
    rf'\btour\s+([A-Za-zÀ-ỹ0-9\s]+?)(?:\s+{STOP_WORDS}|\s*$)',
    rf'\b(?:đi|di|đến|den|tới|toi)\s+([A-Za-zÀ-ỹ0-9\s]+?)(?:\s+{STOP_WORDS}|\s*$)',
]

INVALID_DESTS = {
    'nào', 'nao', 'gì', 'gi', 'sao', 'mấy', 'may', 'bao', 'nhiêu', 'nhieu', 'đâu', 'dau',
    'này', 'nay', 'đó', 'do', 'kia', 'giúp', 'giup', 'minh', 'mình', 'k', 'ko', 'khong', 'không',
    'hông', 'hong', 'nước ngoài', 'nuoc ngoai', 'trong nước', 'trong nuoc', 'quốc tế', 'quoc te',
    'thì', 'thi', 'nếu', 'neu', 'hỏi', 'hoi', 'xem'
}

ORDINAL = r'\b(?:tour|lua chon|lựa chọn) (dau tien|đầu tiên|thu nhat|thứ nhất|thu hai|thứ hai|thu ba|thứ ba|thu tu|thứ tư|thu nam|thứ năm|(?:(?:thu|thứ|so|số) )?[1-5])\b'

