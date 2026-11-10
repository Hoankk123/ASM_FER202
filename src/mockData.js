// Mock data for development/testing
export const categories = [
  { cid: 1, cname: 'Hoa Hồng' },
  { cid: 2, cname: 'Hoa Cúc' },
  { cid: 3, cname: 'Hoa Lan' },
];

export const products = [
  {
    productId: 101,
    productName: 'Hoa Hồng Đỏ',
    description: 'Hoa hồng tươi đỏ, thích hợp cho ngày Valentine.',
    price: 120000,
    discount: 10,
    stock: 50,
    image: '/assets/rose-red.jpg',
    categoryId: 1,
    sold: 0,
  },
  {
    productId: 102,
    productName: 'Hoa Cúc Vàng',
    description: 'Hoa cúc vàng tươi, mang lại năng lượng tích cực.',
    price: 80000,
    discount: 0,
    stock: 30,
    image: '/assets/chrysanthemum-yellow.jpg',
    categoryId: 2,
    sold: 0,
  },
  {
    productId: 103,
    productName: 'Hoa Lan Trắng',
    description: 'Hoa lan trắng thanh lịch thích hợp cho tiệc cưới.',
    price: 200000,
    discount: 15,
    stock: 20,
    image: '/assets/orchid-white.jpg',
    categoryId: 3,
    sold: 0,
  },
];
