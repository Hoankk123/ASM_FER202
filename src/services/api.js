import axios from 'axios';
import flower1 from '../images/hoa1.jpg';
import flower11 from '../images/hoa11.webp';
import flower12 from '../images/hoa12.webp';
import flower2 from '../images/hoa2.jpg';
import flower3 from '../images/hoa3.jpg';
import flower4 from '../images/hoa4.jpg';
import flower5 from '../images/hoa5.jpg';
import flower6 from '../images/hoa6.jpg';
import flower7 from '../images/hoa7.jpg';
import flower8 from '../images/hoa8.jpg';
import flower9 from '../images/hoa9.jpg';
import flower10 from '../images/hoa90.jpg';
import flower13 from '../images/hoa13.webp';
import flower14 from '../images/hoa14.webp';
import flower15 from '../images/hoa15.webp';
import flower16 from '../images/hoa16.webp';
import flower17 from '../images/hoa17.webp';
import flower18 from '../images/hoa18.webp';
import flower19 from '../images/hoa19.webp';
import flower20 from '../images/hoa20.webp';
import flower21 from '../images/hoa21.webp';
import flower22 from '../images/hoa22.webp';
import flower23 from '../images/hoa23.webp';
import flower24 from '../images/hoa24.webp';
import flower25 from '../images/hoa25.webp';
import flower26 from '../images/hoa26.webp';
import flower27 from '../images/hoa27.webp';
import flower28 from '../images/hoa28.webp';
import flower29 from '../images/hoa29.webp';
import flower30 from '../images/hoa30.webp';
import flower31 from '../images/hoa31.webp';
import flower32 from '../images/hoa32.webp';
import flower33 from '../images/hoa33.webp';
import flower34 from '../images/hoa34.webp';
import flower35 from '../images/hoa35.webp';
import flower36 from '../images/hoa36.webp';
import flower37 from '../images/hoa37.webp';
import flower38 from '../images/hoa38.webp';
import flower39 from '../images/hoa39.webp';
import flower40 from '../images/hoa40.webp';

// ==================== Mock Data ====================
const MOCK_CATEGORIES = [
  { cid: 1, cname: 'Hoa Hồng' },
  { cid: 2, cname: 'Hoa Cúc' },
  { cid: 3, cname: 'Hoa Lan' },
  { cid: 4, cname: 'Hoa Tulip' },
  { cid: 5, cname: 'Hoa Ly' },
  { cid: 6, cname: 'Hoa Hướng Dương' },
  { cid: 7, cname: 'Hoa Cẩm Tú Cầu' },
  { cid: 8, cname: 'Giỏ & Lẵng Hoa' },
];

const INITIAL_PRODUCTS = [
  {
    productId: 1, productName: 'Bó Hoa Hồng Đỏ', description: 'Bó hoa hồng đỏ tươi thắm, 20 bông, phù hợp tặng người yêu, ngày Valentine, sinh nhật.', price: 350000, discount: 10, stock: 46, image: flower1, categoryId: 1, sold: 4,
  },
  {
    productId: 2, productName: 'Hoa Hồng Trắng Tinh Khôi', description: 'Bó hoa hồng trắng thanh lịch, 15 bông, thích hợp cho đám cưới và lễ kỷ niệm.', price: 280000, discount: 0, stock: 34, image: flower2, categoryId: 1, sold: 1,
  },
  {
    productId: 3, productName: 'Hoa Hồng Pastel Mix', description: 'Bó hoa hồng mix màu pastel nhẹ nhàng, 25 bông, mang đến cảm giác lãng mạn.', price: 420000, discount: 15, stock: 19, image: flower3, categoryId: 1, sold: 1,
  },
  {
    productId: 4, productName: 'Hoa Cúc Vàng Rực Rỡ', description: 'Bó hoa cúc vàng tươi tắn, biểu tượng của sự trường thọ và may mắn.', price: 150000, discount: 0, stock: 80, image: flower4, categoryId: 2, sold: 0,
  },
  {
    productId: 5, productName: 'Hoa Cúc Trắng Thanh Nhã', description: 'Hoa cúc trắng tinh khiết, phù hợp trang trí bàn thờ, sự kiện trang trọng.', price: 120000, discount: 5, stock: 100, image: flower5, categoryId: 2, sold: 0,
  },
  {
    productId: 6, productName: 'Hoa Lan Hồ Điệp Trắng', description: 'Chậu hoa lan hồ điệp trắng sang trọng, 2 cành, phù hợp làm quà tặng doanh nghiệp.', price: 650000, discount: 20, stock: 14, image: flower6, categoryId: 3, sold: 1,
  },
  {
    productId: 7, productName: 'Hoa Lan Tím Quý Phái', description: 'Chậu hoa lan tím đậm, 3 cành dài, biểu tượng của sự quý phái và thanh lịch.', price: 850000, discount: 10, stock: 10, image: flower7, categoryId: 3, sold: 0,
  },
  {
    productId: 8, productName: 'Hoa Tulip Đỏ Hà Lan', description: 'Bó hoa tulip đỏ nhập khẩu từ Hà Lan, 10 bông, tươi lâu 7-10 ngày.', price: 500000, discount: 0, stock: 24, image: flower8, categoryId: 4, sold: 1,
  },
  {
    productId: 9, productName: 'Hoa Tulip Vàng Nắng', description: 'Bó hoa tulip vàng rực rỡ, 10 bông, mang đến năng lượng tích cực.', price: 480000, discount: 5, stock: 29, image: flower9, categoryId: 4, sold: 1,
  },
  {
    productId: 10, productName: 'Hoa Ly Hồng Thơm Ngát', description: 'Bó hoa ly hồng đậm, 5 cành, hương thơm nồng nàn, tươi lâu.', price: 300000, discount: 10, stock: 39, image: flower10, categoryId: 5, sold: 1,
  },
  {
    productId: 11, productName: 'Hoa Ly Trắng Tinh Khiết', description: 'Bó hoa ly trắng tinh khiết, 5 cành, thích hợp cho mọi dịp.', price: 320000, discount: 0, stock: 34, image: flower11, categoryId: 5, sold: 1,
  },
  {
    productId: 12, productName: 'Giỏ Hoa Mix Sắc Màu', description: 'Giỏ hoa mix nhiều loại: hồng, cúc, baby, lá trang trí. Quà tặng hoàn hảo.', price: 550000, discount: 25, stock: 17, image: flower12, categoryId: 1, sold: 1,
  },
  {
    productId: 13, productName: 'Bó Hoa Hướng Dương Nắng Mai', description: 'Bó hoa hướng dương rực rỡ phối cùng hoa baby trắng và lá bạc, biểu tượng của niềm tin và hy vọng.', price: 380000, discount: 10, stock: 22, image: flower13, categoryId: 6, sold: 3,
  },
  {
    productId: 14, productName: 'Bó Cẩm Tú Cầu Lam Ngọc', description: 'Hoa cẩm tú cầu xanh lam mát dịu, gói giấy phong cách Hàn Quốc thanh lịch, thích hợp tặng sinh nhật.', price: 420000, discount: 0, stock: 19, image: flower14, categoryId: 7, sold: 1,
  },
  {
    productId: 15, productName: 'Bó Hoa Hồng Juliette Hoàng Gia', description: 'Bó hoa hồng Juliette màu cam đào ngọt ngào và quý phái, loài hoa triệu đô cho ngày đặc biệt.', price: 550000, discount: 15, stock: 13, image: flower15, categoryId: 1, sold: 2,
  },
  {
    productId: 16, productName: 'Chậu Lan Hồ Điệp Vàng Phú Quý', description: 'Chậu lan hồ điệp vàng 3 cành sum suê, mang tài lộc, thịnh vượng đến gia chủ dịp khai trương, tân gia.', price: 950000, discount: 5, stock: 7, image: flower16, categoryId: 3, sold: 1,
  },
  {
    productId: 17, productName: 'Bó Hoa Tulip Tím Mộng Mơ', description: 'Hoa tulip tím Hà Lan nhập khẩu, màu sắc quyến rũ tượng trưng cho tình yêu thủy chung, sâu sắc.', price: 520000, discount: 0, stock: 17, image: flower17, categoryId: 4, sold: 1,
  },
  {
    productId: 18, productName: 'Bó Hoa Baby Trắng Tinh Khôi', description: 'Bó hoa baby trắng bồng bềnh như mây, món quà dịu dàng dành tặng nàng thơ.', price: 260000, discount: 0, stock: 29, image: flower18, categoryId: 2, sold: 1,
  },
  {
    productId: 19, productName: 'Lẵng Hoa Khai Trương Hồng Phát', description: 'Lẵng hoa chúc mừng khai trương 2 tầng tone đỏ - vàng rực rỡ, mang lời chúc hồng phát thành công.', price: 1200000, discount: 10, stock: 10, image: flower19, categoryId: 8, sold: 2,
  },
  {
    productId: 20, productName: 'Giỏ Hoa Gỗ Phong Cách Vintage', description: 'Giỏ hoa cắm hộp gỗ mộc mạc, kết hợp hoa hồng Ecuador, cẩm chướng và hoa sao khô tinh tế.', price: 680000, discount: 20, stock: 13, image: flower20, categoryId: 8, sold: 1,
  },
  {
    productId: 21, productName: 'Bó Hoa Hồng Ecuador Đỏ Thẫm', description: 'Bông hoa hồng Ecuador nhập khẩu cỡ đại, đỏ nhung kiêu sa, cánh dày tươi trên 10 ngày.', price: 750000, discount: 10, stock: 13, image: flower21, categoryId: 1, sold: 3,
  },
  {
    productId: 22, productName: 'Bó Hoa Cúc Mẫu Đơn Tím Khói', description: 'Hoa cúc mẫu đơn khổng lồ sắc tím khói độc đáo, mang vẻ đẹp hiện đại và sang trọng.', price: 490000, discount: 5, stock: 21, image: flower22, categoryId: 2, sold: 1,
  },
  {
    productId: 23, productName: 'Chậu Lan Mini Để Bàn Sang Trọng', description: 'Chậu hoa lan hồ điệp mini xinh xắn, thích hợp trang trí bàn làm việc, phòng khách.', price: 390000, discount: 0, stock: 4, image: flower23, categoryId: 3, sold: 0,
  },
  {
    productId: 24, productName: 'Bó Hoa Tulip Hồng Pastel', description: 'Bó hoa tulip hồng cánh sen nhẹ nhàng, ngọt ngào, phù hợp làm quà tặng kỷ niệm tình yêu.', price: 480000, discount: 10, stock: 25, image: flower24, categoryId: 4, sold: 3,
  },
  {
    productId: 25, productName: 'Bó Cẩm Tú Cầu Hồng Ngọt Ngào', description: 'Đóa cẩm tú cầu hồng căng tròn kết hợp hoa phi yến trắng và lá khuynh diệp thơm mát.', price: 450000, discount: 0, stock: 14, image: flower25, categoryId: 7, sold: 1,
  },
  {
    productId: 26, productName: 'Giỏ Hoa Tươi Tone Pastel Dịu Mắt', description: 'Giỏ mây đan thủ công cắm hoa hồng kem dâu, cát tường và cúc tana đáng yêu.', price: 520000, discount: 15, stock: 3, image: flower26, categoryId: 8, sold: 1,
  },
  {
    productId: 27, productName: 'Bó Hoa Cúc Họa Mi Đầu Mùa', description: 'Cúc họa mi trắng nhụy vàng thuần khiết, mang hơi thở dịu êm của những ngày chớm đông.', price: 180000, discount: 0, stock: 39, image: flower27, categoryId: 2, sold: 1,
  },
  {
    productId: 28, productName: 'Bó Hoa Hướng Dương Rạng Ngời', description: 'Hoa hướng dương 5 bông to khỏe, giấy gói kraft phong cách mộc mạc, tràn đầy năng lượng tích cực.', price: 320000, discount: 5, stock: 24, image: flower28, categoryId: 6, sold: 1,
  },
  {
    productId: 29, productName: 'Bó Hoa Ly Vàng Hoàng Kim', description: 'Hoa ly vàng cánh dày, hương thơm ngát lưu hương dài lâu, thích hợp dâng lễ và chưng bàn thờ.', price: 350000, discount: 0, stock: 34, image: flower29, categoryId: 5, sold: 1,
  },
  {
    productId: 30, productName: 'Bó Hoa Hồng Ohara Thơm Ngát', description: 'Hoa hồng ngoại White Ohara với hương thơm nước hoa quyến rũ, form hoa xoáy cổ điển tuyệt mỹ.', price: 620000, discount: 10, stock: 19, image: flower30, categoryId: 1, sold: 1,
  },
  {
    productId: 31, productName: 'Lẵng Hoa Để Bàn Hội Nghị Trang Trọng', description: 'Lẵng hoa thấp để bàn tông đỏ rượu và trắng sang trọng, hoàn hảo cho sự kiện, tiệc cưới.', price: 790000, discount: 0, stock: 9, image: flower31, categoryId: 8, sold: 1,
  },
  {
    productId: 32, productName: 'Bó Hoa Tulip Trắng Thanh Khiết', description: '10 cành tulip trắng nhập khẩu tươi mới, tinh khôi và đẳng cấp dành cho người trân quý.', price: 510000, discount: 5, stock: 14, image: flower32, categoryId: 4, sold: 1,
  },
  {
    productId: 33, productName: 'Bó Hoa Cúc Tana Xinh Xắn', description: 'Hoa cúc tana nhỏ nhắn như những mặt trời tí hon, biểu tượng của tình bạn trong sáng.', price: 220000, discount: 0, stock: 49, image: flower33, categoryId: 2, sold: 1,
  },
  {
    productId: 34, productName: 'Chậu Lan Hồ Điệp Đột Biến Hồng Gân', description: 'Giống lan đột biến với cánh hoa vân hồng tinh xảo, độ bền hoa trên 2 tháng.', price: 1100000, discount: 15, stock: 5, image: flower34, categoryId: 3, sold: 1,
  },
  {
    productId: 35, productName: 'Bó Hoa Cẩm Tú Cầu Tím Mơ Màng', description: 'Sắc tím mộng mơ kết hợp hoa baby trắng, mang vẻ đẹp lãng mạn và dịu dàng khó quên.', price: 460000, discount: 10, stock: 17, image: flower35, categoryId: 7, sold: 1,
  },
  {
    productId: 36, productName: 'Kệ Hoa Chúc Mừng Đại Cát', description: 'Kệ hoa đứng 2 tầng kết hợp hoa hồng, ly, hướng dương và lan vũ nữ rực rỡ chào mừng khai trương.', price: 1500000, discount: 10, stock: 7, image: flower36, categoryId: 8, sold: 1,
  },
  {
    productId: 37, productName: 'Bó Hoa Hướng Dương Tốt Nghiệp', description: 'Món quà chúc mừng tốt nghiệp rạng rỡ, cổ vũ tương lai tươi sáng và rộng mở.', price: 360000, discount: 0, stock: 29, image: flower37, categoryId: 6, sold: 1,
  },
  {
    productId: 38, productName: 'Bó Hoa Hồng Vàng Tình Bạn', description: 'Bó hoa hồng vàng rực rỡ thể hiện sự ấm áp, chân thành và gắn kết bền lâu.', price: 340000, discount: 5, stock: 24, image: flower38, categoryId: 1, sold: 1,
  },
  {
    productId: 39, productName: 'Hộp Hoa Tròn Sang Trọng Rose Box', description: 'Hộp hoa tròn cao cấp cắm hoa hồng đỏ nhung phối ren tinh tế, quà tặng sinh nhật thượng lưu.', price: 690000, discount: 10, stock: 11, image: flower39, categoryId: 8, sold: 1,
  },
  {
    productId: 40, productName: 'Bó Hoa Baby Cầu Vồng Nhiệm Màu', description: 'Hoa baby khô nhuộm màu pastel ngọt ngào, bền đẹp giữ màu suốt nhiều năm.', price: 290000, discount: 0, stock: 19, image: flower40, categoryId: 2, sold: 1,
  },
];

const MOCK_REVIEWS = [
  { reviewId: 1, productId: 1, username: 'Minh', rating: 5, comment: 'Hoa rất tươi và đẹp, người yêu rất thích!', createdAt: '2024-12-01' },
  { reviewId: 2, productId: 1, username: 'Lan', rating: 4, comment: 'Giao hàng nhanh, hoa đẹp nhưng hơi ít lá.', createdAt: '2024-12-05' },
  { reviewId: 3, productId: 2, username: 'Hùng', rating: 5, comment: 'Tuyệt vời, dùng trang trí đám cưới rất sang.', createdAt: '2024-11-20' },
  { reviewId: 4, productId: 4, username: 'Trang', rating: 4, comment: 'Hoa cúc tươi lâu, giá hợp lý.', createdAt: '2024-12-10' },
  { reviewId: 5, productId: 6, username: 'Phương', rating: 5, comment: 'Lan hồ điệp rất đẹp, tặng sếp rất hợp.', createdAt: '2024-11-15' },
  { reviewId: 6, productId: 8, username: 'Dũng', rating: 4, comment: 'Tulip đẹp, nhưng tàn hơi nhanh.', createdAt: '2024-12-08' },
  { reviewId: 7, productId: 10, username: 'Mai', rating: 5, comment: 'Hoa ly thơm lắm, rất hài lòng!', createdAt: '2024-12-12' },
  // 10 Fake users' reviews:
  { reviewId: 101, productId: 1, username: 'nguyenminh', rating: 5, comment: 'Hoa hồng đỏ tươi rói, 20 bông nở to đều và thơm dịu, bạn gái mình thích lắm!', createdAt: '2025-01-11' },
  { reviewId: 102, productId: 13, username: 'nguyenminh', rating: 5, comment: 'Hoa hướng dương vàng óng ánh, tươi lâu, cắm bình nhìn tràn đầy sức sống!', createdAt: '2025-01-11' },
  { reviewId: 103, productId: 15, username: 'lethao', rating: 5, comment: 'Màu hoa Juliette xuất sắc, form hoa chuẩn đét như hình mẫu, hương thơm ngọt ngào.', createdAt: '2025-01-13' },
  { reviewId: 104, productId: 17, username: 'lethao', rating: 5, comment: 'Tulip tím cực sang, giấy bọc phong cách Hàn Quốc rất tinh tế và hiện đại.', createdAt: '2025-01-13' },
  { reviewId: 105, productId: 19, username: 'tranhoang', rating: 5, comment: 'Lẵng hoa khai trương hoành tráng, công ty đối tác khen ngợi nức nở. Rất uy tín!', createdAt: '2025-01-16' },
  { reviewId: 106, productId: 6, username: 'tranhoang', rating: 5, comment: 'Chậu lan trắng 2 cành cắm khéo, cánh hoa dày và tươi rất lâu.', createdAt: '2025-01-16' },
  { reviewId: 107, productId: 18, username: 'phamhuong', rating: 5, comment: 'Hoa baby trắng bồng bềnh như mây, thơm nhẹ nhàng đáng yêu vô cùng.', createdAt: '2025-01-19' },
  { reviewId: 108, productId: 24, username: 'phamhuong', rating: 5, comment: 'Tulip hồng xinh xỉu, cánh hoa mịn như lụa, tặng bạn bè hay người yêu đều hợp.', createdAt: '2025-01-19' },
  { reviewId: 109, productId: 21, username: 'vudung', rating: 5, comment: 'Hồng Ecuador bông siêu to, đỏ nhung kiêu sa đẳng cấp bậc nhất.', createdAt: '2025-01-21' },
  { reviewId: 110, productId: 39, username: 'vudung', rating: 5, comment: 'Hộp hoa tròn tặng vợ ngày sinh nhật, bà xã mở ra mê tít, khen khéo chọn!', createdAt: '2025-01-21' },
  { reviewId: 111, productId: 22, username: 'doanmai', rating: 5, comment: 'Cúc mẫu đơn tím khói độc lạ, khách tới nhà ai cũng hỏi mua ở đâu.', createdAt: '2025-01-23' },
  { reviewId: 112, productId: 28, username: 'doanmai', rating: 5, comment: 'Hướng dương bông to khỏe, giấy kraft mộc mạc đúng gu mình.', createdAt: '2025-01-23' },
  { reviewId: 113, productId: 32, username: 'hoangnam', rating: 5, comment: 'Tulip trắng tinh khôi, giao hàng siêu nhanh chỉ 45 phút là nhận được.', createdAt: '2025-01-26' },
  { reviewId: 114, productId: 9, username: 'hoangnam', rating: 4, comment: 'Bó hoa tulip vàng rực rỡ, mang lại năng lượng rất tích cực và ấm cúng.', createdAt: '2025-01-26' },
  { reviewId: 115, productId: 20, username: 'bichngoc', rating: 5, comment: 'Giỏ gỗ vintage để phòng khách sang chảnh hẳn, hoa tươi nhiều ngày.', createdAt: '2025-01-28' },
  { reviewId: 116, productId: 35, username: 'bichngoc', rating: 5, comment: 'Cẩm tú cầu tím mơ màng lãng mạn, đóng gói cẩn thận 5 sao!', createdAt: '2025-01-28' },
  { reviewId: 117, productId: 16, username: 'quoccuong', rating: 5, comment: 'Lan vàng phú quý tài lộc, chậu sứ trắng đẹp xuất sắc, hoa nở rộ rất bền.', createdAt: '2025-01-29' },
  { reviewId: 118, productId: 37, username: 'quoccuong', rating: 5, comment: 'Mua tặng em gái ngày tốt nghiệp, hoa rất nổi bật khi chụp hình kỷ yếu.', createdAt: '2025-01-29' },
  { reviewId: 119, productId: 10, username: 'kimyen', rating: 5, comment: 'Hoa ly thơm ngát khắp phòng khách, bông to búp nở đều không bị dập.', createdAt: '2025-01-31' },
  { reviewId: 120, productId: 40, username: 'kimyen', rating: 5, comment: 'Baby cầu vồng nhiều màu pastel xinh lung linh, để khô giữ được rất lâu.', createdAt: '2025-01-31' },
];

const INITIAL_ORDERS = [
  {
    orderId: 1001,
    userId: 4,
    username: 'nguyenminh',
    customerName: 'Nguyễn Văn Minh',
    phone: '0918123456',
    status: 'Completed',
    createdAt: '2025-01-10',
    total: 1892000,
    items: [
      { productId: 1, productName: 'Bó Hoa Hồng Đỏ', price: 315000, quantity: 2 },
      { productId: 13, productName: 'Bó Hoa Hướng Dương Nắng Mai', price: 342000, quantity: 1 },
      { productId: 14, productName: 'Bó Cẩm Tú Cầu Lam Ngọc', price: 420000, quantity: 1 },
      { productId: 8, productName: 'Hoa Tulip Đỏ Hà Lan', price: 500000, quantity: 1 },
    ],
    shippingAddress: 'Nguyễn Văn Minh | SĐT: 0918123456 | Đ/C: 12 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM | Phương thức: Thanh toán khi nhận hàng',
    paymentMethod: 'COD',
  },
  {
    orderId: 1002,
    userId: 5,
    username: 'lethao',
    customerName: 'Lê Phương Thảo',
    phone: '0934567890',
    status: 'Completed',
    createdAt: '2025-01-12',
    total: 1437500,
    items: [
      { productId: 15, productName: 'Bó Hoa Hồng Juliette Hoàng Gia', price: 467500, quantity: 1 },
      { productId: 17, productName: 'Bó Hoa Tulip Tím Mộng Mơ', price: 520000, quantity: 1 },
      { productId: 25, productName: 'Bó Cẩm Tú Cầu Hồng Ngọt Ngào', price: 450000, quantity: 1 },
    ],
    shippingAddress: 'Lê Phương Thảo | SĐT: 0934567890 | Đ/C: 45 Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP.HCM | Phương thức: Chuyển khoản ngân hàng',
    paymentMethod: 'BANK_TRANSFER',
  },
  {
    orderId: 1003,
    userId: 6,
    username: 'tranhoang',
    customerName: 'Trần Huy Hoàng',
    phone: '0908765432',
    status: 'Completed',
    createdAt: '2025-01-15',
    total: 2950000,
    items: [
      { productId: 19, productName: 'Lẵng Hoa Khai Trương Hồng Phát', price: 1080000, quantity: 1 },
      { productId: 6, productName: 'Hoa Lan Hồ Điệp Trắng', price: 520000, quantity: 1 },
      { productId: 36, productName: 'Kệ Hoa Chúc Mừng Đại Cát', price: 1350000, quantity: 1 },
    ],
    shippingAddress: 'Trần Huy Hoàng | SĐT: 0908765432 | Đ/C: 88 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM | Phương thức: Chuyển khoản ngân hàng',
    paymentMethod: 'BANK_TRANSFER',
  },
  {
    orderId: 1004,
    userId: 7,
    username: 'phamhuong',
    customerName: 'Phạm Thu Hương',
    phone: '0945123789',
    status: 'Completed',
    createdAt: '2025-01-18',
    total: 1524000,
    items: [
      { productId: 18, productName: 'Bó Hoa Baby Trắng Tinh Khôi', price: 260000, quantity: 1 },
      { productId: 24, productName: 'Bó Hoa Tulip Hồng Pastel', price: 432000, quantity: 2 },
      { productId: 27, productName: 'Bó Hoa Cúc Họa Mi Đầu Mùa', price: 180000, quantity: 1 },
      { productId: 33, productName: 'Bó Hoa Cúc Tana Xinh Xắn', price: 220000, quantity: 1 },
    ],
    shippingAddress: 'Phạm Thu Hương | SĐT: 0945123789 | Đ/C: 120 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP.HCM | Phương thức: Thanh toán khi nhận hàng',
    paymentMethod: 'COD',
  },
  {
    orderId: 1005,
    userId: 8,
    username: 'vudung',
    customerName: 'Vũ Tuấn Dũng',
    phone: '0978901234',
    status: 'Completed',
    createdAt: '2025-01-20',
    total: 1854000,
    items: [
      { productId: 21, productName: 'Bó Hoa Hồng Ecuador Đỏ Thẫm', price: 675000, quantity: 1 },
      { productId: 30, productName: 'Bó Hoa Hồng Ohara Thơm Ngát', price: 558000, quantity: 1 },
      { productId: 39, productName: 'Hộp Hoa Tròn Sang Trọng Rose Box', price: 621000, quantity: 1 },
    ],
    shippingAddress: 'Vũ Tuấn Dũng | SĐT: 0978901234 | Đ/C: 250 Pasteur, Phường Võ Thị Sáu, Quận 3, TP.HCM | Phương thức: Chuyển khoản ngân hàng',
    paymentMethod: 'BANK_TRANSFER',
  },
  {
    orderId: 1006,
    userId: 9,
    username: 'doanmai',
    customerName: 'Đoàn Tuyết Mai',
    phone: '0963214587',
    status: 'Completed',
    createdAt: '2025-01-22',
    total: 1462000,
    items: [
      { productId: 2, productName: 'Hoa Hồng Trắng Tinh Khôi', price: 280000, quantity: 1 },
      { productId: 22, productName: 'Bó Hoa Cúc Mẫu Đơn Tím Khói', price: 465500, quantity: 1 },
      { productId: 28, productName: 'Bó Hoa Hướng Dương Rạng Ngời', price: 304000, quantity: 1 },
      { productId: 12, productName: 'Giỏ Hoa Mix Sắc Màu', price: 412500, quantity: 1 },
    ],
    shippingAddress: 'Đoàn Tuyết Mai | SĐT: 0963214587 | Đ/C: 35 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM | Phương thức: Thanh toán khi nhận hàng',
    paymentMethod: 'COD',
  },
  {
    orderId: 1007,
    userId: 10,
    username: 'hoangnam',
    customerName: 'Hoàng Hải Nam',
    phone: '0981234890',
    status: 'Completed',
    createdAt: '2025-01-25',
    total: 1297500,
    items: [
      { productId: 3, productName: 'Hoa Hồng Pastel Mix', price: 357000, quantity: 1 },
      { productId: 9, productName: 'Hoa Tulip Vàng Nắng', price: 456000, quantity: 1 },
      { productId: 32, productName: 'Bó Hoa Tulip Trắng Thanh Khiết', price: 484500, quantity: 1 },
    ],
    shippingAddress: 'Hoàng Hải Nam | SĐT: 0981234890 | Đ/C: 15 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, TP.HCM | Phương thức: Thanh toán khi nhận hàng',
    paymentMethod: 'COD',
  },
  {
    orderId: 1008,
    userId: 11,
    username: 'bichngoc',
    customerName: 'Ngô Bích Ngọc',
    phone: '0923456712',
    status: 'Completed',
    createdAt: '2025-01-27',
    total: 2190000,
    items: [
      { productId: 20, productName: 'Giỏ Hoa Gỗ Phong Cách Vintage', price: 544000, quantity: 1 },
      { productId: 26, productName: 'Giỏ Hoa Tươi Tone Pastel Dịu Mắt', price: 442000, quantity: 1 },
      { productId: 31, productName: 'Lẵng Hoa Để Bàn Hội Nghị Trang Trọng', price: 790000, quantity: 1 },
      { productId: 35, productName: 'Bó Hoa Cẩm Tú Cầu Tím Mơ Màng', price: 414000, quantity: 1 },
    ],
    shippingAddress: 'Ngô Bích Ngọc | SĐT: 0923456712 | Đ/C: 60 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP.HCM | Phương thức: Chuyển khoản ngân hàng',
    paymentMethod: 'BANK_TRANSFER',
  },
  {
    orderId: 1009,
    userId: 12,
    username: 'quoccuong',
    customerName: 'Đặng Quốc Cường',
    phone: '0938999888',
    status: 'Completed',
    createdAt: '2025-01-28',
    total: 2197500,
    items: [
      { productId: 16, productName: 'Chậu Lan Hồ Điệp Vàng Phú Quý', price: 902500, quantity: 1 },
      { productId: 34, productName: 'Chậu Lan Hồ Điệp Đột Biến Hồng Gân', price: 935000, quantity: 1 },
      { productId: 37, productName: 'Bó Hoa Hướng Dương Tốt Nghiệp', price: 360000, quantity: 1 },
    ],
    shippingAddress: 'Đặng Quốc Cường | SĐT: 0938999888 | Đ/C: 102 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM | Phương thức: Chuyển khoản ngân hàng',
    paymentMethod: 'BANK_TRANSFER',
  },
  {
    orderId: 1010,
    userId: 13,
    username: 'kimyen',
    customerName: 'Trịnh Kim Yến',
    phone: '0971239876',
    status: 'Completed',
    createdAt: '2025-01-30',
    total: 1553000,
    items: [
      { productId: 10, productName: 'Hoa Ly Hồng Thơm Ngát', price: 270000, quantity: 1 },
      { productId: 11, productName: 'Hoa Ly Trắng Tinh Khiết', price: 320000, quantity: 1 },
      { productId: 29, productName: 'Bó Hoa Ly Vàng Hoàng Kim', price: 350000, quantity: 1 },
      { productId: 40, productName: 'Bó Hoa Baby Cầu Vồng Nhiệm Màu', price: 290000, quantity: 1 },
      { productId: 38, productName: 'Bó Hoa Hồng Vàng Tình Bạn', price: 323000, quantity: 1 },
    ],
    shippingAddress: 'Trịnh Kim Yến | SĐT: 0971239876 | Đ/C: 55 Cách Mạng Tháng Tám, Phường 7, Quận Tân Bình, TP.HCM | Phương thức: Thanh toán khi nhận hàng',
    paymentMethod: 'COD',
  },
];

// Persistent localStorage helpers to synchronize user & admin in real time
const ORDERS_STORAGE_KEY = 'flower_shop_orders';
const PRODUCTS_STORAGE_KEY = 'flower_shop_products';

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const seedOrdersKey = 'flower_shop_fake_users_orders_v8';
    if (!localStorage.getItem(seedOrdersKey)) {
      let currentOrders = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) currentOrders = parsed;
        } catch (e) {}
      }
      const existingIds = new Set(currentOrders.map((o) => o.orderId));
      INITIAL_ORDERS.forEach((io) => {
        if (!existingIds.has(io.orderId)) {
          currentOrders.push(io);
        }
      });
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(currentOrders));
      localStorage.setItem(seedOrdersKey, 'true');
      return currentOrders;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading orders from localStorage', e);
  }
  return INITIAL_ORDERS;
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to localStorage', e);
  }
  window.dispatchEvent(new Event('ordersUpdated'));
  window.dispatchEvent(new Event('storage'));
}

export function getStoredProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const syncSoldKey = 'flower_shop_sync_sold_v8';
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing initial products if any were added
        const existingIds = new Set(parsed.map((p) => p.productId));
        let hasNew = false;
        INITIAL_PRODUCTS.forEach((ip) => {
          if (!existingIds.has(ip.productId)) {
            parsed.push({ ...ip });
            hasNew = true;
          }
        });
        if (!localStorage.getItem(syncSoldKey)) {
          INITIAL_PRODUCTS.forEach((ip) => {
            const prod = parsed.find((p) => p.productId === ip.productId);
            if (prod) {
              if (ip.sold !== undefined) prod.sold = ip.sold;
              if (ip.stock !== undefined) prod.stock = ip.stock;
            }
          });
          localStorage.setItem(syncSoldKey, 'true');
          hasNew = true;
        }
        if (hasNew) {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading products from localStorage', e);
  }
  try {
    const syncSoldKey = 'flower_shop_sync_sold_v8';
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(syncSoldKey, 'true');
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
}

export function saveStoredProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage', e);
  }
  window.dispatchEvent(new Event('productsUpdated'));
  window.dispatchEvent(new Event('storage'));
}

const USERS_STORAGE_KEY = 'flower_shop_users';

const INITIAL_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    phone: '0901234567',
    email: 'admin@flowershop.vn',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    securityQuestion: 'Tên con vật nuôi đầu tiên của bạn là gì?',
    securityAnswer: 'mimi',
  },
  {
    username: 'user',
    password: 'user123',
    role: 'customer',
    phone: '0912345678',
    email: 'user@flowershop.vn',
    address: '45 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
    securityQuestion: 'Tên con vật nuôi đầu tiên của bạn là gì?',
    securityAnswer: 'mimi',
  },
  {
    username: 'customer1',
    password: 'cust123',
    role: 'customer',
    phone: '0987654321',
    email: 'customer1@gmail.com',
    address: '78 Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
    securityQuestion: 'Tên trường tiểu học đầu tiên của bạn là gì?',
    securityAnswer: 'nguyen hue',
  },
  {
    username: 'nguyenminh',
    password: 'user123',
    role: 'customer',
    phone: '0918123456',
    email: 'minh.nguyen@gmail.com',
    address: '12 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM',
    securityQuestion: 'Tên con vật nuôi đầu tiên của bạn là gì?',
    securityAnswer: 'mimi',
  },
  {
    username: 'lethao',
    password: 'user123',
    role: 'customer',
    phone: '0934567890',
    email: 'thao.le@gmail.com',
    address: '45 Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP.HCM',
    securityQuestion: 'Thành phố nơi bố mẹ bạn gặp nhau lần đầu là gì?',
    securityAnswer: 'da lat',
  },
  {
    username: 'tranhoang',
    password: 'user123',
    role: 'customer',
    phone: '0908765432',
    email: 'hoang.tran@gmail.com',
    address: '88 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
    securityQuestion: 'Tên trường tiểu học đầu tiên của bạn là gì?',
    securityAnswer: 'nguyen hue',
  },
  {
    username: 'phamhuong',
    password: 'user123',
    role: 'customer',
    phone: '0945123789',
    email: 'huong.pham@gmail.com',
    address: '120 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP.HCM',
    securityQuestion: 'Tên người bạn thân thời thơ ấu của bạn là gì?',
    securityAnswer: 'ngoc mai',
  },
  {
    username: 'vudung',
    password: 'user123',
    role: 'customer',
    phone: '0978901234',
    email: 'dung.vu@gmail.com',
    address: '250 Pasteur, Phường Võ Thị Sáu, Quận 3, TP.HCM',
    securityQuestion: 'Tên con vật nuôi đầu tiên của bạn là gì?',
    securityAnswer: 'kiki',
  },
  {
    username: 'doanmai',
    password: 'user123',
    role: 'customer',
    phone: '0963214587',
    email: 'mai.doan@gmail.com',
    address: '35 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
    securityQuestion: 'Món ăn yêu thích thuở nhỏ của bạn là gì?',
    securityAnswer: 'kem chuoi',
  },
  {
    username: 'hoangnam',
    password: 'user123',
    role: 'customer',
    phone: '0981234890',
    email: 'nam.hoang@gmail.com',
    address: '15 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, TP.HCM',
    securityQuestion: 'Tên cuốn sách đầu tiên bạn yêu thích là gì?',
    securityAnswer: 'hoang tu be',
  },
  {
    username: 'bichngoc',
    password: 'user123',
    role: 'customer',
    phone: '0923456712',
    email: 'ngoc.ngo@gmail.com',
    address: '60 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP.HCM',
    securityQuestion: 'Tên con vật nuôi đầu tiên của bạn là gì?',
    securityAnswer: 'meo meo',
  },
  {
    username: 'quoccuong',
    password: 'user123',
    role: 'customer',
    phone: '0938999888',
    email: 'cuong.dang@gmail.com',
    address: '102 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    securityQuestion: 'Thành phố nơi bố mẹ bạn gặp nhau lần đầu là gì?',
    securityAnswer: 'ha noi',
  },
  {
    username: 'kimyen',
    password: 'user123',
    role: 'customer',
    phone: '0971239876',
    email: 'yen.trinh@gmail.com',
    address: '55 Cách Mạng Tháng Tám, Phường 7, Quận Tân Bình, TP.HCM',
    securityQuestion: 'Tên trường tiểu học đầu tiên của bạn là gì?',
    securityAnswer: 'le quy don',
  },
];

// Safe base64 helpers that support UTF-8 (e.g. Vietnamese characters)
function safeBtoa(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    try {
      return btoa(str);
    } catch (err) {
      return '';
    }
  }
}

function safeAtob(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    try {
      return atob(b64);
    } catch (err) {
      return '';
    }
  }
}

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default accounts (admin, user, customer1) are always present
        const currentLower = parsed.map((u) => (u.username || '').toLowerCase());
        let changed = false;
        INITIAL_USERS.forEach((initUser) => {
          if (!currentLower.includes(initUser.username.toLowerCase())) {
            parsed.push({ ...initUser });
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading users from localStorage', e);
  }
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  } catch (e) {}
  return JSON.parse(JSON.stringify(INITIAL_USERS));
}

export function saveStoredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
  window.dispatchEvent(new Event('usersUpdated'));
  window.dispatchEvent(new Event('storage'));
}

// ==================== USE_MOCK flag ====================
// Set to true when backend is not available
const USE_MOCK = true;

// ==================== Axios Instance ====================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Helper: simulate delay ====================
function mockDelay(data, ms) {
  return new Promise((resolve) => setTimeout(() => resolve({ data }), ms || 300));
}

// ==================== Auth ====================
export function login(credentials) {
  if (USE_MOCK) {
    const users = getStoredUsers();
    const reqUsername = (credentials.username || '').trim().toLowerCase();
    const reqPassword = (credentials.password || '').trim();

    const user = users.find(
      (u) =>
        (u.username || '').trim().toLowerCase() === reqUsername &&
        (u.password || '').trim() === reqPassword
    );
    if (user) {
      // Create a fake JWT-like token: header.payload.signature
      const header = safeBtoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = safeBtoa(
        JSON.stringify({ sub: user.username, role: user.role, iat: Date.now() })
      );
      const signature = safeBtoa('mock-signature');
      const token = header + '.' + payload + '.' + signature;
      return mockDelay({ token }, 300);
    }
    return Promise.reject({ response: { data: { message: 'Tên đăng nhập hoặc mật khẩu không chính xác' } } });
  }
  return api.post('/login', credentials);
}

export function register(userData) {
  if (USE_MOCK) {
    const users = getStoredUsers();
    const username = (userData.username || '').trim();
    const password = (userData.password || '').trim();

    if (!username) {
      return Promise.reject({ response: { data: { message: 'Tên tài khoản không được để trống' } } });
    }
    if (password.length < 6) {
      return Promise.reject({ response: { data: { message: 'Mật khẩu phải có ít nhất 6 ký tự' } } });
    }
    if (users.some((u) => (u.username || '').trim().toLowerCase() === username.toLowerCase())) {
      return Promise.reject({ response: { data: { message: 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.' } } });
    }

    const newUser = {
      username: username,
      password: password,
      phone: (userData.phone || '').trim(),
      email: (userData.email || '').trim(),
      address: (userData.address || '').trim(),
      securityQuestion: userData.securityQuestion || 'Tên con vật nuôi đầu tiên của bạn là gì?',
      securityAnswer: (userData.securityAnswer || '').trim().toLowerCase(),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Create fake JWT token
    const header = safeBtoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = safeBtoa(
      JSON.stringify({ sub: newUser.username, role: newUser.role, iat: Date.now() })
    );
    const signature = safeBtoa('mock-signature');
    const token = header + '.' + payload + '.' + signature;

    return mockDelay({ user: newUser, token, message: 'Đăng ký tài khoản thành công!' }, 300);
  }
  return api.post('/register', userData);
}

export function getSecurityQuestion(username) {
  if (USE_MOCK) {
    const users = getStoredUsers();
    const user = users.find((u) => (u.username || '').trim().toLowerCase() === (username || '').trim().toLowerCase());
    if (user) {
      return mockDelay(
        {
          username: user.username,
          securityQuestion: user.securityQuestion || 'Tên con vật nuôi đầu tiên của bạn là gì?',
        },
        300
      );
    }
    return Promise.reject({ response: { data: { message: 'Không tìm thấy tài khoản với tên đăng nhập này' } } });
  }
  return api.get(`/auth/security-question/${encodeURIComponent(username)}`);
}

export function verifySecurityAnswer(username, answer) {
  if (USE_MOCK) {
    const users = getStoredUsers();
    const user = users.find((u) => (u.username || '').trim().toLowerCase() === (username || '').trim().toLowerCase());
    if (!user) {
      return Promise.reject({ response: { data: { message: 'Tài khoản không tồn tại' } } });
    }
    const stored = (user.securityAnswer || '').trim().toLowerCase();
    const input = (answer || '').trim().toLowerCase();
    if (stored && stored === input) {
      return mockDelay({ success: true, message: 'Xác thực câu trả lời thành công' }, 300);
    }
    return Promise.reject({ response: { data: { message: 'Câu trả lời bảo mật không chính xác' } } });
  }
  return api.post('/auth/verify-security-answer', { username, answer });
}

export function resetPassword(username, answer, newPassword) {
  if (USE_MOCK) {
    const users = getStoredUsers();
    const reqUsername = (username || '').trim().toLowerCase();
    const user = users.find((u) => (u.username || '').trim().toLowerCase() === reqUsername);
    if (!user) {
      return Promise.reject({ response: { data: { message: 'Tài khoản không tồn tại' } } });
    }
    const stored = (user.securityAnswer || '').trim().toLowerCase();
    const input = (answer || '').trim().toLowerCase();
    if (!stored || stored !== input) {
      return Promise.reject({ response: { data: { message: 'Câu trả lời bảo mật không chính xác' } } });
    }
    user.password = (newPassword || '').trim();
    saveStoredUsers(users);
    return mockDelay({ success: true, message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.' }, 300);
  }
  return api.post('/auth/reset-password', { username, answer, newPassword });
}

export function getUserProfile(username) {
  if (USE_MOCK) {
    const users = getStoredUsers();
    const user = users.find((u) => (u.username || '').trim().toLowerCase() === (username || '').trim().toLowerCase());
    if (user) {
      const { password, securityAnswer, ...safeUser } = user;
      return mockDelay(safeUser, 200);
    }
    return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy thông tin người dùng' } } });
  }
  return api.get(`/users/profile/${encodeURIComponent(username)}`);
}

export function getMe() {
  if (USE_MOCK) {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = JSON.parse(safeAtob(token.split('.')[1]));
        return mockDelay({ username: payload.sub, role: payload.role });
      } catch (e) {
        return mockDelay({ username: 'user', role: 'customer' });
      }
    }
    return Promise.reject({ response: { status: 401 } });
  }
  return api.get('/me');
}

// ==================== Products ====================
export function getProducts(params) {
  if (USE_MOCK) {
    let filtered = [...getStoredProducts()];
    if (params?.categoryId) {
      filtered = filtered.filter((p) => p.categoryId === Number(params.categoryId));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (params?.sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (params?.sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (params?.sort === 'name') filtered.sort((a, b) => a.productName.localeCompare(b.productName));
    if (params?.sort === 'best-selling') filtered.sort((a, b) => b.sold - a.sold);
    return mockDelay(filtered, 300);
  }
  return api.get('/products', { params });
}

export function getProduct(id) {
  if (USE_MOCK) {
    const products = getStoredProducts();
    const product = products.find((p) => p.productId === Number(id));
    if (product) return mockDelay(product, 200);
    return Promise.reject({ response: { status: 404, data: { message: 'Product not found' } } });
  }
  return api.get('/products/' + id);
}

export function addProduct(productData, isMultipart) {
  if (USE_MOCK) {
    const products = getStoredProducts();
    const newProduct = {
      ...productData,
      productId: Date.now(),
      sold: 0,
      image: productData.image || 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
    };
    products.unshift(newProduct);
    saveStoredProducts(products);
    return mockDelay(newProduct, 400);
  }
  if (isMultipart) {
    return api.post('/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/products', productData);
}

export function updateProduct(id, productData) {
  if (USE_MOCK) {
    const products = getStoredProducts();
    const idx = products.findIndex((p) => p.productId === Number(id));
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...productData };
      saveStoredProducts(products);
      return mockDelay(products[idx], 300);
    }
    return Promise.reject({ response: { status: 404 } });
  }
  return api.put('/products/' + id, productData);
}

export function deleteProduct(id) {
  if (USE_MOCK) {
    const products = getStoredProducts();
    const idx = products.findIndex((p) => p.productId === Number(id));
    if (idx >= 0) {
      const prod = products[idx];
      if ((prod.sold || 0) > 0) {
        return Promise.reject({
          response: {
            status: 400,
            data: { message: `Không thể xóa mẫu hoa "${prod.productName}" vì đã bán được ${prod.sold} sản phẩm!` },
          },
        });
      }
      products.splice(idx, 1);
      saveStoredProducts(products);
      return mockDelay({ message: 'Deleted' }, 200);
    }
    return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy sản phẩm' } } });
  }
  return api.delete('/products/' + id);
}

// ==================== Categories ====================
export function getCategories() {
  if (USE_MOCK) return mockDelay(MOCK_CATEGORIES, 200);
  return api.get('/categories');
}

// ==================== Reviews ====================
const REVIEWS_STORAGE_KEY = 'flower_shop_reviews_v8';

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((r) => r.reviewId));
        let changed = false;
        MOCK_REVIEWS.forEach((mr) => {
          if (!existingIds.has(mr.reviewId)) {
            parsed.push(mr);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {}
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(MOCK_REVIEWS));
  } catch (e) {}
  return [...MOCK_REVIEWS];
}

export function getReviews(productId) {
  if (USE_MOCK) {
    const all = getStoredReviews();
    const reviews = all.filter((r) => r.productId === Number(productId));
    return mockDelay(reviews, 300);
  }
  return api.get('/reviews/product/' + productId);
}

export function addReview(reviewData) {
  if (USE_MOCK) {
    const all = getStoredReviews();
    const newReview = {
      ...reviewData,
      reviewId: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    all.unshift(newReview);
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
    return mockDelay(newReview, 400);
  }
  return api.post('/reviews', reviewData);
}

export function getUserReviews(username) {
  if (USE_MOCK) {
    const all = getStoredReviews();
    const products = getStoredProducts();
    const userReviews = all
      .filter((r) => (r.username || '').trim().toLowerCase() === (username || '').trim().toLowerCase())
      .map((r) => {
        const prod = products.find((p) => p.productId === Number(r.productId));
        return {
          ...r,
          productName: prod ? prod.productName : `Sản phẩm #${r.productId}`,
          productImage: prod ? prod.image : null,
          productPrice: prod ? prod.price : null,
        };
      });
    return mockDelay(userReviews, 300);
  }
  return api.get(`/reviews/user/${encodeURIComponent(username)}`);
}

export function getAllReviews() {
  if (USE_MOCK) {
    const all = getStoredReviews();
    const products = getStoredProducts();
    const enriched = all.map((r) => {
      const prod = products.find((p) => p.productId === Number(r.productId));
      return {
        ...r,
        productName: prod ? prod.productName : `Sản phẩm #${r.productId}`,
        productImage: prod ? prod.image : null,
        productPrice: prod ? prod.price : null,
      };
    });
    return mockDelay(enriched, 300);
  }
  return api.get('/reviews');
}

// ==================== Orders ====================
export function createOrder(orderData) {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    let currentUsername = (orderData.username || '').trim();
    if (!currentUsername || currentUsername === 'user') {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        try {
          const payload = JSON.parse(safeAtob(token.split('.')[1]));
          if (payload.sub) currentUsername = payload.sub;
        } catch (e) {}
      }
    }
    const newOrder = {
      orderId: Date.now(),
      userId: 1,
      username: currentUsername || 'user',
      customerName: orderData.customerName || currentUsername || '',
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      total: orderData.total,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'COD',
    };
    // Prepend so newest order appears at the top for both user & admin
    orders.unshift(newOrder);
    saveStoredOrders(orders);
    return mockDelay(newOrder, 400);
  }
  return api.post('/orders', orderData);
}

export function getOrderHistory(targetUsername) {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    let currentUsername = targetUsername ? targetUsername.trim() : null;

    if (!currentUsername) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        try {
          const payload = JSON.parse(safeAtob(token.split('.')[1]));
          if (payload.role !== 'admin') {
            currentUsername = payload.sub;
          }
        } catch (e) {}
      }
    }

    if (currentUsername) {
      const filtered = orders.filter(
        (o) => (o.username || '').trim().toLowerCase() === currentUsername.trim().toLowerCase()
      );
      return mockDelay(filtered, 300);
    }

    return mockDelay(orders, 300);
  }
  return api.get('/orders/history');
}

export function getOrderDetail(id) {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    const order = orders.find((o) => o.orderId === Number(id));
    if (order) return mockDelay(order, 200);
    return Promise.reject({ response: { status: 404, data: { message: 'Order not found' } } });
  }
  return api.get('/orders/' + id);
}

export function updateOrderStatus(id, status) {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    const order = orders.find((o) => o.orderId === Number(id));
    if (order) {
      const prevStatus = order.status;
      order.status = status;

      // Auto-deduct stock when order is completed
      if (status === 'Completed' && prevStatus !== 'Completed') {
        const products = getStoredProducts();
        order.items?.forEach((item) => {
          const product = products.find((p) => p.productId === Number(item.productId));
          if (product) {
            product.stock = Math.max(0, product.stock - (Number(item.quantity) || 1));
            product.sold = (product.sold || 0) + (Number(item.quantity) || 1);
          }
        });
        saveStoredProducts(products);
      } else if (prevStatus === 'Completed' && status !== 'Completed') {
        // Rollback stock if order was uncompleted
        const products = getStoredProducts();
        order.items?.forEach((item) => {
          const product = products.find((p) => p.productId === Number(item.productId));
          if (product) {
            product.stock = product.stock + (Number(item.quantity) || 1);
            product.sold = Math.max(0, (product.sold || 0) - (Number(item.quantity) || 1));
          }
        });
        saveStoredProducts(products);
      }

      saveStoredOrders(orders);
      return mockDelay(order, 300);
    }
    return Promise.reject({ response: { status: 404 } });
  }
  return api.put('/orders/' + id + '/status', { status });
}

export function deleteOrder(id) {
  if (USE_MOCK) {
    let orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.orderId === Number(id));
    if (idx >= 0) {
      const order = orders[idx];
      // Orders that are paid / shipping / completed cannot be deleted
      if (order.status === 'Shipping' || order.status === 'Completed') {
        return Promise.reject({
          response: {
            status: 400,
            data: { message: `Đơn hàng #${id} đang ở trạng thái "${order.status === 'Shipping' ? 'Đang giao' : 'Đã nhận hàng'}" (đã xác nhận thanh toán/giao hàng), không thể xóa!` },
          },
        });
      }
      orders.splice(idx, 1);
      saveStoredOrders(orders);
      return mockDelay({ message: 'Deleted' }, 200);
    }
    return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy đơn hàng' } } });
  }
  return api.delete('/orders/' + id);
}

export function cancelOrderUser(orderId, reason) {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    const order = orders.find((o) => o.orderId === Number(orderId));
    if (!order) {
      return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy đơn hàng' } } });
    }
    // Customer can only cancel when order is Pending ("Đang xử lý") or Processing ("Đang lên đơn")
    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return Promise.reject({
        response: {
          status: 400,
          data: { message: 'Bạn chỉ có thể hủy đơn hàng khi đang ở trạng thái "Đang xử lý" hoặc "Đang lên đơn"!' },
        },
      });
    }
    order.status = 'Cancelled';
    order.cancelReason = reason || 'Người mua yêu cầu hủy đơn';
    order.cancelledAt = new Date().toISOString().split('T')[0];
    saveStoredOrders(orders);
    return mockDelay(order, 300);
  }
  return api.put(`/orders/${orderId}/cancel`, { reason });
}

export function updateOrderInfoUser(orderId, updatedData) {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    const order = orders.find((o) => o.orderId === Number(orderId));
    if (!order) {
      return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy đơn hàng' } } });
    }

    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return Promise.reject({
        response: {
          status: 400,
          data: { message: 'Bạn chỉ có thể chỉnh sửa thông tin khi đơn hàng đang ở trạng thái "Đang xử lý" hoặc "Đang lên đơn"!' },
        },
      });
    }

    if (updatedData.customerName) order.customerName = updatedData.customerName.trim();
    if (updatedData.phone) order.phone = updatedData.phone.trim();
    if (updatedData.address) order.address = updatedData.address.trim();
    if (updatedData.note !== undefined) order.note = updatedData.note.trim();

    const name = updatedData.customerName || order.customerName || '';
    const phone = updatedData.phone || order.phone || '';
    const address = updatedData.address || order.address || '';
    const note = updatedData.note !== undefined ? updatedData.note : (order.note || '');
    const payment = order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng';

    order.shippingAddress = `${name} | SĐT: ${phone} | Đ/C: ${address}${note ? ` | Ghi chú: ${note}` : ''} | Phương thức: ${payment}`;

    saveStoredOrders(orders);
    return mockDelay(order, 300);
  }
  return api.put(`/orders/${orderId}/shipping-info`, updatedData);
}

// ==================== Admin ====================
export function getAdminSummary() {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    const products = getStoredProducts();
    const totalOrders = orders.length;
    // Chỉ tính doanh thu của các đơn hàng đã thanh toán thành công (Completed), không tính đơn hủy hoặc chưa hoàn tất
    const completedOrders = orders.filter((o) => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
    // Sản phẩm bán chạy nhất: không hiển thị sản phẩm có 0 lượt bán
    const topProducts = [...products]
      .filter((p) => (p.sold || 0) > 0)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5);
    // Sản phẩm sắp hết: chỉ hiển thị khi tồn kho dưới 5
    const lowStock = products.filter((p) => (p.stock || 0) < 5);
    return mockDelay({ totalOrders, totalRevenue, topProducts, lowStock }, 300);
  }
  return api.get('/admin/summary');
}

export function getAllOrdersAdmin() {
  if (USE_MOCK) {
    const orders = getStoredOrders();
    return mockDelay(orders, 300);
  }
  return api.get('/orders');
}

export function getAllUsers() {
  if (USE_MOCK) {
    const users = getStoredUsers();
    return mockDelay(
      users.map((u, i) => ({
        userId: i + 1,
        username: u.username,
        role: u.role,
        phone: u.phone || '',
        email: u.email || '',
        address: u.address || '',
        securityQuestion: u.securityQuestion || '',
      })),
      300
    );
  }
  return api.get('/users');
}

export function updateUser(id, userData) {
  if (USE_MOCK) return mockDelay({ userId: id, ...userData }, 300);
  return api.put('/users/' + id, userData);
}

// ==================== Coupons ====================
export function applyCoupon(code) {
  if (USE_MOCK) {
    const coupons = { FLOWER10: 10, FLOWER20: 20, WELCOME: 15 };
    const discount = coupons[code.toUpperCase()];
    if (discount) return mockDelay({ code, discount }, 300);
    return Promise.reject({ response: { data: { message: 'Invalid coupon code' } } });
  }
  return api.post('/coupons/apply', { code });
}

export default api;
