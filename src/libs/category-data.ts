import type { Product } from '@/types/product'

const root = '/images/figma'
const categoryProducts: Product[] = [
  {
    id: 'gradient-graphic',
    image: `${root}/related-gradient-tshirt.png`,
    name: 'Gradient Graphic T-shirt',
    price: 145,
    rating: 3.5,
  },
  {
    id: 'polo-tipping',
    image: `${root}/related-tipping-polo.png`,
    name: 'Polo with Tipping Details',
    price: 180,
    rating: 4.5,
  },
  {
    id: 'black-striped',
    image: `${root}/related-black-striped-tshirt.png`,
    name: 'Black Striped T-shirt',
    price: 120,
    originalPrice: 150,
    discount: 30,
    rating: 5,
  },
  {
    id: 'skinny-jeans',
    image: `${root}/new-skinny-jeans.png`,
    name: 'Skinny Fit Jeans',
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: 3.5,
  },
  {
    id: 'checkered-shirt',
    image: `${root}/new-checkered-shirt.png`,
    name: 'Checkered Shirt',
    price: 180,
    rating: 4.5,
  },
  {
    id: 'sleeve-striped',
    image: `${root}/new-sleeve-striped-tshirt.png`,
    name: 'Sleeve Striped T-shirt',
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: 4.5,
  },
  {
    id: 'vertical-striped',
    image: `${root}/top-vertical-striped-shirt.png`,
    name: 'Vertical Striped Shirt',
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: 5,
  },
  {
    id: 'courage-tshirt',
    image: `${root}/top-courage-tshirt.png`,
    name: 'Courage Graphic T-shirt',
    price: 145,
    rating: 4,
  },
  {
    id: 'bermuda-shorts',
    image: `${root}/top-bermuda-shorts.png`,
    name: 'Loose Fit Bermuda Shorts',
    price: 80,
    rating: 3,
  },
]

export { categoryProducts }
