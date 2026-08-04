// Seed script for VeroAtelier luxury products
// Run with: node seed-products.js

const products = [
  // BAGS
  {
    name: 'Classic Monogram Canvas Speedy 30',
    brand: 'Louis Vuitton',
    description: 'Iconic LV monogram canvas handbag with natural cowhide leather trim and golden brass hardware. Features double zip closure, leather handles, and textile lining. A timeless investment piece in excellent condition with minimal signs of wear.',
    price: 1250,
    original_price: 1760,
    category: 'bags',
    subcategory: 'handbags',
    gender: 'women',
    size: 'One Size',
    condition: 'excellent',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 29,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop'
  },
  {
    name: 'GG Marmont Matelassé Shoulder Bag',
    brand: 'Gucci',
    description: 'Small matelassé leather shoulder bag with iconic double G hardware in antique gold-tone. Features chevron quilted design, chain shoulder strap, and suede lining. Worn twice, in pristine like-new condition.',
    price: 1580,
    original_price: 2350,
    category: 'bags',
    subcategory: 'shoulder bags',
    gender: 'women',
    size: 'Small',
    condition: 'like-new',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 33,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop'
  },
  {
    name: 'Saffiano Leather Briefcase',
    brand: 'Prada',
    description: 'Professional black Saffiano leather briefcase with signature triangular logo plaque. Double zip compartments, removable shoulder strap, and protective metal feet. Perfect for the modern professional.',
    price: 1890,
    original_price: 3200,
    category: 'bags',
    subcategory: 'briefcases',
    gender: 'unisex',
    size: 'One Size',
    condition: 'excellent',
    stock: 1,
    featured: false,
    is_on_sale: true,
    discount_percentage: 41,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop'
  },
  {
    name: 'Dionysus GG Supreme Canvas Bag',
    brand: 'Gucci',
    description: 'Medium Dionysus bag in beige/ebony GG Supreme canvas with brown leather trim. Features iconic tiger head closure, sliding chain strap, and suede-lined interior. A statement piece in excellent condition.',
    price: 1725,
    original_price: 2890,
    category: 'bags',
    subcategory: 'shoulder bags',
    gender: 'women',
    size: 'Medium',
    condition: 'excellent',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 40,
    image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop'
  },

  // SHOES
  {
    name: 'Ace Embroidered Leather Sneakers',
    brand: 'Gucci',
    description: 'White leather low-top sneakers with signature green and red Web stripe. Features embroidered bee detail, gold-tone eyelets, and rubber sole. Worn a handful of times, minimal creasing.',
    price: 425,
    original_price: 730,
    category: 'shoes',
    subcategory: 'sneakers',
    gender: 'unisex',
    size: '38, 39, 40, 41, 42',
    condition: 'like-new',
    stock: 5,
    featured: false,
    is_on_sale: true,
    discount_percentage: 42,
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop'
  },
  {
    name: 'Gancini Leather Loafers',
    brand: 'Salvatore Ferragamo',
    description: 'Classic black calfskin leather loafers with iconic Gancini bit hardware. Leather sole with rubber heel insert. Timeless design, barely worn with original dust bag included.',
    price: 385,
    original_price: 775,
    category: 'shoes',
    subcategory: 'loafers',
    gender: 'men',
    size: '40, 41, 42, 43, 44',
    condition: 'like-new',
    stock: 3,
    featured: false,
    is_on_sale: true,
    discount_percentage: 50,
    image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop'
  },
  {
    name: 'So Kate Patent Leather Pumps',
    brand: 'Christian Louboutin',
    description: 'Iconic black patent leather pointed-toe pumps with signature red lacquered sole. 120mm stiletto heel. Statement shoes in excellent condition with minimal wear to sole.',
    price: 485,
    original_price: 795,
    category: 'shoes',
    subcategory: 'heels',
    gender: 'women',
    size: '36, 37, 38, 39, 40',
    condition: 'excellent',
    stock: 4,
    featured: true,
    is_on_sale: true,
    discount_percentage: 39,
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop'
  },
  {
    name: 'Suede Chelsea Boots',
    brand: 'Saint Laurent',
    description: 'Black suede Chelsea boots with elastic side panels and signature YSL heel tab. Cuban heel, leather sole. Rock-and-roll elegance in pristine condition.',
    price: 595,
    original_price: 1095,
    category: 'shoes',
    subcategory: 'boots',
    gender: 'men',
    size: '40, 41, 42, 43, 44',
    condition: 'like-new',
    stock: 2,
    featured: false,
    is_on_sale: true,
    discount_percentage: 46,
    image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop'
  },

  // CLOTHING - HOODIES & JACKETS
  {
    name: 'Logo Embroidered Hoodie',
    brand: 'Balenciaga',
    description: 'Black cotton jersey hoodie with embroidered logo at chest. Oversized fit, kangaroo pocket, and ribbed cuffs. Contemporary streetwear luxury, worn once.',
    price: 485,
    original_price: 850,
    category: 'hoodies',
    subcategory: 'hoodies',
    gender: 'unisex',
    size: 'XS, S, M, L, XL',
    condition: 'like-new',
    stock: 4,
    featured: false,
    is_on_sale: true,
    discount_percentage: 43,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop'
  },
  {
    name: 'Wool Cashmere Peacoat',
    brand: 'Burberry',
    description: 'Navy blue wool and cashmere blend double-breasted peacoat. Features iconic check lining, notched lapels, and horn buttons. A British heritage piece in excellent condition.',
    price: 1250,
    original_price: 2390,
    category: 'hoodies',
    subcategory: 'coats',
    gender: 'men',
    size: 'S, M, L',
    condition: 'excellent',
    stock: 2,
    featured: true,
    is_on_sale: true,
    discount_percentage: 48,
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop'
  },
  {
    name: 'Lambskin Leather Biker Jacket',
    brand: 'Saint Laurent',
    description: 'Black lambskin leather biker jacket with asymmetric zip closure, notched collar, and silver-tone hardware. Slim fit with quilted shoulder panels. An edgy essential.',
    price: 2850,
    original_price: 4990,
    category: 'hoodies',
    subcategory: 'jackets',
    gender: 'unisex',
    size: 'S, M, L',
    condition: 'excellent',
    stock: 1,
    featured: true,
    is_on_sale: true,
    discount_percentage: 43,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop'
  },
  {
    name: 'Quilted Down Puffer Jacket',
    brand: 'Moncler',
    description: 'Black nylon laqué down puffer jacket with signature logo patch. Detachable hood, zip pockets, and snap-button closure. Warm and water-resistant, perfect for winter.',
    price: 985,
    original_price: 1750,
    category: 'hoodies',
    subcategory: 'jackets',
    gender: 'unisex',
    size: 'XS, S, M, L, XL',
    condition: 'like-new',
    stock: 3,
    featured: false,
    is_on_sale: true,
    discount_percentage: 44,
    image_url: 'https://images.unsplash.com/photo-1548126032-079446e92a0c?w=800&auto=format&fit=crop'
  },

  // CLOTHING - SHIRTS & TOPS
  {
    name: 'Silk Crêpe de Chine Blouse',
    brand: 'The Row',
    description: 'Ivory silk crêpe de chine blouse with relaxed fit and subtle sheen. Features V-neckline, long sleeves, and tonal buttons. Minimalist elegance, dry cleaned and ready to wear.',
    price: 520,
    original_price: 1190,
    category: 'shirts',
    subcategory: 'blouses',
    gender: 'women',
    size: 'XS, S, M',
    condition: 'like-new',
    stock: 2,
    featured: false,
    is_on_sale: true,
    discount_percentage: 56,
    image_url: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop'
  },
  {
    name: 'Classic Oxford Shirt',
    brand: 'Tom Ford',
    description: 'White cotton poplin Oxford shirt with mother-of-pearl buttons and French cuffs. Impeccable tailoring and premium fabric. A wardrobe staple in pristine condition.',
    price: 285,
    original_price: 590,
    category: 'shirts',
    subcategory: 'dress shirts',
    gender: 'men',
    size: 'S, M, L, XL',
    condition: 'like-new',
    stock: 3,
    featured: false,
    is_on_sale: true,
    discount_percentage: 52,
    image_url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&auto=format&fit=crop'
  },
  {
    name: 'Striped Cotton T-Shirt',
    brand: 'Saint James',
    description: 'Classic Breton stripe cotton jersey T-shirt in navy and white. Three-quarter sleeves, boat neckline. French maritime heritage meets timeless style.',
    price: 75,
    original_price: 95,
    category: 'shirts',
    subcategory: 't-shirts',
    gender: 'unisex',
    size: 'XS, S, M, L, XL',
    condition: 'excellent',
    stock: 6,
    featured: false,
    is_on_sale: false,
    discount_percentage: null,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop'
  },

  // CLOTHING - PANTS
  {
    name: 'High-Rise Wool Trousers',
    brand: 'Celine',
    description: 'Black virgin wool gabardine trousers with high-rise waist and wide leg. Side slash pockets, welt back pockets, and pressed crease. Sophisticated tailoring.',
    price: 685,
    original_price: 1350,
    category: 'pants',
    subcategory: 'trousers',
    gender: 'women',
    size: '34, 36, 38, 40',
    condition: 'like-new',
    stock: 3,
    featured: false,
    is_on_sale: true,
    discount_percentage: 49,
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop'
  },
  {
    name: 'Slim-Fit Selvedge Denim',
    brand: 'Acne Studios',
    description: 'Indigo Japanese selvedge denim jeans with slim fit through hip and thigh. Features contrast stitching, leather patch, and signature orange tab. Barely broken in.',
    price: 195,
    original_price: 320,
    category: 'pants',
    subcategory: 'jeans',
    gender: 'unisex',
    size: '28, 29, 30, 31, 32, 33, 34',
    condition: 'like-new',
    stock: 5,
    featured: false,
    is_on_sale: true,
    discount_percentage: 39,
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop'
  },
  {
    name: 'Pleated Chino Trousers',
    brand: 'Brunello Cucinelli',
    description: 'Beige cotton twill chinos with double pleats and tapered leg. Side adjusters at waist, turn-up cuffs. Italian craftsmanship and understated luxury.',
    price: 485,
    original_price: 995,
    category: 'pants',
    subcategory: 'chinos',
    gender: 'men',
    size: '30, 31, 32, 33, 34',
    condition: 'excellent',
    stock: 4,
    featured: false,
    is_on_sale: true,
    discount_percentage: 51,
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop'
  },

  // ACCESSORIES
  {
    name: 'Reversible Monogram Belt',
    brand: 'Louis Vuitton',
    description: 'Reversible belt in Monogram canvas and black leather with iconic LV buckle in gold-tone metal. Width 40mm. Adjustable and versatile, in pristine condition.',
    price: 375,
    original_price: 635,
    category: 'accessories',
    subcategory: 'belts',
    gender: 'unisex',
    size: '85, 90, 95, 100',
    condition: 'like-new',
    stock: 4,
    featured: false,
    is_on_sale: true,
    discount_percentage: 41,
    image_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583f2?w=800&auto=format&fit=crop'
  },
  {
    name: 'Cashmere Scarf with Fringe',
    brand: 'Hermès',
    description: 'Camel 100% cashmere scarf with hand-rolled fringe edges. Dimensions 140cm x 140cm. Incredibly soft and warm, an investment in timeless elegance.',
    price: 485,
    original_price: 795,
    category: 'accessories',
    subcategory: 'scarves',
    gender: 'unisex',
    size: 'One Size',
    condition: 'excellent',
    stock: 1,
    featured: false,
    is_on_sale: true,
    discount_percentage: 39,
    image_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop'
  },
  {
    name: 'Aviator Sunglasses',
    brand: 'Ray-Ban',
    description: 'Classic gold-frame aviator sunglasses with green G-15 lenses. 100% UV protection, adjustable nose pads. Iconic style that never goes out of fashion.',
    price: 125,
    original_price: 175,
    category: 'accessories',
    subcategory: 'sunglasses',
    gender: 'unisex',
    size: 'One Size',
    condition: 'excellent',
    stock: 2,
    featured: false,
    is_on_sale: false,
    discount_percentage: null,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop'
  },
  {
    name: 'Leather Cardholder',
    brand: 'Bottega Veneta',
    description: 'Black intrecciato woven leather cardholder with four card slots. Signature weave craftsmanship, slim profile. Discreet luxury for everyday carry.',
    price: 225,
    original_price: 390,
    category: 'accessories',
    subcategory: 'wallets',
    gender: 'unisex',
    size: 'One Size',
    condition: 'like-new',
    stock: 3,
    featured: false,
    is_on_sale: true,
    discount_percentage: 42,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop'
  }
];

console.log('Generated', products.length, 'products');
console.log('Copy these into Supabase SQL Editor:');
console.log('\n--- START SQL ---\n');

products.forEach((p, i) => {
  const values = `(
  '${p.name.replace(/'/g, "''")}',
  '${p.brand.replace(/'/g, "''")}',
  '${p.description.replace(/'/g, "''")}',
  ${p.price},
  ${p.original_price},
  '${p.category}',
  '${p.subcategory}',
  '${p.gender}',
  '${p.size}',
  '${p.condition}',
  '${p.image_url}',
  ARRAY['${p.image_url}']::text[],
  ${p.stock},
  ${p.featured},
  ${p.is_on_sale},
  ${p.discount_percentage}
)`;

  if (i === 0) {
    console.log(`INSERT INTO products (name, brand, description, price, original_price, category, subcategory, gender, size, condition, image_url, images, stock, featured, is_on_sale, discount_percentage) VALUES`);
  }

  console.log(values + (i < products.length - 1 ? ',' : ';'));
});

console.log('\n--- END SQL ---\n');
console.log(`\nTotal: ${products.length} products across categories:`);
console.log('- Bags: 4');
console.log('- Shoes: 4');
console.log('- Hoodies/Jackets: 4');
console.log('- Shirts: 3');
console.log('- Pants: 3');
console.log('- Accessories: 4');
